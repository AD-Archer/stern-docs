"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppearanceToggle } from "@/components/appearance-toggle";
import { DocSearch, type SearchEntry } from "@/components/doc-search";

export type RailDoc = { href: string; title: string };
export type RailGroup = { id: string; label: string; docs: RailDoc[] };

export type DocsShellProps = {
  title: string;
  tagline: string | null;
  homeHref: string;
  logo: string | null;
  groups: RailGroup[];
  links: { label: string; href: string }[];
  search: SearchEntry[];
  /** The join panel, when there's a live program behind these docs. */
  panel?: React.ReactNode;
  /** Round status and join CTA — one line in the header, at every width. */
  status?: React.ReactNode;
  /** The page itself. */
  children: React.ReactNode;
};

/**
 * The chrome around a documentation page: one header, one contents rail.
 *
 * Header and rail live in the same component because they share one piece of
 * state — whether the contents sheet is open on a phone — and because the header
 * has to sit *outside* the two-column grid to span the viewport while the rail
 * sits inside it as the first column.
 *
 * One header is the whole point of this file. An earlier version had a
 * full-width round-status banner above a separate docs title bar: two stacked
 * headers, only one of them sticky, which on a phone ate a third of the screen
 * and looked like a bug. The round now reports itself in a single line of the one
 * header there is.
 *
 * The rail: every page is a labelled port with a status LED, exactly one lit —
 * the page you're on, the same read as a rack. Colour is never the only signal;
 * the active row also gets a brand rail down its left edge and a weight change,
 * so it works without colour vision and under forced colours.
 */
export function DocsShell({
  title,
  tagline,
  homeHref,
  logo,
  groups,
  links,
  search,
  panel,
  status,
  children,
}: DocsShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="site-bar">
        <div className="site-bar__inner">
          <Link href={homeHref} className="site-brand">
            {logo ? (
              <Image
                src={logo}
                alt=""
                width={32}
                height={32}
                className="site-logo"
                unoptimized
              />
            ) : null}
            <span className="site-brand__text">
              <span className="site-title display">{title}</span>
              {tagline ? <span className="site-tagline">{tagline}</span> : null}
            </span>
          </Link>

          <div className="site-bar__actions">
            {status}
            {/* Labelled rather than a bare hamburger: "Contents" is what people
                are looking for. Hidden where the rail is always open. */}
            <button
              type="button"
              className="btn btn-ghost contents-toggle"
              aria-expanded={open}
              aria-controls="nav-rail"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close" : "Contents"}
            </button>
          </div>
        </div>
      </header>

      <div className="shell__body">
        <aside id="nav-rail" className="nav-rail panel" data-open={open ? "1" : "0"}>
          <DocSearch entries={search} />

          {panel}

          <nav aria-label="Documentation">
            {groups.map((group) => (
              <div className="rail-group" key={group.id}>
                <h3 className="silkscreen rail-group__label">{group.label}</h3>
                <ul>
                  {group.docs.map((doc) => (
                    <li key={doc.href}>
                      <Link
                        href={doc.href}
                        className={isActive(doc.href) ? "port port-active" : "port"}
                        aria-current={isActive(doc.href) ? "page" : undefined}
                        // Tapping a port on a phone means you found what you
                        // wanted, so the sheet has done its job.
                        onClick={() => setOpen(false)}
                      >
                        <span
                          className={isActive(doc.href) ? "led led-on" : "led"}
                          aria-hidden
                        />
                        <span className="port-label">{doc.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {links.length > 0 ? (
            <div className="rail-group">
              <h3 className="silkscreen rail-group__label">Elsewhere</h3>
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="port"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="led" aria-hidden />
                      <span className="port-label">{link.label}</span>
                      <span className="port-out" aria-hidden>
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rail-foot">
            <AppearanceToggle />
          </div>
        </aside>

        <main className="shell__main">{children}</main>
      </div>
    </>
  );
}
