import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocView } from "@/components/doc-view";
import { findDoc, loadProgramContent } from "@/lib/content";

export const revalidate = 300;

type Params = { params: Promise<{ program: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { program } = await params;
  const content = await loadProgramContent(program);
  if (!content) return {};
  const home = findDoc(content, []);
  const description = home?.description ?? content.config.tagline ?? undefined;
  return {
    title: content.config.title,
    description,
    alternates: { canonical: `/${program}` },
    openGraph: {
      title: content.config.title,
      description,
      url: `/${program}`,
      type: "website",
    },
  };
}

/**
 * The docs home. Renders content/<program>/index.md, then the section index
 * on a landing page the fastest thing you can give someone is the shape of the
 * whole manual.
 */
export default async function ProgramHome({ params }: Params) {
  const { program } = await params;
  const content = await loadProgramContent(program);
  if (!content) notFound();

  const home = findDoc(content, []);
  if (!home) notFound();

  return (
    <DocView content={content} doc={home}>
      <div className="section-index">
        {content.nav.map((group) => (
          <section className="section-card panel" key={group.id}>
            <h2 className="silkscreen">{group.label}</h2>
            {group.blurb ? (
              <p className="section-card__blurb">{group.blurb}</p>
            ) : null}
            <ul>
              {group.docs.map((doc) => (
                <li key={doc.href}>
                  <Link className="section-link" href={doc.href}>
                    <span className="led" aria-hidden />
                    <span>
                      <span className="section-link__title">{doc.title}</span>
                      {doc.description ? (
                        <span className="section-link__desc">
                          {doc.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DocView>
  );
}
