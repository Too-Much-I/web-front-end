import { marked, type Token } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * 본문에서 가장 큰 제목이 될 수 있는 단계. 페이지의 h1은 글 제목이 이미 쓰고 있다.
 * 본문 마크다운은 대부분 `# 제목`으로 시작하므로 그대로 두면 h1이 두 개가 된다.
 */
const TOP_HEADING_LEVEL = 2;
/** 아래로는 h4까지만 쓴다(그 아래는 .blog-prose에 스타일이 없다). */
const MAX_HEADING_LEVEL = 4;

/** 제목끼리 같은 문장인지 볼 때 쓰는 정규화. 서식 기호·공백·문장부호 차이는 무시한다. */
function normalizeHeading(text: string): string {
  return stripMarkdown(text).replace(/[?!.·:;]+$/u, "");
}

/**
 * 게시글 본문(마크다운)을 HTML로 변환한다.
 *
 * 본문은 DB의 content_markdown에서 오고 렌더링 결과를 dangerouslySetInnerHTML로
 * 넣기 때문에, 등록 단계 검증과 별개로 렌더링 시점에도 sanitize한다
 * (docs/blog.md 6.3). 서버 컴포넌트에서만 호출한다 — sanitize-html은 Node 전용이라
 * 클라이언트 번들에 들어가면 안 된다.
 *
 * 제목 처리는 두 가지다.
 * 1. 본문 첫 제목이 글 제목과 같은 문장이면 버린다. 백엔드 본문은 대개 `# 글 제목`으로
 *    시작하는데, 페이지 헤더가 이미 같은 문장을 h1으로 렌더하고 있어 그대로 두면
 *    같은 제목이 연달아 두 번 나온다.
 * 2. 남은 제목은 한 단계씩 내린다(`#`→h2, `##`→h3, 그 아래는 h4). 글 제목이 페이지의
 *    유일한 h1이어야 문서 구조가 맞고, sanitize 허용 목록에 h1이 없어 강등하지 않으면
 *    태그만 벗겨진 맨 텍스트로 남기 때문이다.
 */
export async function renderMarkdown(
  markdown: string,
  { title }: { title?: string } = {},
): Promise<string> {
  const tokens = marked.lexer(markdown, { gfm: true, breaks: false });

  // 앞쪽 빈 줄을 건너뛰고 첫 블록만 본다. 본문 중간에 같은 문장이 또 나오는 것까지
  // 지우면 글쓴이가 의도한 반복을 임의로 삭제하게 된다.
  const firstIndex = tokens.findIndex((token) => token.type !== "space");
  const first = tokens[firstIndex];
  if (
    title &&
    first?.type === "heading" &&
    normalizeHeading(first.text) === normalizeHeading(title)
  ) {
    tokens.splice(firstIndex, 1);
  }

  marked.walkTokens(tokens, (token: Token) => {
    if (token.type === "heading") {
      token.depth = Math.min(
        token.depth + TOP_HEADING_LEVEL - 1,
        MAX_HEADING_LEVEL,
      );
    }
  });

  const rawHtml = marked.parser(tokens, { gfm: true, breaks: false });

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
