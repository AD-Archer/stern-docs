"use client";

import { useEffect, useState } from "react";
import { describeSchedule, parseDate, type ScheduleState } from "@/lib/schedule";

/**
 * The live version of the program schedule.
 *
 * `renderedAt` is the server's clock at render time, passed down as a prop so the
 * first client render is byte-identical to the HTML — no hydration mismatch. The
 * effect then takes over on the real clock, which is what makes an ISR-cached
 * page stop advertising a round that closed while the page sat in the cache.
 */
export function useSchedule(
  startsAt: string | null,
  endsAt: string | null,
  renderedAt: number,
): ScheduleState {
  const start = parseDate(startsAt);
  const end = parseDate(endsAt);
  const [state, setState] = useState(() =>
    describeSchedule(start, end, renderedAt),
  );

  useEffect(() => {
    const tick = () => setState(describeSchedule(start, end, Date.now()));
    tick();
    // 20s: the readout shows minutes, and a countdown that lags by half a minute
    // is invisible, while a per-second interval in an embedded iframe is not.
    const interval = window.setInterval(tick, 20_000);
    return () => window.clearInterval(interval);
  }, [startsAt, endsAt]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
