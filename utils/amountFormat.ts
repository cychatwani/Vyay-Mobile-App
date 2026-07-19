/**
 * amountFormat.ts
 *
 * Pure, platform-agnostic engine behind <AmountInput />.
 *
 * Design:
 *  - The single source of truth is a canonical "raw" string:
 *      /^$|^(0|[1-9]\d*)(\.\d*)?$/   (always "." as the decimal marker)
 *  - The display string is derived: locale grouping + locale decimal separator.
 *  - Every native edit (insert / delete / selection-replace / paste) is resolved
 *    by diffing the previous display string against the new native text, then
 *    sanitizing character-by-character. Invalid characters are dropped, never
 *    bounced back to the user — the field can simply never hold an invalid value.
 *  - The caret is tracked as "number of significant characters (digits + decimal
 *    marker) to the left of the caret", which survives re-formatting exactly.
 *
 * No React, no React Native — unit test this in plain Node/Jest.
 */

export interface CurrencyConfig {
  /** ISO 4217 code, e.g. "INR" */
  code: string;
  /** Display symbol, e.g. "₹" */
  symbol: string;
  /** Minor-unit digits per ISO 4217: JPY → 0, INR/USD → 2, KWD → 3 */
  decimalDigits: number;
  /** BCP 47 locale that drives grouping + separators, e.g. "en-IN" → 12,34,567 */
  locale: string;
  /**
   * Hard cap on integer digits. Defaults to 12. Values are clamped to 15 so the
   * grouped integer part always stays within Number's exact range.
   */
  maxIntegerDigits?: number;
}

/** Reference configs. In the app, source these from the currency catalog. */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", decimalDigits: 2, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", decimalDigits: 2, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", decimalDigits: 2, locale: "de-DE" },
  JPY: { code: "JPY", symbol: "¥", decimalDigits: 0, locale: "ja-JP" },
  KWD: { code: "KWD", symbol: "د.ك", decimalDigits: 3, locale: "en-KW" },
};

export interface EditResult {
  /** Canonical value, e.g. "1234.5" (or "" when empty) */
  raw: string;
  /** Display value, e.g. "1,234.5" */
  formatted: string;
  /** Caret index within `formatted` */
  caret: number;
}

const ABSOLUTE_MAX_INT_DIGITS = 15;

interface Separators {
  group: string;
  decimal: string;
}

// ---------------------------------------------------------------------------
// Locale plumbing (cached — Intl.NumberFormat construction is expensive)
// ---------------------------------------------------------------------------

const sepCache = new Map<string, Separators>();

export function getSeparators(locale: string): Separators {
  let seps = sepCache.get(locale);
  if (!seps) {
    let group = ",";
    let decimal = ".";
    try {
      for (const part of new Intl.NumberFormat(locale).formatToParts(1234567.8)) {
        if (part.type === "group") group = part.value;
        if (part.type === "decimal") decimal = part.value;
      }
    } catch {
      // Unknown locale → keep en-style defaults.
    }
    seps = { group, decimal };
    sepCache.set(locale, seps);
  }
  return seps;
}

const intFmtCache = new Map<string, Intl.NumberFormat>();

function intFormatter(locale: string): Intl.NumberFormat {
  let fmt = intFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: true,
    });
    intFmtCache.set(locale, fmt);
  }
  return fmt;
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function maxIntDigits(cfg: CurrencyConfig): number {
  return Math.min(cfg.maxIntegerDigits ?? 12, ABSOLUTE_MAX_INT_DIGITS);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Canonical raw → localized display string. Trailing "." and "50" states are preserved. */
export function formatRaw(raw: string, cfg: CurrencyConfig): string {
  if (raw === "") return "";
  const seps = getSeparators(cfg.locale);
  const dot = raw.indexOf(".");
  const intPart = dot === -1 ? raw : raw.slice(0, dot);
  const fracPart = dot === -1 ? "" : raw.slice(dot + 1);
  const grouped = intFormatter(cfg.locale).format(Number(intPart || "0"));
  return dot === -1 ? grouped : grouped + seps.decimal + fracPart;
}

/** Caret index in `formatted` immediately after `sig` significant characters. */
function caretForSig(formatted: string, sig: number, seps: Separators): number {
  if (sig <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i];
    if (isDigit(ch) || ch === seps.decimal) {
      count++;
      if (count === sig) return i + 1;
    }
  }
  return formatted.length;
}

// ---------------------------------------------------------------------------
// The edit pipeline
// ---------------------------------------------------------------------------

