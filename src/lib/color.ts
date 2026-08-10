/**
 * sRGB ↔ OKLCH, both directions.
 *
 * Two consumers need the round trip: the theme generator works in OKLCH
 * (perceptual lightness is what makes "text is always legible on its surface" a
 * property of the math rather than of luck), while the OG image renderer can
 * only emit hex, because satori has no oklch() support.
 *
 * The forward half matches stern's lib/theme-palette.ts so a docs page framed
 * inside stern resolves to the same tokens rather than a near-miss.
 */

export type Oklch = { l: number; c: number; h: number };

function srgbToLinear(v: number): number {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const n = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(n * 255)));
}

/** Hex (#rgb or #rrggbb) → OKLCH. Falls back to a neutral mid-grey on garbage. */
export function hexToOklch(hex: string): Oklch {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return { l: 0.6, c: 0, h: 0 };
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return rgbToOklch(
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  );
}

export function rgbToOklch(r8: number, g8: number, b8: number): Oklch {
  const r = srgbToLinear(r8);
  const g = srgbToLinear(g8);
  const b = srgbToLinear(b8);

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  let hue = (Math.atan2(bb, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return { l: L, c, h: hue };
}

/** OKLCH → `#rrggbb`, gamut-clamped by desaturating rather than clipping. */
export function oklchToHex(l: number, c: number, h: number): string {
  let chroma = c;
  for (let attempt = 0; attempt < 24; attempt++) {
    const rgb = oklchToRgbUnclamped(l, chroma, h);
    const inGamut = rgb.every((v) => v >= -0.001 && v <= 1.001);
    if (inGamut || chroma < 0.001) {
      const [r, g, b] = rgb.map(linearToSrgb);
      return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    }
    // Clipping channels shifts hue; pulling chroma in keeps it.
    chroma *= 0.92;
  }
  return "#808080";
}

function oklchToRgbUnclamped(
  L: number,
  C: number,
  H: number,
): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  const a = Math.cos(hRad) * C;
  const b = Math.sin(hRad) * C;

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Shortest signed distance between two hues, in degrees. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
