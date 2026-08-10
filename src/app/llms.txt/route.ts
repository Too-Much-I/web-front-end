import { fetchAllBlogPosts } from "@/features/blog/fetch-all-blog-posts";
import { BLOG_DESCRIPTION } from "@/features/blog/blog-json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

// 세그먼트 설정은 정적으로 분석되므로 리터럴이어야 한다(BLOG_REVALIDATE_SECONDS와 동일 값).
export const revalidate = 300;

/**
 * 목록 한 줄에 들어갈 설명. 줄바꿈이 섞이면 마크다운 리스트 항목이 끊기므로 한 줄로 편다.
 */
function toSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Markdown 링크 레이블을 한 줄로 만들고 문법 문자를 이스케이프한다. */
function escapeMarkdownLabel(value: string): string {
  return toSingleLine(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

function link(label: string, path: string, note?: string): string {
  const line = `- [${escapeMarkdownLabel(label)}](${SITE_URL}${path})`;
  return note ? `${line}: ${toSingleLine(note)}` : line;
}

/**
 * llmstxt.org 규약을 따르는 안내 파일.
 *
 * H1(이름) → 인용구(한 줄 요약) → H2 섹션의 링크 목록이라는 고정 구조라, 언어 모델이
 * 사이트 전체를 크롤하지 않고도 어떤 문서가 있는지 한 번에 파악할 수 있다.
 *
 * 아직 어느 업체도 공식 지원을 밝히지 않은 제안 단계의 규약이다. 넣는 비용이 거의 없어
 * 두지만, 색인·인용에 미치는 효과는 구조화 데이터 쪽에서 나온다고 보는 편이 맞다.
 *
 * 마크다운이지만 text/plain으로 보낸다. 브라우저에서 바로 읽히게 하려는 것이고,
 * 규약도 별도의 MIME 타입을 요구하지 않는다.
 */
export async function GET() {
  // 백엔드가 응답하지 않아도 정적 안내만이라도 나가게 한다(sitemap과 같은 방침).
  const posts = await fetchAllBlogPosts().catch(() => []);

  const sections = [
    `# ${SITE_NAME}`,
    "",
    `> ${toSingleLine(SITE_DESCRIPTION)}`,
    "",
    "- 가입 없이 무료로 이용합니다. 실제 시험과 같은 11문항, 약 20분 구성입니다.",
    "- 대상 시험은 ETS TOEIC Speaking이며, 사이트 언어는 한국어입니다.",
    "- 채점은 발음·억양·문법·어휘·일관성 등 공식 채점 기준 항목별로 이루어집니다.",
    "",
    "## 주요 페이지",
    "",
    link("토선생 홈", "/", "서비스 소개와 무료 모의고사 시작"),
    link(
      "토익 스피킹 파트별 가이드",
      "/guide/toeic-speaking-parts",
      "파트 1~5의 문항 구성과 준비·답변 시간 정리",
    ),
    link("블로그", "/blog", toSingleLine(BLOG_DESCRIPTION)),
    link("문의하기", "/contact", "서비스 문의 및 제보"),
    "",
    "## 블로그 글",
    "",
    ...(posts.length > 0
      ? posts.map((post) =>
          link(post.title, `/blog/${post.slug}`, post.summary),
        )
      : ["- (현재 공개된 글을 불러오지 못했습니다.)"]),
    "",
    "## Optional",
    "",
    link("RSS 피드", "/rss.xml", "새 글 알림용 피드"),
    link("이용약관", "/terms"),
    link("개인정보처리방침", "/privacy"),
    "",
  ];

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
