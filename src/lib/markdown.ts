/**
 * Markdown → HTML, plus the two by-products every page needs: the heading list
 * for the "on this page" rail, and plain text for the search index.
 *
 * Deliberately a string of HTML rather than MDX. Contributors are here to fix a
 * wrong command or add a missing step, and markdown is the format they can edit
 * on github.com without a toolchain. Nothing in the content can execute, which
 * is the property you want when the edit path is "anyone opens a pull request".
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString as mdastToString } from "mdast-util-to-string";
import { toString as hastToString } from "hast-util-to-string";
import type { Root as MdastRoot, Blockquote, Paragraph } from "mdast";
import type { Root as HastRoot, Element } from "hast";

export type Heading = { depth: 2 | 3; id: string; text: string };

/** GitHub's alert syntax, rendered as the panel-style callouts this site uses. */
const CALLOUTS: Record<string, string> = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
};

/**
 * `> [!WARNING]` blockquotes become <aside class="callout callout-warning">.
 * Supporting GitHub's own syntax means the markdown looks right in the PR diff
 * and on github.com, not just after our build.
 */
function remarkCallouts() {
  return (tree: MdastRoot) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const [first] = node.children;
      if (!first || first.type !== "paragraph") return;
      const [leading] = (first as Paragraph).children;
      if (!leading || leading.type !== "text") return;

      const lines = leading.value.split("\n");
      const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i.exec(
        lines[0].trim(),
      );
      if (!match) return;

      const kind = match[1].toUpperCase();
      // Anything after the marker on the same line is kept as body text.
      const remainder = [match[2], ...lines.slice(1)].join("\n").trim();
      leading.value = remainder;
      if (remainder === "" && (first as Paragraph).children.length === 1) {
        node.children.shift();
      }

      node.data = {
        ...node.data,
        hName: "aside",
        hProperties: { className: ["callout", `callout-${kind.toLowerCase()}`] },
      };
      node.children.unshift({
        type: "paragraph",
        data: { hProperties: { className: ["callout-label"] } },
        children: [{ type: "text", value: CALLOUTS[kind] }],
      } as Paragraph);
    });
  };
}

/** Collects h2/h3 into the array the caller passes in, after slugs exist. */
function rehypeCollectHeadings(headings: Heading[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = typeof node.properties?.id === "string" ? node.properties.id : "";
      if (!id) return;
      headings.push({
        depth: node.tagName === "h2" ? 2 : 3,
        id,
        text: hastToString(node),
      });
    });
  };
}

/**
 * Two things content authors shouldn't have to think about: wide tables need
 * their own scroll container so the page body never scrolls sideways, and links
 * that leave the docs should say so — especially in an embed, where a link
 * replacing the iframe's contents is a dead end.
 */
function rehypePolish() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//i.test(href)) {
          node.properties = {
            ...node.properties,
            target: "_blank",
            // hast models space-separated attributes as arrays.
            rel: ["noreferrer", "noopener"],
            className: [
              ...(Array.isArray(node.properties?.className)
                ? (node.properties.className as string[])
                : []),
              "external",
            ],
          };
        }
      }

      if (node.tagName === "img") {
        node.properties = { ...node.properties, loading: "lazy", decoding: "async" };
      }

      if (node.tagName === "table" && parent && typeof index === "number") {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [node],
        };
        return "skip" as const;
      }
    });
  };
}

const processor = (headings: Heading[]) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeSlug)
    // Before the autolink pass, deliberately: it appends a "#" text node inside
    // the heading, which would otherwise end up in every entry of the contents
    // rail ("The box#").
    .use(rehypeCollectHeadings, headings)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Link to section" },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, {
      // Both themes emit inline CSS variables; globals.css swaps between them,
      // so a theme toggle doesn't need a re-render or a second highlight pass.
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
      defaultLang: "text",
    })
    .use(rehypePolish)
    .use(rehypeStringify);

export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = [];
  const file = await processor(headings).process(markdown);
  return { html: String(file), headings };
}

/** Prose with the syntax taken out, for search snippets. */
export function plainText(markdown: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  return mdastToString(tree as MdastRoot).replace(/\s+/g, " ").trim();
}