/**
 * Resolve one native edit.
 *
 * @param prevFormatted  Display string currently committed (what native showed
 *                       before the keystroke).
 * @param nextText       The text reported by onChangeText.
 * @returns              The next committed state, or `null` when the edit must
 *                       be rejected wholesale (integer-digit overflow) — the
 *                       caller reverts native text and gives feedback.
 */
export function applyEdit(
  prevFormatted: string,
  nextText: string,
  cfg: CurrencyConfig,
): EditResult | null {
  const seps = getSeparators(cfg.locale);

  // -- 1. Diff: common prefix / suffix locate the edited span and the caret. --
  let p = 0;
  const maxP = Math.min(prevFormatted.length, nextText.length);
  while (p < maxP && prevFormatted[p] === nextText[p]) p++;
  let s = 0;
  while (
    s < prevFormatted.length - p &&
    s < nextText.length - p &&
    prevFormatted[prevFormatted.length - 1 - s] === nextText[nextText.length - 1 - s]
  ) {
    s++;
  }
  const removed = prevFormatted.slice(p, prevFormatted.length - s);
  const inserted = nextText.slice(p, nextText.length - s);

  // -- 2. Backspacing a group separator deletes the digit before it. ----------
  // Otherwise "1,|234" ⌫ would strip the comma, re-format, and reinsert it —
  // a keystroke that visibly does nothing.
  let candidate = nextText;
  let caretIndex = p + inserted.length;
  if (
    inserted === "" &&
    removed === seps.group &&
    p > 0 &&
    isDigit(prevFormatted[p - 1])
  ) {
    candidate = prevFormatted.slice(0, p - 1) + prevFormatted.slice(p + 1);
    caretIndex = p - 1;
  }
  const insStart = p;
  const insEnd = p + inserted.length; // candidate coords (candidate === nextText here)

  // -- 3. Sanitize: keep digits + at most one decimal marker. -----------------
  // Also count significant chars left of the caret so the caret survives
  // re-formatting exactly.
  const rawChars: string[] = [];
  let hasDecimal = false;
  let fracLen = 0;
  let sigBeforeCaret = 0;
  // When pasted text contains a decimal we can't honor (JPY, or a second "."),
  // digits after it inside the pasted span are dropped too: "1234.56" → JPY 1234,
  // never 123456.
  let killUntil = -1;

  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i];
    let keep: string | null = null;
    if (isDigit(ch)) {
      if (i < killUntil) {
        // dropped: fraction of an unhonorable decimal within this edit
      } else if (!hasDecimal) {
        keep = ch;
      } else if (fracLen < cfg.decimalDigits) {
        fracLen++;
        keep = ch;
      }
      // else: over-precision digit → silently ignored, caret stays put
    } else if (ch === seps.decimal || (ch === "." && seps.group !== ".")) {
      // "." is always accepted as a decimal marker unless this locale uses it
      // for grouping (hardware keyboards / pasted en-style strings).
      if (!hasDecimal && cfg.decimalDigits > 0) {
        hasDecimal = true;
        keep = ".";
      } else if (i >= insStart && i < insEnd) {
        killUntil = insEnd;
      }
    }
    // Everything else (group separators, letters, symbols, "-") is dropped.

    if (keep !== null) {
      rawChars.push(keep);
      if (i < caretIndex) sigBeforeCaret++;
    }
  }

  // -- 4. Normalize. ----------------------------------------------------------
  let raw = rawChars.join("");
  if (raw !== "") {
    const dot = raw.indexOf(".");
    let intPart = dot === -1 ? raw : raw.slice(0, dot);
    const fracPart = dot === -1 ? "" : raw.slice(dot + 1);

    // "." typed first → "0." (Cash-App-style affordance)
    if (intPart === "") {
      intPart = "0";
      if (sigBeforeCaret >= 1) sigBeforeCaret += 1;
    }

    // Leading zeros: "007" → "7", "00" → "0"; "0.25" is untouched.
    let strip = 0;
    while (strip < intPart.length - 1 && intPart[strip] === "0") strip++;
    if (strip > 0) {
      intPart = intPart.slice(strip);
      sigBeforeCaret = Math.max(0, sigBeforeCaret - strip);
    }

    // Overflow → reject the whole edit; caller reverts + shakes.
    if (intPart.length > maxIntDigits(cfg)) return null;

    raw = intPart + (hasDecimal ? "." + fracPart : "");
  }

  const formatted = formatRaw(raw, cfg);
  const caret = caretForSig(formatted, sigBeforeCaret, getSeparators(cfg.locale));
  return { raw, formatted, caret };
}

