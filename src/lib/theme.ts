/**
 * One brand seed → every color on the page, in OKLCH.
 *
 * The shared shadcn-shaped tokens (--background, --card, --primary, …) are
 * generated with the same formulas stern uses in lib/theme-palette.ts, on
 * purpose: when these docs are framed inside a program's stern pages the two
 * surfaces have to look like one product, and matching the *algorithm* keeps
 * them agreeing even after either side changes its brand color.
 *
 * On top of that sit the tokens only the docs need — the panel/hairline/LED
 * language of the patch-panel sidebar and status strip. Those are derived from
 * the same seed hue, so a program's docs feel like its own equipment rather
 * than a grey chrome with a colored button in it.
 *
 * Pure and deterministic: the server renders these into a <style> tag and
 * nothing recomputes them client-side.
 */

import { clamp, hexToOklch, oklchToHex } from "@/lib/color";

export type Appearance = "light" | "dark";

/** What the extractor hands over: a primary brand color and a companion hue. */
export type ThemeSeed = {
  /** Drives text, surfaces and the accent. */
  brand: string;
  /** Second color for the status strip gradient and LED glow. */
  secondary: string;
  /** Where the colors came from — surfaced in the theme debug route. */
  source: "images" | "accent" | "fallback" | "override";
};

export type ThemeVars = Record<string, string>;

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const r1 = (n: number) => Math.round(n * 10) / 10;

function oklch(l: number, c: number, h: number, a?: number): string {
  const base = `${r3(l)} ${r3(c)} ${r1(h)}`;
  return a == null ? `oklch(${base})` : `oklch(${base} / ${a}%)`;
}

export function generateTokens(seed: ThemeSeed, appearance: Appearance): ThemeVars {
  const brand = hexToOklch(seed.brand);
  const second = hexToOklch(seed.secondary);
  const h = brand.h;
  const h2 = second.h;

  // Muted tint chroma scales with how saturated the brand is (a grey brand
  // yields grey neutrals) but is capped so surfaces never turn gaudy.
  const tint = (cap: number) => Math.min(brand.c, cap);

  // The accent itself, nudged into a vivid-but-usable band so a near-black or
  // near-white brand still reads as a deliberate accent.
  const accentL = clamp(brand.l, 0.45, 0.72);
  const accentC = Math.max(brand.c, 0.04);
  const primary = oklch(accentL, accentC, h);
  const primaryFg =
    accentL > 0.62 ? oklch(0.2, tint(0.02), h) : oklch(0.98, tint(0.008), h);

  const dark = appearance === "dark";

  const shared: ThemeVars = {
    "--primary": primary,
    "--primary-foreground": primaryFg,
    "--ring": primary,
    // Brand pair, kept raw for gradients, LEDs and glows.
    "--brand": oklch(accentL, accentC, h),
    "--brand-2": oklch(clamp(second.l, 0.5, 0.78), Math.max(second.c, 0.05), h2),
  };

  if (dark) {
    return {
      ...shared,
      "--background": oklch(0.16, tint(0.02), h),
      "--foreground": oklch(0.96, tint(0.012), h),
      "--card": oklch(0.213, tint(0.024), h),
      "--card-foreground": oklch(0.96, tint(0.012), h),
      "--popover": oklch(0.213, tint(0.024), h),
      "--popover-foreground": oklch(0.96, tint(0.012), h),
      "--secondary": oklch(0.27, tint(0.03), h),
      "--secondary-foreground": oklch(0.96, tint(0.012), h),
      "--muted": oklch(0.27, tint(0.024), h),
      "--muted-foreground": oklch(0.72, tint(0.02), h),
      "--accent": oklch(0.32, tint(0.05), h),
      "--accent-foreground": oklch(0.97, tint(0.012), h),
      "--border": oklch(0.99, 0, h, 12),
      "--input": oklch(0.99, 0, h, 15),

      // ── Docs-only: the equipment language ──────────────────────────────────
      /** Sidebar / strip chrome, a step darker than a card so panels read as fixtures. */
      "--panel": oklch(0.185, tint(0.022), h),
      /** Hairline between panels — brighter than --border, still not a line you look at. */
      "--hairline": oklch(0.99, 0, h, 9),
      /** Rack-unit grid over the page background. */
      "--grid": oklch(0.99, 0, h, 3),
      /** Top-edge highlight that makes a panel look milled rather than drawn. */
      "--sheen": oklch(1, 0, h, 7),
      /** Unlit port indicator. Never the only signal for state — labels bold too. */
      "--led-off": oklch(0.42, tint(0.02), h),
      "--led-glow": oklch(accentL, accentC, h, 45),
      /** Tinted wash behind callouts and the active sidebar row. */
      "--wash": oklch(accentL, accentC, h, 12),
      "--code-bg": oklch(0.19, tint(0.02), h),
      "--code-border": oklch(0.99, 0, h, 8),
      "--shadow-panel": `0 1px 0 ${oklch(1, 0, h, 6)}, 0 12px 32px -18px ${oklch(0, 0, h, 70)}`,
    };
  }

  return {
    ...shared,
    "--background": oklch(0.975, tint(0.01), h),
    "--foreground": oklch(0.2, tint(0.024), h),
    "--card": oklch(0.995, tint(0.006), h),
    "--card-foreground": oklch(0.2, tint(0.024), h),
    "--popover": oklch(0.995, tint(0.006), h),
    "--popover-foreground": oklch(0.2, tint(0.024), h),
    "--secondary": oklch(0.95, tint(0.03), h),
    "--secondary-foreground": oklch(0.24, tint(0.024), h),
    "--muted": oklch(0.955, tint(0.018), h),
    "--muted-foreground": oklch(0.46, tint(0.024), h),
    "--accent": oklch(0.95, tint(0.05), h),
    "--accent-foreground": oklch(0.24, tint(0.03), h),
    "--border": oklch(0.9, tint(0.02), h),
    "--input": oklch(0.9, tint(0.02), h),

    "--panel": oklch(0.99, tint(0.008), h),
    "--hairline": oklch(0.2, tint(0.02), h, 12),
    "--grid": oklch(0.2, tint(0.02), h, 3),
    "--sheen": oklch(1, 0, h, 80),
    "--led-off": oklch(0.82, tint(0.02), h),
    "--led-glow": oklch(accentL, accentC, h, 35),
    "--wash": oklch(accentL, accentC, h, 9),
    "--code-bg": oklch(0.985, tint(0.012), h),
    "--code-border": oklch(0.2, tint(0.02), h, 10),
    "--shadow-panel": `0 1px 0 ${oklch(1, 0, h, 90)}, 0 10px 30px -20px ${oklch(0.2, tint(0.02), h, 35)}`,
  };
}

