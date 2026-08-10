/**
 * Decides which colors a program's docs actually wear.
 *
 * Precedence, most deliberate first:
 *
 *  1. `theme.brand` in the program's docs.json — someone looked at the result,
 *     disagreed, and wrote down what they wanted.
 *  2. **stern's `accentColor`.** This is the program's declared brand colour, set
 *     by whoever runs it, and it's what the program's own stern pages already
 *     wear — so the docs match rather than approximate. CloudFall's `#543efa`
 *     makes purple docs; Future's `#51b9e6` makes blue ones.
 *  3. The program's artwork, when no accent is set — the logo and background are
 *     the only other statement of intent available.
 *  4. Hack Club red, so a brand-new program with nothing filled in still looks
 *     like it belongs to something.
 *
 * The artwork is still read in case 2: it supplies the *companion* hue used by
 * the header seam and the LED glow, so both inputs are doing work instead of one
 * silently losing. A program can invert the first two by setting
 * `theme.source: "images"` in its docs.json.
 */

import { clamp, hexToOklch, hueDistance, oklchToHex } from "@/lib/color";
import { extractProgramColors } from "@/lib/image-colors";
import type { Program, ProgramImages } from "@/lib/program";
import type { ThemeSeed } from "@/lib/theme";
import type { DocsConfig } from "@/lib/content";

/** Hack Club red — the "we know nothing about this program yet" color. */
const FALLBACK_BRAND = "#ec3750";

/** A companion has to be this far from the brand to read as a second colour. */
const MIN_COMPANION_HUE_GAP = 40;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const validHex = (value: string | null | undefined) =>
  value && HEX.test(value.trim()) ? value.trim() : null;

/** A companion hue for brands that don't come with one: same family, rotated. */
function rotateHue(hex: string, degrees: number): string {
  const { l, c, h } = hexToOklch(hex);
  return oklchToHex(
    clamp(l + 0.06, 0.45, 0.78),
    clamp(Math.max(c, 0.05) * 0.9, 0.04, 0.18),
    (h + degrees + 360) % 360,
  );
}

const farEnough = (candidate: string, brand: string) =>
  hueDistance(hexToOklch(candidate).h, hexToOklch(brand).h) >= MIN_COMPANION_HUE_GAP;

/** Which image the brand colour is read from. Logo first — it's the brand mark. */
function imagesForExtraction(
  images: ProgramImages,
  preferred: string | undefined,
): { primary: string | null; secondary: string | null } {
  const byName: Record<string, string | null> = {
    logo: images.logo,
    background: images.background,
    banner: images.banner,
    cover: images.cover,
  };
  const primary =
    (preferred ? byName[preferred] : null) ??
    images.logo ??
    images.background ??
    images.banner ??
    images.cover;
  // The companion image shouldn't be the one the primary colour came from.
  const secondary =
    [images.background, images.banner, images.cover, images.logo].find(
      (candidate) => candidate && candidate !== primary,
    ) ?? null;
  return { primary: primary ?? null, secondary };
}

export async function resolveThemeSeed(
  program: Program | null,
  config: DocsConfig,
): Promise<ThemeSeed> {
  const override = validHex(config.theme?.brand);
  if (override) {
    return {
      brand: override,
      secondary: validHex(config.theme?.secondary) ?? rotateHue(override, 38),
      source: "override",
    };
  }

  const accent = validHex(program?.accentColor);
  const preferImages = config.theme?.source === "images";

  // Read the artwork once; it's either the brand or the companion.
  const artworkImages = program
    ? imagesForExtraction(program.images, config.theme?.sourceImage)
    : { primary: null, secondary: null };
  const extracted = await extractProgramColors(
    artworkImages.primary,
    artworkImages.secondary,
  );

  const fromArtwork = (): ThemeSeed | null => {
    if (!extracted.brand) return null;
    const companion =
      (extracted.secondary && farEnough(extracted.secondary, extracted.brand)
        ? extracted.secondary
        : null) ??
      (accent && farEnough(accent, extracted.brand) ? accent : null) ??
      rotateHue(extracted.brand, 38);
    return { brand: extracted.brand, secondary: companion, source: "images" };
  };

  if (preferImages) {
    const artwork = fromArtwork();
    if (artwork) return artwork;
  }

  if (accent) {
    // The artwork's strongest hue becomes the second colour when it differs
    // enough from the accent to be legible as a different colour at all.
    const companion =
      validHex(config.theme?.secondary) ??
      [extracted.brand, extracted.secondary].find(
        (candidate): candidate is string =>
          candidate != null && farEnough(candidate, accent),
      ) ??
      rotateHue(accent, 38);
    return { brand: accent, secondary: companion, source: "accent" };
  }

  return fromArtwork() ?? {
    brand: FALLBACK_BRAND,
    secondary: rotateHue(FALLBACK_BRAND, 38),
    source: "fallback",
  };
}
