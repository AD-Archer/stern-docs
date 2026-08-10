"use client";

import { useSchedule } from "@/components/use-schedule";

/**
 * The round, in one line of the header.
 *
 * This replaced a full-width status banner. The banner was a second header — it
 * stacked on top of the docs' own title bar, wrapped onto two lines on a phone,
 * and its whole job was to say a thing that fits in four words. So it says it
 * here instead, on the one header the site has.
 *
 * Open: how long is left, plus the way in. Closed: a muted note and no CTA —
 * this site never invites anyone to join a round they can't. The countdown ticks
 * on the client, so an ISR-cached header can't be wrong about which of those two
 * states it's in.
 */
export function RoundStatus({
  startsAt,
  endsAt,
  joinUrl,
  joinLabel,
  renderedAt,
}: {
  startsAt: string | null;
  endsAt: string | null;
  joinUrl: string;
  joinLabel: string;
  renderedAt: number;
}) {
  const schedule = useSchedule(startsAt, endsAt, renderedAt);

  if (schedule.phase === "ended") {
    return <span className="round-status round-status--closed">Round closed</span>;
  }

  return (
    <>
      <span className="round-status round-status--live tabular">
        {schedule.label}
      </span>
      <a className="btn btn-primary" href={joinUrl} target="_blank" rel="noreferrer">
        {/* "Join CloudFall" alongside a title and a Contents button is more than
            a phone header can hold, so the label shortens rather than wrapping. */}
        <span className="label-wide">{joinLabel}</span>
        <span className="label-narrow">Join</span>
      </a>
    </>
  );
}
