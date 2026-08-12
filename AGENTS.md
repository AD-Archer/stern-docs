<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agents write structure and code, not prose

Everything under `content/` is read by a person who is stuck at 1am. That writing
is done by humans, and a page of generated filler is worse than an empty page:
it reads fine, says nothing, and nobody can tell which is which afterwards.

Do not write, rewrite, expand or "polish":

- Body text in `content/**/*.md` paragraphs, intros, explanations, list prose
- `title`, `description`, `tagline` and `blurb` values, in frontmatter or in `docs.json`
- Narrative in `README.md`, `content/_shared/*`, PR bodies, issue bodies

Do write:

- Code, config, types, tests, CI
- Code comments that explain a mechanism or a constraint. Keep them plain and
  short; they are not an essay
- Markdown skeletons: frontmatter keys, headings, tables, code blocks, links,
  file moves, renames, fixing a broken link or a wrong path

When a page needs prose, leave the heading and a `TODO:` line under it, and say
in your reply which sections need writing. Verbatim text moved between files is
a move, not writing, and is fine.
