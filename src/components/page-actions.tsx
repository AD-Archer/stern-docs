"use client";

import { useState } from "react";

/**
 * What someone wants at the foot of a docs page: send it to a friend, hand it to
 * a model, or fix what's wrong with it.
 *
 * "Copy as Markdown" copies the page's original source  the same text a
 * contributor edits and the same text `/raw/…` serves  because pasting rendered
 * HTML into a model wastes context on markup, and pasting a *link* only works if
 * the thing on the other end can browse. The markdown is already in the payload,
 * so the copy is instant and works offline.
 *
 * "Suggest an edit" is GitHub's edit URL: without write access it produces a fork
 * and a pull request, which is the entire editing model here.
 */
export function PageActions({
  canonicalUrl,
  markdownUrl,
  markdown,
  editUrl,
}: {
  canonicalUrl: string;
  markdownUrl: string;
  markdown: string;
  editUrl: string | null;
}) {
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);

  const copy = async (what: "link" | "markdown", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard blocked (insecure context, or an iframe without permission).
      // A prompt is ugly but it still gets the text out.
      window.prompt("Copy this", value);
    }
  };

  return (
    <div className="page-actions">
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => copy("markdown", markdown)}
      >
        {copied === "markdown" ? "Markdown copied" : "Copy as Markdown"}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => copy("link", canonicalUrl)}
      >
        {copied === "link" ? "Link copied" : "Copy link"}
      </button>
      <a
        className="btn btn-ghost"
        href={markdownUrl}
        target="_blank"
        rel="noreferrer"
      >
        View source ↗
      </a>
      {editUrl ? (
        <a
          className="btn btn-ghost"
          href={editUrl}
          target="_blank"
          rel="noreferrer"
        >
          Suggest an edit ↗
        </a>
      ) : null}
    </div>
  );
}