/**
 * Sanitize a WHOLE display string to canonical raw + formatted, order- and
 * history-independent (no diff against a previous value).
 *
 * This is what <AmountInput /> uses on every keystroke. Diffing prev-vs-next
 * to locate a single edit is fragile on Android: a fast typist queues several
 * native onChangeText events before React commits a render, so multiple keys
 * collapse into one diff and get misread (digits scramble, caret drifts).
 * Re-deriving the value from the full text each time makes every event
 * self-consistent regardless of ordering or batching. The caret is left to the
 * OS (it stays at the end while appending, which is the whole interaction).
 *
 * Returns null only on integer-digit overflow — the caller reverts + shakes.
 */
export function sanitizeFull(
  text: string,
  cfg: CurrencyConfig,
): { raw: string; formatted: string } | null {
  const seps = getSeparators(cfg.locale);
  const rawChars: string[] = [];
  let hasDecimal = false;
  let fracLen = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isDigit(ch)) {
      if (!hasDecimal) {
        rawChars.push(ch);
      } else if (fracLen < cfg.decimalDigits) {
        fracLen++;
        rawChars.push(ch);
      }
      // else: over-precision digit → dropped
    } else if (ch === seps.decimal || (ch === "." && seps.group !== ".")) {
      if (!hasDecimal && cfg.decimalDigits > 0) {
        hasDecimal = true;
        rawChars.push(".");
      }
      // else: second decimal / unhonorable marker → dropped
    }
    // Everything else (group separators, letters, "-", symbols) is dropped.
  }

  let raw = rawChars.join("");
  if (raw !== "") {
    const dot = raw.indexOf(".");
    let intPart = dot === -1 ? raw : raw.slice(0, dot);
    const fracPart = dot === -1 ? "" : raw.slice(dot + 1);

    // "." typed first → "0." (Cash-App-style affordance).
    if (intPart === "") intPart = "0";

    // Leading zeros: "007" → "7", "00" → "0"; "0.25" untouched.
    let strip = 0;
    while (strip < intPart.length - 1 && intPart[strip] === "0") strip++;
    if (strip > 0) intPart = intPart.slice(strip);

    // Overflow → reject the whole edit; caller reverts + shakes.
    if (intPart.length > maxIntDigits(cfg)) return null;

    raw = intPart + (hasDecimal ? "." + fracPart : "");
  }

  return { raw, formatted: formatRaw(raw, cfg) };
}

// ---------------------------------------------------------------------------
// Seeding / re-seeding (initial value, currency switches)
// ---------------------------------------------------------------------------

/**
 * Interpret `input` as a canonical raw string ("." is always the decimal
 * marker, regardless of locale) and clamp it to `cfg`. Used for `initialRaw`
 * and when the currency prop changes mid-flow (INR "123.45" → JPY "123").
 */
export function fromRaw(input: string, cfg: CurrencyConfig): { raw: string; formatted: string } {
  const dot = input.indexOf(".");
  let intPart = (dot === -1 ? input : input.slice(0, dot)).replace(/\D/g, "");
  const frac =
    cfg.decimalDigits > 0 && dot !== -1
      ? input.slice(dot + 1).replace(/\D/g, "").slice(0, cfg.decimalDigits)
      : "";
  intPart = intPart.replace(/^0+(?=\d)/, "");
  intPart = intPart.slice(0, maxIntDigits(cfg));
  const raw =
    intPart === ""
      ? frac !== ""
        ? "0." + frac
        : ""
      : intPart + (frac !== "" ? "." + frac : "");
  return { raw, formatted: formatRaw(raw, cfg) };
}

// ---------------------------------------------------------------------------
// Value extraction
// ---------------------------------------------------------------------------

/** "12.5" → 12.5, "12." → 12, "" → null. Display/validation only — never do money math on this. */
export function rawToValue(raw: string): number | null {
  if (raw === "") return null;
  const n = Number(raw.endsWith(".") ? raw.slice(0, -1) : raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * "12.5" with 2 decimals → 1250 (paise). The integer the backend should store.
 * Exact for maxIntegerDigits ≤ 15 − decimalDigits.
 */
export function rawToMinorUnits(raw: string, decimalDigits: number): number {
  if (raw === "") return 0;
  const dot = raw.indexOf(".");
  const intPart = dot === -1 ? raw : raw.slice(0, dot);
  const frac = (dot === -1 ? "" : raw.slice(dot + 1)).padEnd(decimalDigits, "0");
  return Number((intPart || "0") + frac);
}
