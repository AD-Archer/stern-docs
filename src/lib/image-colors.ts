/**
 * Reads a program's brand colors out of its own artwork.
 *
 * The program's logo and background live on Hack Club's CDN and are the things
 * an organiser actually iterates on  swapping the banner for a new one is how a
 * round changes its look. So the docs derive their palette from those images
 * rather than from a hex value someone has to remember to keep in sync.
 *
 * How the two colors are chosen:
 *
 *  - Pixels are downsampled hard (48px longest edge  this is a color question,
 *    not a detail question), converted to OKLCH, and near-neutral or
 *    near-black/near-white pixels are discarded. Logos are mostly flat white or
 *    transparent; those pixels carry no identity.
 *  - Survivors are binned by hue and scored on *prevalence × vividness*, so a
 *    large muddy region can't outvote the actual brand mark, and a single vivid
 *    stray pixel can't either.
 *  - The winning bin becomes the brand; the best bin at least 40° away becomes
 *    the companion color used by the status strip and LED glow.
 *
 * Everything is best-effort. An image that 404s, a sharp binary that won't load
 * on the host, an all-grey logo  each falls back to the program's declared
 * accentColor, and then to a fixed default. A docs page never fails to render
 * because color extraction had a bad day.
 */

import { clamp, hueDistance, oklchToHex, rgbToOklch } from "@/lib/color";

/** One hue family found in an image. */
type Swatch = {
  hue: number;
  lightness: number;
  chroma: number;
  weight: number;
};

const BIN_COUNT = 24; // 15° per bin  wide enough that dithering lands together.
const MAX_BYTES = 8 * 1024 * 1024;
const TTL_MS = 60 * 60 * 1000;

/**
 * Per-URL result cache. Extraction is pure for a given URL and the answer is
 * two hex strings, so a process-local map is the whole caching story  no data
 * cache entry holding megabytes of PNG, and nothing to invalidate but time.
 */
const cache = new Map<string, { at: number; swatches: Swatch[] }>();

async function loadSwatches(url: string): Promise<Swatch[]> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.swatches;

  const swatches = await extractSwatches(url);
  cache.set(url, { at: Date.now(), swatches });
  return swatches;
}

async function extractSwatches(url: string): Promise<Swatch[]> {
  let pixels: Buffer;
  let channels: number;
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];

    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > MAX_BYTES) return [];

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return [];

    // Imported lazily: sharp is a native module, and a host that can't load
    // libvips should lose the themed palette, not the whole site.
    const sharp = (await import("sharp")).default;
    const raw = await sharp(bytes)
      .resize(48, 48, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    pixels = raw.data;
    channels = raw.info.channels;
  } catch {
    return [];
  }

  const bins = Array.from({ length: BIN_COUNT }, () => ({
    weight: 0,
    l: 0,
    c: 0,
    hueX: 0,
    hueY: 0,
  }));
  let sampled = 0;

  for (let i = 0; i + channels - 1 < pixels.length; i += channels) {
    const alpha = channels >= 4 ? pixels[i + 3] : 255;
    if (alpha < 128) continue; // Transparent logo padding.
    sampled++;

    const { l, c, h } = rgbToOklch(pixels[i], pixels[i + 1], pixels[i + 2]);
    // Greys carry no hue, and the extremes are page background and highlight.
    if (c < 0.03 || l < 0.12 || l > 0.95) continue;

    const bin =
      bins[Math.min(BIN_COUNT - 1, Math.floor((h / 360) * BIN_COUNT))];
    // Vividness weighting: a pixel's vote scales with its own chroma, so the
    // brand mark beats a big wash of desaturated background.
    const weight = c;
    bin.weight += weight;
    bin.l += l * weight;
    bin.c += c * weight;
    // Hue averaged as a vector, so a family straddling 0°/360° doesn't average
    // to cyan.
    const rad = (h * Math.PI) / 180;
    bin.hueX += Math.cos(rad) * weight;
    bin.hueY += Math.sin(rad) * weight;
  }

  if (sampled === 0) return [];

  return bins
    .filter((bin) => bin.weight > 0)
    .map((bin) => {
      let hue = (Math.atan2(bin.hueY, bin.hueX) * 180) / Math.PI;
      if (hue < 0) hue += 360;
      return {
        hue,
        lightness: bin.l / bin.weight,
        chroma: bin.c / bin.weight,
        // Normalized against total pixels looked at, so "how much of this image
        // is this color" survives the vividness weighting.
        weight: bin.weight / sampled,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

const asHex = (s: Swatch) =>
  oklchToHex(
    clamp(s.lightness, 0.42, 0.75),
    clamp(s.chroma, 0.05, 0.19),
    s.hue,
  );

/** A swatch has to be this present and this colorful before it may set the theme. */
const isConvincing = (s: Swatch) => s.chroma >= 0.06 && s.weight >= 0.015;

export type ExtractedColors = {
  brand: string | null;
  secondary: string | null;
};

/**
 * Pulls a brand + companion pair out of up to two images. `primaryUrl` should be
 * the logo (a brand mark is the most deliberate color a program has);
 * `secondaryUrl` the background or banner, which supplies atmosphere.
 */
export async function extractProgramColors(
  primaryUrl: string | null,
  secondaryUrl: string | null,
): Promise<ExtractedColors> {
  const [primary, secondary] = await Promise.all([
    primaryUrl ? loadSwatches(primaryUrl) : Promise.resolve([]),
    secondaryUrl ? loadSwatches(secondaryUrl) : Promise.resolve([]),
  ]);

  const brandSwatch =
    primary.find(isConvincing) ?? secondary.find(isConvincing);
  if (!brandSwatch) return { brand: null, secondary: null };

  // The companion: the most present hue, from either image, that's far enough
  // from the brand to read as a second color instead of a mistake.
  const companion = [...secondary, ...primary].find(
    (s) => isConvincing(s) && hueDistance(s.hue, brandSwatch.hue) >= 40,
  );

  return {
    brand: asHex(brandSwatch),
    secondary: companion ? asHex(companion) : null,
  };
}
