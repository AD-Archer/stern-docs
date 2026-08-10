import Link from "next/link";

type PagerDoc = { href: string; title: string } | null;

/**
 * Previous/next in reading order. Present because docs written as a path  set
 * up, build, ship  are read that way, and the alternative is bouncing off the
 * sidebar after every page.
 */
export function Pager({
  previous,
  next,
}: {
  previous: PagerDoc;
  next: PagerDoc;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="pager" aria-label="More pages">
      {previous ? (
        <Link className="pager-card" href={previous.href} rel="prev">
          <span className="silkscreen">← Previous</span>
          <span className="pager-card__title display">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          className="pager-card pager-card--next"
          href={next.href}
          rel="next"
        >
          <span className="silkscreen">Next →</span>
          <span className="pager-card__title display">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
