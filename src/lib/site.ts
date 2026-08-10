/**
 * Deploy-level knobs. Everything here has a working default so a fresh clone
 * runs with no .env at all — the only thing a new deploy really needs to set is
 * SITE_URL, and only because absolute URLs can't be guessed.
 */

/** Strips a trailing slash so callers can always template `${base}/path`. */
const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const STERN_API_BASE = trimSlash(
  process.env.STERN_API_BASE?.trim() || "https://stern.hackclub.com",
);

/**
 * Absolute origin of *this* site, for canonical links, OG image URLs and the
 * embed snippet. Vercel exports VERCEL_PROJECT_PRODUCTION_URL on every deploy,
 * which is a better fallback than localhost for preview builds.
 */
export const SITE_URL = trimSlash(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

/** Which program `/` sends visitors to. Content folders decide what's valid. */
export const DEFAULT_PROGRAM =
  process.env.NEXT_PUBLIC_DEFAULT_PROGRAM?.trim() || "cloudfall";

/**
 * GitHub repo holding this site, used to build "Edit this page" links. The
 * whole editing story is PRs, so if this is wrong the contribute affordance
 * quietly disappears rather than sending people to a 404.
 */
export const CONTENT_REPO = process.env.NEXT_PUBLIC_CONTENT_REPO?.trim() || "";
export const CONTENT_BRANCH =
  process.env.NEXT_PUBLIC_CONTENT_BRANCH?.trim() || "main";
