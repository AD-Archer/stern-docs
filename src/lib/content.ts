/**
 * The content layer: a folder of markdown becomes a navigable, searchable docs
 * site with no database and no CMS.
 *
 *   content/
 *     CloudFALL/
 *       docs.json        ← per-program config: title, section order, links
 *       index.md         ← the program's docs home
 *       getting-started.md
 *       shipping/
 *         devlogs.md     ← /cloudfall/shipping/devlogs
 *
 * That shape *is* the contribution model. A person who spots a wrong port number
 * edits one markdown file on github.com and opens a pull request; nothing here
 * needs to know that happened. It also means adding a whole new program's docs
 * is `mkdir content/<slug>`  the routes, nav, theme and round status are all
 * derived from the folder name plus stern's API.
 *
 * Read from disk on the server only. Pages are ISR-cached, so this runs on
 * revalidation rather than per request.
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type DocsConfig = {
  /** Display title of this docs site, e.g. "CloudFALL docs". */
  title: string;
  /** One line under the title in the sidebar. */
  tagline?: string;
  /** Sections, in the order they appear. A doc's `group` matches an `id`. */
  groups: { id: string; label: string; blurb?: string }[];
  /**
   * Colors. Omit the whole block and the program's `accentColor` from stern
   * drives the palette, with its artwork supplying the companion hue.
   *
   * - `brand`/`secondary`: exact hexes, when the derived pair isn't right.
   * - `source: "images"`: let the artwork set the brand instead of accentColor.
   * - `sourceImage`: which image the artwork colour is read from (default logo).
   */
  theme?: {
    brand?: string;
    secondary?: string;
    source?: "accent" | "images";
    sourceImage?: "logo" | "background" | "banner" | "cover";
  };
  /** Extra links in the sidebar footer  Slack, the program site, source. */
  links?: { label: string; href: string }[];
  /** `owner/repo` for edit links; falls back to NEXT_PUBLIC_CONTENT_REPO. */
  repo?: string;
  branch?: string;
  /** Copy for the join CTA. The CTA only ever shows while the round is open. */
  join?: { label?: string; blurb?: string };
};

export type Doc = {
  /** URL segments after the program, e.g. ["shipping", "devlogs"]. Empty = home. */
  segments: string[];
  href: string;
  title: string;
  description: string | null;
  group: string | null;
  order: number;
  hidden: boolean;
  /** Raw markdown body, frontmatter stripped. */
  body: string;
  /** Repo-relative path, for the "Edit this page" link. */
  filePath: string;
};

export type NavGroup = {
  id: string;
  label: string;
  blurb?: string;
  docs: Doc[];
};

const DEFAULT_CONFIG: DocsConfig = { title: "Docs", groups: [] };

/** Every program that has a content folder. */
export async function listPrograms(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function readConfig(program: string): Promise<DocsConfig> {
  try {
    const raw = await fs.readFile(
      path.join(CONTENT_ROOT, program, "docs.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<DocsConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
    };
  } catch {
    // A program with markdown but no docs.json still works; it just gets one
    // unnamed section and a generic title.
    return { ...DEFAULT_CONFIG, title: `${program} docs` };
  }
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".md") ? [full] : [];
    }),
  );
  return files.flat();
}

const titleize = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function parseDoc(program: string, absolute: string, raw: string): Doc {
  const relative = path
    .relative(path.join(CONTENT_ROOT, program), absolute)
    .split(path.sep);
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const file = relative[relative.length - 1].replace(/\.md$/, "");
  // index.md is the folder's own page: content/x/index.md → /x, and
  // content/x/guides/index.md → /x/guides.
  const segments =
    file === "index" ? relative.slice(0, -1) : [...relative.slice(0, -1), file];

  const fallbackTitle =
    segments.length === 0
      ? "Overview"
      : titleize(segments[segments.length - 1]);

  return {
    segments,
    href: `/${[program, ...segments].join("/")}`,
    title: typeof data.title === "string" ? data.title : fallbackTitle,
    description: typeof data.description === "string" ? data.description : null,
    group: typeof data.group === "string" ? data.group : null,
    order: typeof data.order === "number" ? data.order : 999,
    hidden: data.hidden === true,
    body: parsed.content.trim(),
    filePath: `content/${program}/${relative.join("/")}`,
  };
}

export type ProgramContent = {
  program: string;
  config: DocsConfig;
  docs: Doc[];
  nav: NavGroup[];
  /** Reading order across the whole site, for prev/next. */
  flat: Doc[];
};

export async function loadProgramContent(
  program: string,
): Promise<ProgramContent | null> {
  const dir = path.join(CONTENT_ROOT, program);
  // Guard against `..` in a route segment reaching the filesystem.
  if (path.relative(CONTENT_ROOT, dir) !== program) return null;

  let files: string[];
  try {
    files = await walk(dir);
  } catch {
    return null;
  }
  if (files.length === 0) return null;

  const config = await readConfig(program);
  const docs = await Promise.all(
    files.map(async (file) =>
      parseDoc(program, file, await fs.readFile(file, "utf8")),
    ),
  );

  const visible = docs.filter((doc) => !doc.hidden);
  const byOrder = (a: Doc, b: Doc) =>
    a.order - b.order || a.title.localeCompare(b.title);

  // Configured sections first, in their configured order; anything with an
  // unknown or missing group is collected at the end rather than dropped.
  const nav: NavGroup[] = config.groups
    .map((group) => ({
      ...group,
      docs: visible
        .filter((doc) => doc.group === group.id && doc.segments.length > 0)
        .sort(byOrder),
    }))
    .filter((group) => group.docs.length > 0);

  const known = new Set(config.groups.map((group) => group.id));
  const orphans = visible
    .filter(
      (doc) => doc.segments.length > 0 && (!doc.group || !known.has(doc.group)),
    )
    .sort(byOrder);
  if (orphans.length > 0) {
    nav.push({ id: "more", label: "More", docs: orphans });
  }

  const home = visible.find((doc) => doc.segments.length === 0);
  const flat = [...(home ? [home] : []), ...nav.flatMap((group) => group.docs)];

  return { program, config, docs, nav, flat };
}

export function findDoc(
  content: ProgramContent,
  segments: string[],
): Doc | null {
  const target = segments.join("/");
  return content.docs.find((doc) => doc.segments.join("/") === target) ?? null;
}

/** Previous/next in reading order, for the bottom-of-page pager. */
export function neighbours(content: ProgramContent, doc: Doc) {
  const index = content.flat.findIndex(
    (candidate) => candidate.href === doc.href,
  );
  return {
    previous: index > 0 ? content.flat[index - 1] : null,
    next:
      index >= 0 && index < content.flat.length - 1
        ? content.flat[index + 1]
        : null,
  };
}

/**
 * GitHub's edit URL. Hitting it without write access forks the repo and opens a
 * PR, which is exactly the flow this site wants, so it's the same link for
 * maintainers and drive-by contributors.
 */
export function editUrl(
  doc: Doc,
  config: DocsConfig,
  fallbackRepo: string,
  fallbackBranch: string,
): string | null {
  const repo = config.repo || fallbackRepo;
  if (!repo) return null;
  const branch = config.branch || fallbackBranch;
  return `https://github.com/${repo}/edit/${branch}/${doc.filePath}`;
}
