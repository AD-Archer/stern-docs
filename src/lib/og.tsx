import { ImageResponse } from "next/og";
import { loadProgramContent } from "@/lib/content";
import { fetchProgram } from "@/lib/program";
import { archiveDate, describeSchedule, parseDate, shortDate } from "@/lib/schedule";
import { resolveThemeSeed } from "@/lib/seed";
import { ogColors } from "@/lib/theme";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The share card.
 *
 * Same panel language as the site — brand seam across the top, silkscreen
 * labels, the program's logo — because a link dropped in a Slack channel is
 * often the first thing anyone sees of these docs, and it should read as the
 * program's own equipment.
 *
 * The status line follows the same rule as everything else: an open round says
 * when it closes, a finished one says it's an archive. A card cached in Slack's
 * image proxy can be stale, so it never carries a countdown, only dates.
 */
export async function docOgImage(program: string, title: string) {
  const content = await loadProgramContent(program);
  const data = await fetchProgram(program);
  const seed = await resolveThemeSeed(
    data,
    content?.config ?? { title: "Docs", groups: [] },
  );
  const c = ogColors(seed);

  const schedule = describeSchedule(
    parseDate(data?.startsAt),
    parseDate(data?.endsAt),
    Date.now(),
  );
  const start = parseDate(data?.startsAt);
  const end = parseDate(data?.endsAt);

  const status =
    schedule.phase === "ended"
      ? `ARCHIVE · RAN ${start ? shortDate(start).toUpperCase() : ""}${end ? `–${archiveDate(end).toUpperCase()}` : ""}`
      : schedule.phase === "upcoming"
        ? `OPENS ${start ? shortDate(start).toUpperCase() : "SOON"}`
        : end
          ? `OPEN · CLOSES ${shortDate(end).toUpperCase()}`
          : "OPEN";

  const label = `${data?.name ?? content?.config.title ?? program} docs`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: c.background,
          padding: "72px 76px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Brand seam — the one piece of color, top edge, like the site. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: `linear-gradient(90deg, ${c.brand}, ${c.brand2})`,
          }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          {data?.images.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.images.logo}
              alt=""
              width={64}
              height={64}
              style={{ marginRight: 22, objectFit: "contain" }}
            />
          ) : null}
          <div
            style={{
              color: c.muted,
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 42 ? 76 : 96,
            lineHeight: 1.05,
            color: c.foreground,
            fontWeight: 600,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: schedule.phase === "ended" ? c.hairline : c.brand,
              marginRight: 16,
            }}
          />
          <div style={{ color: c.brand, fontSize: 24, letterSpacing: 4 }}>
            {status}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
