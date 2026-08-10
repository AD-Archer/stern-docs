"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";

/**
 * The right rail: where you are inside a page, tracked with an IntersectionObserver
 * rather than a scroll handler so it costs nothing while scrolling.
 *
 * Only renders with two or more headings — on a short page it would be a rail
 * pointing at the thing already on screen.
 */
export function OnThisPage({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length < 2) return;
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Top-weighted band: a heading counts as "current" once it reaches the
      // upper third, which is where a reader's eye actually is.
      { rootMargin: "-72px 0px -66% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc" aria-label="On this page">
      <h2 className="silkscreen toc__label">On this page</h2>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} data-depth={heading.depth}>
            <a
              href={`#${heading.id}`}
              className={
                active === heading.id ? "toc-link toc-link-active" : "toc-link"
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
