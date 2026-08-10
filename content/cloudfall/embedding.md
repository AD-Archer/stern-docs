---
title: Put these docs in your page
description: One div and one script tag. The frame sizes itself to the content.
group: help
order: 3
---

These docs are built to live inside other pages — the program's stern pages, the
CloudFall site, anywhere. The [embed builder](/embed) generates the snippet for you
with a live preview; this is the short version. If you're looking for the
machine-readable versions instead, see
[Using these docs with an LLM](/cloudfall/llms).

## The snippet

```html
<div data-stern-docs="https://docs.example.com/cloudfall"></div>
<script src="https://docs.example.com/embed.js" defer></script>
```

The frame reports its own height as you navigate, and the script applies it — so
there's no fixed height to guess and no scrollbar inside your page.

Options go on the div:

| Attribute | Effect |
| --- | --- |
| `data-nav="0"` | Hide the header and contents rail — for embedding a single page inside your own chrome |
| `data-height="1200"` | Starting height, before the first size message arrives |

## Without the script

Any framework can skip `embed.js` — the parameters are just query string:

```html
<iframe
  src="https://docs.example.com/cloudfall?embed=1"
  style="width:100%;height:900px;border:0"
  loading="lazy"
  title="CloudFall docs"
></iframe>
```

To size it yourself, listen for the message the docs post on every layout change:

```js
window.addEventListener("message", (event) => {
  if (event.data?.type !== "stern-docs:size") return;
  if (event.origin !== "https://docs.example.com") return;
  frame.style.height = `${event.data.height}px`;
});
```

## What `?embed=1` changes

- The site footer and page texture are removed **before first paint**, and
  `nav=0` removes the header and contents rail too — so your page never flashes a
  second set of navigation.
- The page background drops its own texture and sits on whatever surface you give
  it.
- Everything else — search, the contents rail, the countdown and join button —
  works exactly as it does standalone. The docs are light only, so there's no
  appearance to coordinate.

> [!NOTE]
> Links that leave the docs open in a new tab rather than replacing the frame, so
> an embed can't become a dead end inside your page.
