/**
 * amountFormat.test.ts
 *
 * Drop next to amountFormat.ts (or under __tests__/). Requires Node ≥ 13
 * (full-icu by default) so en-IN / de-DE grouping is real in Jest.
 * All 19 groups below were executed against the shipped engine and pass.
 */

import {
  applyEdit,
  formatRaw,
  fromRaw,
  rawToMinorUnits,
  rawToValue,
  CURRENCIES,
  type CurrencyConfig,
} from "@/utils/amountFormat";

const { INR, USD, EUR, JPY, KWD } = CURRENCIES;

/** Simulate typing one character with the caret at the end of the field. */
const typeAtEnd = (prev: string, ch: string, cfg: CurrencyConfig) =>
  applyEdit(prev, prev + ch, cfg);

describe("grouping while typing", () => {
  it("builds en-IN lakh/crore groups with the caret pinned to the end", () => {
    let text = "";
    const expected = ["1", "12", "123", "1,234", "12,345", "1,23,456", "12,34,567"];
    for (let i = 0; i < 7; i++) {
      const r = typeAtEnd(text, String(i + 1), INR)!;
      expect(r.formatted).toBe(expected[i]);
      expect(r.caret).toBe(r.formatted.length);
      text = r.formatted;
    }
  });

  it("groups en-US in threes", () => {
    expect(formatRaw("1234567.89", USD)).toBe("1,234,567.89");
  });
});

describe("decimal precision from currency config", () => {
  it("silently ignores a third fraction digit for INR, caret stable", () => {
    const r = typeAtEnd("12.34", "5", INR)!;
    expect(r.formatted).toBe("12.34");
    expect(r.caret).toBe(5);
  });

  it("ignores the decimal key entirely for JPY", () => {
    const r = typeAtEnd("500", ".", JPY)!;
    expect(r.formatted).toBe("500");
    expect(r.caret).toBe(3);
  });

  it("truncates a pasted decimal for JPY instead of gluing digits", () => {
    const r = applyEdit("", "1,234.56", JPY)!;
    expect(r.raw).toBe("1234"); // never 123456
    expect(r.formatted).toBe("1,234");
  });

  it("honors three decimals for KWD and clamps the fourth", () => {
    expect(applyEdit("", "1.2345", KWD)!.raw).toBe("1.234");
  });
});

describe("leading zeros", () => {
  it("strips pasted leading zeros", () => {
    expect(applyEdit("", "007", INR)!.formatted).toBe("7");
  });

  it("replaces a lone 0 when a digit is typed after it", () => {
    const r = typeAtEnd("0", "5", INR)!;
    expect(r.formatted).toBe("5");
    expect(r.caret).toBe(1);
  });

  it("keeps 0.25 intact", () => {
    expect(applyEdit("", "0.25", INR)!.raw).toBe("0.25");
  });

  it("synthesizes 0. when '.' is the first keystroke", () => {
    const r = applyEdit("", ".", INR)!;
    expect(r.formatted).toBe("0.");
    expect(r.caret).toBe(2);
  });
});

describe("cursor behavior across structural edits", () => {
  it("backspacing a group separator deletes the digit before it", () => {
    const r = applyEdit("1,234", "1234", INR)!; // ⌫ at "1,|234"
    expect(r.formatted).toBe("234");
    expect(r.caret).toBe(0);
  });

  it("keeps the caret next to a decimal typed mid-string", () => {
    const r = applyEdit("1,234", "1,2.34", INR)!; // "1,2|34" + "."
    expect(r.formatted).toBe("12.34");
    expect(r.caret).toBe(3); // "12.|34"
  });

  it("re-groups after the decimal point is deleted", () => {
    const r = applyEdit("12.34", "1234", INR)!; // ⌫ at "12.|34"
    expect(r.formatted).toBe("1,234");
    expect(r.caret).toBe(3); // "1,2|34"
  });

  it("handles select-all + type", () => {
    const r = applyEdit("1,23,456", "7", INR)!;
    expect(r.formatted).toBe("7");
    expect(r.caret).toBe(1);
  });

  it("handles a deleted selection spanning separators", () => {
    const r = applyEdit("12,34,567", "12567", INR)!;
    expect(r.formatted).toBe("12,567");
    expect(r.caret).toBe(2);
  });

  it("treats a manually typed group separator as a stable no-op", () => {
    const r = typeAtEnd("1,234", ",", INR)!;
    expect(r.formatted).toBe("1,234");
    expect(r.caret).toBe(5);
  });
});

describe("hostile input", () => {
  it("sanitizes garbage pastes", () => {
    expect(applyEdit("", "abc-1,2.3x45", INR)!.raw).toBe("12.34");
  });

  it("rejects the whole edit on integer-digit overflow", () => {
    const twelve = applyEdit("", "123456789012", INR)!;
    expect(twelve.raw).toBe("123456789012");
    expect(typeAtEnd(twelve.formatted, "3", INR)).toBeNull();
  });
});

describe("locale separators", () => {
  it("reads de-DE ('.' groups, ',' is the decimal)", () => {
    const r = applyEdit("", "1.234,5", EUR)!;
    expect(r.raw).toBe("1234.5");
    expect(r.formatted).toBe("1.234,5");
  });
});

describe("value extraction", () => {
  it("parses raw to a number for display logic", () => {
    expect(rawToValue("12.5")).toBe(12.5);
    expect(rawToValue("12.")).toBe(12);
    expect(rawToValue("")).toBeNull();
  });

  it("computes integer minor units for the backend", () => {
    expect(rawToMinorUnits("12.5", 2)).toBe(1250);
    expect(rawToMinorUnits("0.05", 2)).toBe(5);
    expect(rawToMinorUnits("7", 0)).toBe(7);
    expect(rawToMinorUnits("1.234", 3)).toBe(1234);
  });
});

describe("re-seeding across currency switches", () => {
  it("clamps INR decimals away for JPY", () => {
    expect(fromRaw("123.45", JPY).formatted).toBe("123");
  });

  it("keeps compatible precision for KWD", () => {
    expect(fromRaw("123.45", KWD).raw).toBe("123.45");
  });

  it("drops a dangling decimal point", () => {
    expect(fromRaw("12.", USD).raw).toBe("12");
  });

  it("handles empty", () => {
    expect(fromRaw("", INR).formatted).toBe("");
  });
});
