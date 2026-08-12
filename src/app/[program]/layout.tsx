import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs-shell";
import { EmbedBridge } from "@/components/embed-bridge";
import { Insight } from "@/components/insight";
import { JoinPanel } from "@/components/join-panel";
import { RoundStatus } from "@/components/round-status";
import { loadProgramContent, listPrograms } from "@/lib/content";
import { plainText } from "@/lib/markdown";
import { fetchProgram, joinUrl } from "@/lib/program";
import { resolveThemeSeed } from "@/lib/seed";
import { themeCss } from "@/lib/theme";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  CONTENT_REPO,
  CONTENT_REPO_URL,
  HACK_CLUB_URL,
  STERN_API_BASE,
} from "@/lib/site";

/**
 * The shell every docs page sits in: theme tokens, the header, the patch panel,
 * the search index.
 *
 * Content comes from disk, liveness comes from stern's public API, and the two
 * are deliberately independent  if the API is unreachable the round status and
 * join panel simply aren't rendered, and the documentation is unaffected.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listPrograms()).map((program) => ({ program }));
}

/**
 * The tab icon is the program's own logo. A reader with the docs open in one tab
 * and the program in another should see the same mark on both, and it costs a
 * metadata line rather than an asset to maintain.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}): Promise<Metadata> {
  const { program } = await params;
  const data = await fetchProgram(program);
  return data?.images.logo ? { icons: { icon: data.images.logo } } : {};
}

/** Keeps the client search payload to something sane on very long pages. */
const SEARCH_TEXT_LIMIT = 4000;

export default async function ProgramLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ program: string }>;
}) {
  const { program: slug } = await params;
  const content = await loadProgramContent(slug);
  if (!content) notFound();

  const program = await fetchProgram(slug);
  const seed = await resolveThemeSeed(program, content.config);

  // Read once and passed down, so the server HTML and the first client render
  // agree on what time it was (see components/use-schedule.ts).
  //
  // The purity lint exists to stop impure reads inside memoized client renders;
  // this is a server component rendered once per ISR revalidation, and the whole
  // point of the value is that it's a snapshot of when that render happened.
  // eslint-disable-next-line react-hooks/purity
  const renderedAt = Date.now();

  const homeHref = `/${slug}`;
  const name = program?.name ?? content.config.title;
  const join = {
    programName: name,
    startsAt: program?.startsAt ?? null,
    endsAt: program?.endsAt ?? null,
    joinUrl: joinUrl(program, slug),
    joinLabel: content.config.join?.label ?? `Join ${name}`,
    renderedAt,
  };

  const links = [
    ...(content.config.links ?? []),
    ...(program?.links.home
      ? [{ label: `${name} on stern`, href: program.links.home }]
      : [{ label: "stern", href: STERN_API_BASE }]),
  ];

  return (
    <div className="shell">
      {/* Generated per program from its own artwork  see lib/seed.ts. */}
      <style dangerouslySetInnerHTML={{ __html: themeCss(seed) }} />
      <EmbedBridge />
      {/* Tags every event with the program whose docs are being read. */}
      <Insight program={slug} />

      {/* Header + contents rail + the page. The shell owns both because the
          header spans the viewport while the rail is a column inside it. */}
      <DocsShell
        title={content.config.title}
        tagline={content.config.tagline ?? program?.tagline ?? null}
        homeHref={homeHref}
        logo={program?.images.logo ?? null}
        groups={content.nav.map((group) => ({
          id: group.id,
          label: group.label,
          docs: group.docs.map((doc) => ({ href: doc.href, title: doc.title })),
        }))}
        links={links}
        search={content.docs
          .filter((doc) => !doc.hidden)
          .map((doc) => ({
            href: doc.href,
            title: doc.title,
            description: doc.description,
            group: doc.group,
            text: plainText(doc.body).slice(0, SEARCH_TEXT_LIMIT),
          }))}
        status={
          program ? (
            <RoundStatus
              key="round-status"
              startsAt={join.startsAt}
              endsAt={join.endsAt}
              joinUrl={join.joinUrl}
              joinLabel={join.joinLabel}
              renderedAt={renderedAt}
            />
          ) : null
        }
        panel={
          program ? (
            // Keyed because it crosses the server→client boundary as a prop,
            // and React's dev key check treats that element as a list child.
            <JoinPanel
              key="join-panel"
              {...join}
              blurb={content.config.join?.blurb ?? program.description}
              hoursShipped={program.hoursShipped}
              slackChannel={program.slackChannel}
              format={program.format}
              projectTypes={program.projectTypes}
            />
          ) : null
        }
      >
        {children}
      </DocsShell>

      <footer className="site-foot site-only">
        {/* Whose program this is, who made the docs, and where to change them.
            Not .silkscreen  that uppercases, which mangles a repo path and is
            the wrong way to write a name. */}
        <p className="site-foot__text">
          A{" "}
          <a href={HACK_CLUB_URL} target="_blank" rel="noreferrer">
            Hack Club
          </a>{" "}
          program. Created by{" "}
          <a href={AUTHOR_URL} target="_blank" rel="noreferrer">
            {AUTHOR_NAME}
          </a>
          . Edit on{" "}
          <a
            className="tabular"
            href={CONTENT_REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            {CONTENT_REPO}
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
