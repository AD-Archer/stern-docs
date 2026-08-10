"use client";

import { useSchedule } from "@/components/use-schedule";
import { archiveDate, parseDate } from "@/lib/schedule";

export type JoinPanelProps = {
  programName: string;
  startsAt: string | null;
  endsAt: string | null;
  joinUrl: string;
  joinLabel: string;
  blurb: string | null;
  hoursShipped: number | null;
  slackChannel: string | null;
  format: string | null;
  projectTypes: string[];
  renderedAt: number;
};

/**
 * Everything about the round that doesn't fit in the header.
 *
 * The header says how long is left and offers the way in — one line, seen on
 * every page. This is where the pitch and the spec live: what kind of thing this
 * is, what you're allowed to build, how much has been shipped, where the channel
 * is.
 *
 * After the round closes it stops recruiting and starts explaining: the CTA goes,
 * the archive note arrives, and the Slack channel stays, because people still
 * talk there.
 */
export function JoinPanel({
  programName,
  startsAt,
  endsAt,
  joinUrl,
  joinLabel,
  blurb,
  hoursShipped,
  slackChannel,
  format,
  projectTypes,
  renderedAt,
}: JoinPanelProps) {
  const schedule = useSchedule(startsAt, endsAt, renderedAt);
  const end = parseDate(endsAt);
  const ended = schedule.phase === "ended";
  const slackUrl = slackChannel
    ? `https://hackclub.slack.com/channels/${slackChannel.replace(/^#/, "")}`
    : null;

  return (
    <section className="join-panel panel" aria-labelledby="join-panel-title">
      <div className="join-panel__head">
        <span className={ended ? "led" : "led led-live"} aria-hidden />
        <h2 id="join-panel-title" className="silkscreen">
          {ended ? "Round closed" : schedule.label}
        </h2>
      </div>

      {ended ? (
        <p className="join-panel__blurb">
          {programName} finished{end ? ` on ${archiveDate(end)}` : ""}. Nothing new
          is being accepted, but everything here still describes how it worked.
        </p>
      ) : (
        <>
          {blurb ? <p className="join-panel__blurb">{blurb}</p> : null}
          <a className="btn btn-primary w-full justify-center" href={joinUrl} target="_blank" rel="noreferrer">
            {joinLabel}
          </a>
        </>
      )}

      <dl className="spec">
        {format ? (
          <div className="spec-row">
            <dt className="silkscreen">Format</dt>
            <dd className="tabular">{format}</dd>
          </div>
        ) : null}
        {projectTypes.length > 0 ? (
          <div className="spec-row">
            <dt className="silkscreen">Builds</dt>
            <dd className="tabular">{projectTypes.join(" · ")}</dd>
          </div>
        ) : null}
        {hoursShipped != null && hoursShipped > 0 ? (
          <div className="spec-row">
            <dt className="silkscreen">Shipped</dt>
            <dd className="tabular">
              {Math.round(hoursShipped).toLocaleString("en-US")} hrs
            </dd>
          </div>
        ) : null}
        {slackUrl ? (
          <div className="spec-row">
            <dt className="silkscreen">Channel</dt>
            <dd className="tabular">
              <a href={slackUrl} target="_blank" rel="noreferrer">
                {slackChannel}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
