---
title: How to edit these docs
description: Every page is a markdown file and every change is a pull request. Here's the whole workflow.
group: help
order: 2
---

If a page here is wrong, unclear, or missing the thing you spent an hour working
out, you can fix it. No maintainer status needed, nothing to clone.

## The fast way, from the browser

1. Scroll to the bottom of the page that's wrong.
2. Click **Suggest an edit**. GitHub opens that page's markdown file in an editor.
3. Make the change. Without write access, GitHub forks the repo for you — that's
   expected.
4. Write one line about what you changed, click **Propose changes**, then **Create
   pull request**.

A maintainer reviews it, and when it merges the site updates itself.

## The local way

```bash
git clone https://github.com/<owner>/<repo>
cd <repo>
pnpm install
pnpm dev            # http://localhost:3000
```

Future's pages live in `content/future/`. Edit a `.md` file, save, and the page
reloads.

## What a page looks like

```markdown
---
title: Getting started
description: One sentence, used in search results and on the share card.
group: start
order: 1
---

Body text, in markdown.
```

| Field | What it does |
| --- | --- |
| `title` | Heading, sidebar label, browser tab, share card |
| `description` | The lede under the title, plus search and social previews |
| `group` | Which sidebar section it appears in — must match an `id` in `docs.json` |
| `order` | Position within the section; ties break alphabetically |
| `hidden` | `true` keeps it out of the nav and search, but the URL still works — good for a draft you want to share for review |

Filenames become URLs: `content/future/hardware.md` is `/future/hardware`.

## Things markdown gives you here

Callouts, using GitHub's own alert syntax so they look right in the pull request
diff too:

```markdown
> [!NOTE]
> Useful context that isn't a warning.

> [!WARNING]
> The thing that will cost someone an afternoon.
```

Code blocks with a filename label:

````markdown
```yaml title="platformio.ini"
[env:esp32dev]
platform = espressif32
```
````

Tables, task lists, footnotes — anything GitHub-flavoured markdown supports.

## House style

- **Write for the person who's stuck**, not the person who already knows.
- **Be specific.** Exact commands, real part numbers, actual pin names.
- **Don't put dates, deadlines or shop prices in prose.** They come from the
  program itself; a hardcoded number is a page that lies later.
- **Keep it short.** If a page needs eight headings, it's probably two pages.

## Adding a whole new program's docs

Make a folder under `content/`, add a `docs.json` and an `index.md`, and the site
does the rest — routes, navigation, search, share cards, and a palette taken from
that program's own brand colour.