/**
 * Serializes both appearances into one stylesheet. `:root` carries light, and
 * dark is applied by the `.dark` class next-themes puts on <html> — plus a
 * prefers-color-scheme fallback for the `system` case before hydration.
 */
export function themeCss(seed: ThemeSeed): string {
  const declare = (vars: ThemeVars) =>
    Object.entries(vars)
      .map(([key, value]) => `${key}:${value};`)
      .join("");

  const light = declare(generateTokens(seed, "light"));
  const dark = declare(generateTokens(seed, "dark"));

  return [
    `:root{color-scheme:light;${light}}`,
    `html.dark{color-scheme:dark;${dark}}`,
    `@media (prefers-color-scheme:dark){html:not(.light){color-scheme:dark;${dark}}}`,
  ].join("");
}

/**
 * Flat hex versions of the handful of colors the OG image needs. satori renders
 * with its own CSS subset and has no oklch() support, so the same seed is
 * resolved to sRGB here instead of being read from the page.
 */
export function ogColors(seed: ThemeSeed) {
  const brand = hexToOklch(seed.brand);
  const second = hexToOklch(seed.secondary);
  const tint = Math.min(brand.c, 0.02);
  return {
    background: oklchToHex(0.16, tint, brand.h),
    panel: oklchToHex(0.213, Math.min(brand.c, 0.024), brand.h),
    foreground: oklchToHex(0.96, Math.min(brand.c, 0.012), brand.h),
    muted: oklchToHex(0.72, Math.min(brand.c, 0.02), brand.h),
    brand: oklchToHex(clamp(brand.l, 0.5, 0.75), Math.max(brand.c, 0.05), brand.h),
    brand2: oklchToHex(
      clamp(second.l, 0.5, 0.78),
      Math.max(second.c, 0.05),
      second.h,
    ),
    hairline: oklchToHex(0.32, tint, brand.h),
  };
}
