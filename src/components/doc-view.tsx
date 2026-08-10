import { OnThisPage } from "@/components/on-this-page";
import { PageActions } from "@/components/page-actions";
import { Pager } from "@/components/pager";
import {
  editUrl,
  neighbours,
  type Doc,
  type ProgramContent,
} from "@/lib/content";
import { rawUrl } from "@/lib/llms";
import { renderMarkdown } from "@/lib/markdown";
import { CONTENT_BRANCH, CONTENT_REPO, SITE_URL } from "@/lib/site";

/**
 * One documentation page: eyebrow, title, lede, body, and the two rails of
 * everything-else (contents on the right, actions and pager at the foot).
 *
 * The eyebrow is the doc's section, which is real information — it tells you
 * whether you're reading setup or shipping rules — as opposed to a decorative
 * "01 / 02 / 03" that would imply an order these pages don't all have.
 */
export async function DocView({
  content,
  doc,
  children,
}: {
  content: ProgramContent;
  doc: Doc;
  /** Extra blocks after the prose — the home page's section index uses this. */
  children?: React.ReactNode;
}) {
  const { html, headings } = await renderMarkdown(doc.body);
  const { previous, next } = neighbours(content, doc);
  const edit = editUrl(doc, content.config, CONTENT_REPO, CONTENT_BRANCH);
  const section = content.nav.find((group) => group.id === doc.group)?.label;

  return (
    <div className="doc-shell">
      <article className="doc">
        <header className="doc-head">
          <p className="silkscreen doc-eyebrow">
            {section ?? content.config.title}
          </p>
          <h1 className="display doc-title">{doc.title}</h1>
          {doc.description ? <p className="doc-lede">{doc.description}</p> : null}
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {children}

        <PageActions
          canonicalUrl={`${SITE_URL}${doc.href}`}
          markdownUrl={rawUrl(content.program, doc.segments)}
          markdown={doc.body}
          editUrl={edit}
        />
        <Pager previous={previous} next={next} />
      </article>

      <OnThisPage headings={headings} />
    </div>
  );
}
