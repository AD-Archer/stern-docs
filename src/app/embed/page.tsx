import type { Metadata } from "next";
import Link from "next/link";
import { EmbedBuilder, type EmbedTarget } from "@/components/embed-builder";
import { listPrograms, loadProgramContent } from "@/lib/content";
import { fetchProgram } from "@/lib/program";
import { resolveThemeSeed } from "@/lib/seed";
import { themeCss } from "@/lib/theme";
import { DEFAULT_PROGRAM, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Embed these docs",
  description:
    "Copy-paste snippet for putting a program's documentation inside another page.",
};

/**
 * The page you send someone who asks "how do I put the docs on our site".
 *
 * Wears the default program's palette, because this is the one page that belongs
 * to the docs *tool* rather than to a program, and inventing a third look for it
 * would be one look too many.
 */
export default async function EmbedPage() {
  const programs = await listPrograms();
  const contents = await Promise.all(
    programs.map(async (program) => ({
      program,
      content: await loadProgramContent(program),
    })),
  );

  const targets: EmbedTarget[] = contents.flatMap(({ program, content }) =>
    (content?.flat ?? []).map((doc) => ({
      program: content?.config.title ?? program,
      title: doc.segments.length === 0 ? "Home" : doc.title,
      href: doc.href,
    })),
  );

  const themeProgram = programs.includes(DEFAULT_PROGRAM)
    ? DEFAULT_PROGRAM
    : programs[0];
  const themeContent = themeProgram
    ? contents.find((entry) => entry.program === themeProgram)?.content
    : null;
  const seed = await resolveThemeSeed(
    themeProgram ? await fetchProgram(themeProgram) : null,
    themeContent?.config ?? { title: "Docs", groups: [] },
  );

  return (
    <div className="embed-page">
      <style dangerouslySetInnerHTML={{ __html: themeCss(seed) }} />

      <header className="embed-page__head">
        <p className="silkscreen">Embedding</p>
        <h1 className="display embed-page__title">Put these docs in your page</h1>
        <p className="embed-page__lede">
          Every page here is embeddable as-is. Pick what to show, copy the
          snippet, and the frame sizes itself to the content — no fixed heights,
          no inner scrollbar.
        </p>
        {themeProgram ? (
          <Link className="btn btn-ghost" href={`/${themeProgram}`}>
            ← Back to the docs
          </Link>
        ) : null}
      </header>

      {targets.length > 0 ? (
        <EmbedBuilder siteUrl={SITE_URL} targets={targets} />
      ) : (
        <p>
          There&apos;s no content yet. Add a folder under <code>content/</code> and
          this page will fill in.
        </p>
      )}

      <section className="embed-page__notes prose">
        <h2>Feeding the docs to an LLM</h2>
        <p>
          Every page is also plain markdown, so an agent — or a person pasting into
          a chat — gets the source rather than a rendering.
        </p>
        <ul>
          <li>
            <a href="/llms.txt">
              <code>/llms.txt</code>
            </a>{" "}
            — an index of every program and page, in the llmstxt.org shape, with a
            generated line saying whether each round is still open.
          </li>
          <li>
            <a href="/llms-full.txt">
              <code>/llms-full.txt</code>
            </a>{" "}
            — the entire corpus in one response. Add{" "}
            <code>?program=&lt;slug&gt;</code> for one program.
          </li>
          <li>
            <code>/raw/&lt;program&gt;/&lt;page&gt;</code> — a single page&apos;s
            markdown, which is what the <strong>Copy as Markdown</strong> button at
            the foot of every page copies.
          </li>
        </ul>
        <p>
          All three are CORS-open and cached for five minutes, so scripts and
          agents can fetch them directly.
        </p>

        <h2>How it behaves in a frame</h2>
        <ul>
          <li>
            <strong>No chrome.</strong> <code>?embed=1</code> drops the site
            footer and page texture before first paint; <code>?nav=0</code> drops
            the header and contents rail too, for a host page that already has
            its own.
          </li>
          <li>
            <strong>One appearance.</strong> These docs are light only — no theme
            to negotiate with your page, and no switch for a reader to get wrong.
          </li>
          <li>
            <strong>Self-sizing.</strong> The frame posts a{" "}
            <code>stern-docs:size</code> message on every layout change;{" "}
            <code>embed.js</code> applies it. Handle the message yourself if you
            prefer.
          </li>
          <li>
            <strong>The round comes with it.</strong> The header carries how long
            is left and a join button while the program is open, and neither
            appears once it has closed.
          </li>
          <li>
            <strong>Links behave.</strong> Internal links navigate inside the
            frame; anything leaving the docs opens in a new tab rather than
            replacing the embed.
          </li>
        </ul>
      </section>
    </div>
  );
}
