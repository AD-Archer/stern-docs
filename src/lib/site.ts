/**
 * Deploy-level knobs. Everything here has a working default so a fresh clone
 * runs with no .env at all  the only thing a new deploy really needs to set is
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
  process.env.NEXT_PUBLIC_DEFAULT_PROGRAM?.trim() || "CloudFALL";

/**
 * GitHub repo holding this site, used to build "Edit this page" links and shown
 * in the footer. The whole editing story is pull requests against it, so it's a
 * default rather than a required env var  a fork can override it, but a plain
 * clone still points somewhere real.
 */
export const CONTENT_REPO =
  process.env.NEXT_PUBLIC_CONTENT_REPO?.trim() || "AD-Archer/sterndocs";
export const CONTENT_BRANCH =
  process.env.NEXT_PUBLIC_CONTENT_BRANCH?.trim() || "main";

/** Browsable URL of the repo, for the footer and the contributing pages. */
export const CONTENT_REPO_URL = `https://github.com/${CONTENT_REPO}`;

/** Hack Club, whose programs these docs are for. */
export const HACK_CLUB_URL = "https://hackclub.com";

/**
 * Who made this. The URL is a Slack link, so the byline doubles as the way to
 * reach someone about the docs  which is more useful to a reader than a name on
 * its own.
 */
export const AUTHOR_NAME =
  process.env.NEXT_PUBLIC_AUTHOR_NAME?.trim() || "Archer";
export const AUTHOR_URL =
  process.env.NEXT_PUBLIC_AUTHOR_URL?.trim() ||
  "https://hackclub.enterprise.slack.com/archives/C0BHZLZF8BX";
