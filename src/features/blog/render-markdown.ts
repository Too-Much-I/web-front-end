import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * 게시글 본문(마크다운)을 HTML로 변환한다.
 *
 * 본문은 DB의 content_markdown에서 오고 렌더링 결과를 dangerouslySetInnerHTML로
 * 넣기 때문에, 등록 단계 검증과 별개로 렌더링 시점에도 sanitize한다
 * (docs/blog.md 6.3). 서버 컴포넌트에서만 호출한다 — sanitize-html은 Node 전용이라
 * 클라이언트 번들에 들어가면 안 된다.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const rawHtml = await marked.parse(markdown, { gfm: true, breaks: false });

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "strong",
      "em",
      "del",
      "code",
      "pre",
      "hr",
      "br",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // 본문의 외부 링크는 새 탭으로 열되, 탭 탈취(reverse tabnabbing)를 막는다.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const isExternal = /^https?:\/\//.test(href);
        return {
          tagName,
          attribs: isExternal
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });
}

/** 마크다운에서 서식 기호를 걷어낸 순수 텍스트. 읽는 시간 계산에 쓴다. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
