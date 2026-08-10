"use client";

import { useState } from "react";

/**
 * The two things someone wants at the bottom of a docs page: send this to a
 * friend, or fix what's wrong with it.
 *
 * Copy uses the canonical URL passed from the server rather than
 * window.location, so a link copied out of an embed points at the docs page
 * itself and not at some host page's iframe URL with ?embed=1 on it.
 *
 * "Suggest an edit" is GitHub's edit URL. Someone without write access gets a
 * fork and a pull request out of it, which is the whole editing model here — no
 * accounts to provision, and every change to the docs arrives as a reviewable
 * diff.
 */
export function PageActions({
  canonicalUrl,
  editUrl,
}: {
  canonicalUrl: string;
  editUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context, or an iframe without permission):
      // select the URL instead so it can still be copied by hand.
      window.prompt("Copy this link", canonicalUrl);
    }
  };

  return (
    <div className="page-actions">
      <button type="button" className="btn btn-ghost" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      {editUrl ? (
        <a className="btn btn-ghost" href={editUrl} target="_blank" rel="noreferrer">
          Suggest an edit ↗
        </a>
      ) : null}
    </div>
  );
}
