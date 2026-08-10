"use client";

import { useMemo, useState } from "react";

export type EmbedTarget = { href: string; title: string; program: string };

/**
 * Builds the snippet, so nobody has to read the embed docs to embed the docs.
 *
 * Every option here maps to a query parameter the docs read before first paint,
 * which is why the preview on the right is the real thing rather than a mock:
 * it's the same URL the snippet produces.
 */
export function EmbedBuilder({
  siteUrl,
  targets,
}: {
  siteUrl: string;
  targets: EmbedTarget[];
}) {
  const [href, setHref] = useState(targets[0]?.href ?? "/");
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [nav, setNav] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const url = useMemo(() => {
    const built = new URL(href, siteUrl);
    built.searchParams.set("embed", "1");
    if (theme !== "auto") built.searchParams.set("theme", theme);
    if (!nav) built.searchParams.set("nav", "0");
    return built.toString();
  }, [href, siteUrl, theme, nav]);

  const scriptSnippet = [
    `<div data-stern-docs="${new URL(href, siteUrl).toString()}"`,
    theme !== "auto" ? ` data-theme="${theme}"` : "",
    !nav ? ` data-nav="0"` : "",
    `></div>`,
    `\n<script src="${siteUrl}/embed.js" defer></script>`,
  ].join("");

  const iframeSnippet = `<iframe src="${url}" title="Documentation" style="width:100%;height:900px;border:0" loading="lazy"></iframe>`;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      window.prompt("Copy this", value);
    }
  };

  return (
    <div className="embed-builder">
      <div className="embed-builder__controls panel">
        <label className="field">
          <span className="silkscreen">Page</span>
          <select value={href} onChange={(event) => setHref(event.target.value)}>
            {targets.map((target) => (
              <option key={target.href} value={target.href}>
                {target.program} — {target.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="silkscreen">Appearance</span>
          <select
            value={theme}
            onChange={(event) =>
              setTheme(event.target.value as "auto" | "light" | "dark")
            }
          >
            <option value="auto">Follow the reader&apos;s system</option>
            <option value="light">Always light</option>
            <option value="dark">Always dark</option>
          </select>
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={nav}
            onChange={(event) => setNav(event.target.checked)}
          />
          <span>Show the header and contents rail</span>
        </label>

        <div className="snippet">
          <div className="snippet__head">
            <span className="silkscreen">Auto-resizing embed</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => copy("script", scriptSnippet)}
            >
              {copied === "script" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre>{scriptSnippet}</pre>
        </div>

        <div className="snippet">
          <div className="snippet__head">
            <span className="silkscreen">Plain iframe</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => copy("iframe", iframeSnippet)}
            >
              {copied === "iframe" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre>{iframeSnippet}</pre>
        </div>
      </div>

      <div className="embed-builder__preview panel">
        <div className="snippet__head">
          <span className="silkscreen">Preview</span>
          <a className="btn btn-ghost" href={url} target="_blank" rel="noreferrer">
            Open ↗
          </a>
        </div>
        <iframe src={url} title="Embed preview" />
      </div>
    </div>
  );
}
