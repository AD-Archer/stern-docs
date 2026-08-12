/**
 * Plausible, loaded lazily and never statically.
 *
 * Content blockers refuse any request whose URL looks like analytics, and the
 * tracker package's path carries both "analytics" and "plausible"  as a static
 * import, a blocked response takes the whole client chunk down with it. This
 * file is named `insight` for the same reason: `analytics.ts` gets eaten on
 * sight. Everything below already treats tracking as optional, so the import has
 * to be optional too.
 *
 * Self-hosted, cookieless, no consent banner. Pageviews are captured by the
 * tracker's own history hook, which covers Next's client-side navigations.
 */

const DEFAULT_DOMAIN = "sterndocs.hackclub.com";
const DEFAULT_HOST = "https://plausible.adarcher.app";

type Track = (
  name: string,
  options: { props?: Record<string, string>; interactive?: boolean },
) => void;

let track: Track | null = null;
let initialized = false;
let ready = false;
let context: Record<string, string> = {};

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || DEFAULT_DOMAIN;
const host = (
  process.env.NEXT_PUBLIC_PLAUSIBLE_HOST?.trim() || DEFAULT_HOST
).replace(/\/+$/, "");

/**
 * Props added to every event from here on  which program's docs are being
 * read, mainly. Set before `initAnalytics` runs and it still applies:
 * `customProperties` is evaluated at send time, not at init.
 */
export function setAnalyticsContext(next: Record<string, string | null>) {
  context = { ...context, ...cleanProps(next) };
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  void load();
}

async function load() {
  try {
    const tracker = await import("@plausible-analytics/tracker");

    tracker.init({
      domain,
      endpoint: `${host}/api/event`,
      autoCapturePageviews: true,
      outboundLinks: true,
      fileDownloads: true,
      captureOnLocalhost:
        process.env.NEXT_PUBLIC_PLAUSIBLE_CAPTURE_LOCALHOST === "true",
      logging: process.env.NODE_ENV === "development",
      customProperties: () => ({
        ...context,
        // Docs read inside stern are a different reading session from docs read
        // on their own site, and the split is the useful thing to know.
        embedded: window.self === window.top ? "no" : "yes",
      }),
    });

    track = tracker.track;
    ready = true;
    attachClickTracking();
  } catch {
    // Blocked, offline, or failed to start. The page carries on without it.
  }
}

export function trackEvent(
  name: string,
  props: Record<string, string | null> = {},
  options: { interactive?: boolean } = {},
) {
  if (!ready || !track) return;
  try {
    track(name, { props: cleanProps(props), interactive: options.interactive });
  } catch {
    // Analytics must never take a user interaction down with it.
  }
}

function cleanProps(props: Record<string, string | null | undefined>) {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => [key, cleanPropValue(String(value))]),
  );
}

function cleanPropValue(value: string, maxLength = 80) {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed.length > maxLength
    ? `${collapsed.slice(0, maxLength - 1)}…`
    : collapsed;
}

/**
 * One delegated listener rather than props threaded through every component.
 * `data-analytics="Name"` on any element names an event, and sibling
 * `data-analytics-*` attributes become its props; anything else that's an
 * internal link is recorded as navigation, which is how you find out that
 * nobody ever reaches page four.
 */
function attachClickTracking() {
  const onClick = (event: MouseEvent) => {
    if (event.type === "auxclick" && event.button !== 1) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const marked = target.closest<HTMLElement>("[data-analytics]");
    if (marked) {
      const name = marked.dataset.analytics;
      if (name) trackEvent(name, datasetProps(marked));
      return;
    }

    const link = target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;

    let url: URL;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    // Outbound links have their own handler inside the tracker.
    if (url.host !== window.location.host || !url.protocol.startsWith("http")) {
      return;
    }

    trackEvent("Link: Click", {
      from: normalizePath(window.location.pathname),
      to: normalizePath(url.pathname),
      label: linkLabel(link),
      hash: url.hash,
    });
  };

  document.addEventListener("click", onClick, true);
  document.addEventListener("auxclick", onClick, true);
}

function datasetProps(element: HTMLElement) {
  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (key === "analytics" || !key.startsWith("analytics") || !value) continue;
    const name = key.slice("analytics".length);
    props[name.charAt(0).toLowerCase() + name.slice(1)] = value;
  }
  return props;
}

function linkLabel(link: HTMLAnchorElement) {
  return (
    cleanPropValue(link.getAttribute("aria-label") || link.textContent || "") ||
    "(unlabelled)"
  );
}

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
