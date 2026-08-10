---
title: Using these docs with an LLM
description: Plain-markdown versions of every page, an index at /llms.txt, and a copy button that gives a model the source instead of the rendering.
group: help
order: 3
---

Asking a model about Future works much better if you give it the docs. Every page
here is available as plain markdown, so you don't have to copy a rendering and hope
the formatting survives.

## The copy button

At the bottom of every page: **Copy as Markdown**. It puts that page's original
source on your clipboard — the same text a contributor edits — ready to paste into
whatever you're asking. **View source** opens the same thing in a tab.

## The URLs

| URL | What you get |
| --- | --- |
| `/llms.txt` | An index of every program and page, with a one-line summary each |
| `/llms-full.txt` | Every page's markdown in one response |
| `/llms-full.txt?program=future` | Just Future, in one response |
| `/raw/future/<page>` | One page's markdown — e.g. `/raw/future/faq` |

All of them are CORS-open and cached for five minutes, so an agent or a script can
fetch them directly.

```bash
# The whole thing, piped somewhere useful
curl -s https://<this-site>/llms-full.txt?program=future > future-docs.md
```

> [!IMPORTANT]
> `/llms.txt` and `/llms-full.txt` include a generated status line saying whether
> the round is open and until when. That line is computed when you fetch it, so
> trust it over anything the prose seems to imply about timing — and if you're
> pasting docs into a conversation, paste the status line too. It's what stops a
> model from telling someone to sign up for a round that closed.

## What not to expect

These files are documentation, not the platform. They can't tell you your own
hours, your submission status, or what's in the shop right now — those live on the
program's own pages. A model that has read the docs can tell you *how* something
works; it can't see your account.
