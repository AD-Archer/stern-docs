/**
 * Where a program is in its run. Deliberately pure and `now`-injected: the
 * server renders a first answer from the ISR-cached payload, then the client
 * re-runs the exact same function on a ticking clock, so a page cached while
 * the round was live can't keep telling people to join something that closed.
 *
 * Mirrors stern's own describeProgramSchedule() closely enough that the two
 * never disagree in words a builder would notice.
 */

export type SchedulePhase = "upcoming" | "live" | "ended" | "undated";

export type ScheduleState = {
  phase: SchedulePhase;
  /** Whole days remaining, rounded up so the last partial day reads as "1". */
  daysLeft: number | null;
  /** Hours remaining after whole days are taken out — for the live countdown. */
  hoursLeft: number | null;
  minutesLeft: number | null;
  /** Terse status for the strip: "88 days left", "Opens Aug 5", "Closed". */
  label: string;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const shortDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/**
 * With the year, for anything describing a finished round. An archive note that
 * says "ran Jan 5 – Apr 5" is useless two rounds later; the year is the whole
 * point of the sentence.
 */
export const archiveDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function describeSchedule(
  startsAt: Date | null,
  endsAt: Date | null,
  now: number,
): ScheduleState {
  const started = startsAt == null || startsAt.getTime() <= now;
  const ended = endsAt != null && endsAt.getTime() <= now;

  if (ended) {
    return {
      phase: "ended",
      daysLeft: null,
      hoursLeft: null,
      minutesLeft: null,
      label: "Closed",
    };
  }

  if (!started && startsAt) {
    return {
      phase: "upcoming",
      daysLeft: Math.ceil((startsAt.getTime() - now) / DAY),
      hoursLeft: null,
      minutesLeft: null,
      label: `Opens ${shortDate(startsAt)}`,
    };
  }

  if (!endsAt) {
    return {
      phase: "undated",
      daysLeft: null,
      hoursLeft: null,
      minutesLeft: null,
      label: "Open",
    };
  }

  const remaining = Math.max(0, endsAt.getTime() - now);
  const daysLeft = Math.floor(remaining / DAY);
  const hoursLeft = Math.floor((remaining % DAY) / HOUR);
  const minutesLeft = Math.floor((remaining % HOUR) / MINUTE);

  return {
    phase: "live",
    daysLeft,
    hoursLeft,
    minutesLeft,
    // Under a day the countdown is the news, so the label carries hours.
    label:
      daysLeft > 0
        ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
        : `${hoursLeft}h ${minutesLeft}m left`,
  };
}
