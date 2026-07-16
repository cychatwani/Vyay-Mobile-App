/**
 * Mix a hex colour toward white (amount > 0) or black (amount < 0).
 *
 * This is how the "soft lighting" gradients across the app are built: two
 * stops derived from the live brand token (e.g. +7% / −5%) instead of
 * hardcoded hex pairs. Components share the lighting language while the
 * gradient automatically tracks theme (light/dark brand values differ) and
 * any future rebrand.
 */
export const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * a);
  const r = mix((n >> 16) & 0xff);
  const g = mix((n >> 8) & 0xff);
  const b = mix(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};
