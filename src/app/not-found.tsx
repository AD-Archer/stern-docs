import Link from "next/link";
import { DEFAULT_PROGRAM } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="empty-state">
      <p className="silkscreen">No such port</p>
      <h1 className="display empty-state__title">This page isn&apos;t here</h1>
      <p>
        It may have been renamed, or the link may be from an older version of the
        docs. The contents list has everything that exists right now.
      </p>
      <Link className="btn btn-primary" href={`/${DEFAULT_PROGRAM}`}>
        Go to the docs home
      </Link>
    </div>
  );
}
