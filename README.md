# Stern program docs

Embeddable documentation for Hack Club program participants. Markdown in, themed
docs site out — with a live countdown and join button that read the program from
stern and disappear when the round closes.

Built for [CloudFall](https://cloudfall.hackclub.com), but nothing here is
CloudFall-specific: a program is a folder under `content/`.

```
content/cloudfall/          →  docs.example.com/cloudfall
  docs.json                    site config: title, sections, links
  index.md                     the docs home
  getting-started.md           /cloudfall/getting-started
  shipping/devlogs.md          /cloudfall/shipping/devlogs
content/future/             →  docs.example.com/future
  ...
```

Two programs ship with the site today: **CloudFall** and **Future**.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000 → redirects to the default program
```

No environment variables are needed for local development. For a deploy:

| Variable | Why | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical links, share cards, embed snippets | Vercel's URL, else localhost |
| `NEXT_PUBLIC_CONTENT_REPO` | `owner/repo`, powers "Suggest an edit" | none — the link is hidden |
| `NEXT_PUBLIC_CONTENT_BRANCH` | Branch edits target | `main` |
| `NEXT_PUBLIC_DEFAULT_PROGRAM` | Where `/` sends people | `cloudfall` |
| `STERN_API_BASE` | Point at a stern instance | `https://stern.hackclub.com` |

## How it works

**Content** is markdown on disk, read at build/revalidation time
([`src/lib/content.ts`](src/lib/content.ts)). Filenames become URLs, frontmatter
becomes navigation, and the body becomes HTML, a heading list, and a search index
([`src/lib/markdown.ts`](src/lib/markdown.ts)). No database, no CMS — which is the
point: **every change to these docs is a pull request.**

**Liveness** comes from stern's public API, e.g.
`https://stern.hackclub.com/api/public/programs/cloudfall`. It supplies the
program name, dates, Slack channel, hours shipped, artwork and join link. It's a
soft dependency: if stern is unreachable, the round status and join panel are
simply not rendered and the documentation is unaffected
([`src/lib/program.ts`](src/lib/program.ts)).

The schedule is recomputed from `startsAt`/`endsAt` locally rather than trusting
the API's own `hasEnded`, and again on the client on a ticking clock — so a page
cached while the round was open can never keep inviting people to join a round
that has closed ([`src/lib/schedule.ts`](src/lib/schedule.ts)).

**The palette comes from the program's `accentColor`**, the brand color set by
whoever runs it — so the docs match the program's own stern pages rather than
approximating them. CloudFall's `#543efa` gives purple docs; Future's `#51b9e6`
gives blue ones. That one hex generates every token on the page using the same
OKLCH formulas stern uses, which is what makes framed docs look native inside
stern ([`src/lib/theme.ts`](src/lib/theme.ts)).

The program's artwork still does work: the logo and background are downsampled,
converted to OKLCH, binned by hue and scored on prevalence × vividness, and the
strongest hue at least 40° from the accent becomes the *companion* color used by
the header seam and LED glow ([`src/lib/image-colors.ts`](src/lib/image-colors.ts)).
CloudFall's amber logo is where its seam gets its amber.

Precedence: `theme.brand` in `docs.json` → `accentColor` → artwork → Hack Club red
([`src/lib/seed.ts`](src/lib/seed.ts)). A program that would rather be themed from
its artwork than its accent sets `theme.source: "images"` in its `docs.json`.

## Embedding

Every page is embeddable. `/embed` is a builder with a live preview; the short
version:

```html
<div data-stern-docs="https://docs.example.com/cloudfall"></div>
<script src="https://docs.example.com/embed.js" defer></script>
```

The frame reports its height on every layout change and `embed.js` applies it, so
there's no fixed height and no nested scrollbar. `data-theme` and `data-nav`
control appearance and whether the header plus contents rail appear at all; they
map to `?embed=1&theme=…&nav=0`, which is read before first paint
([`src/lib/boot-script.ts`](src/lib/boot-script.ts)) so a host page never sees a
flash of full-site chrome.

> [!NOTE]
> Testing an embed from a `file://` page won't work — `frame-ancestors *` doesn't
> match non-network schemes. Serve the host page over http(s), even locally.

### Inside stern

Add a route that frames it — for example `apps/web/src/app/a/[appSlug]/docs/page.tsx`:

```tsx
export default async function DocsPage({ params }) {
  const { appSlug } = await params;
  const src = `${process.env.DOCS_URL}/${appSlug}?embed=1`;
  return (
    <iframe
      src={src}
      title="Documentation"
      className="w-full border-0"
      style={{ height: "100vh" }}
    />
  );
}
```

…and either ship the resize listener from `/embed`, or keep the fixed height if
stern's own page is already the scroll container.

## Adding a program

```bash
mkdir content/<slug>            # matching the program's stern slug
```

Add a `docs.json` and an `index.md` (copy CloudFall's as a starting point). Routes,
navigation, search, share cards, the round status and the palette all follow from
the folder name plus stern's API.

## Editing content

See [How to edit these docs](content/cloudfall/contributing.md) — it's a docs page
because contributors need it more than maintainers do.

## Deploying

Vercel with zero config. `sharp` is used for palette extraction and is imported
lazily: a host that can't load it loses the artwork-derived colors and falls back
to `accentColor`, rather than failing to build.
