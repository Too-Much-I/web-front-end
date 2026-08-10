import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      // 문제 이미지 버킷(arn:aws:s3:::to-teacher-exam).
      // 리전 엔드포인트와 리전 없는 구형 엔드포인트가 둘 다 나올 수 있어 함께 등록한다.
      {
        protocol: "https",
        hostname: "to-teacher-exam.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "to-teacher-exam.s3.amazonaws.com",
      },
      // 블로그 썸네일 버킷(arn:aws:s3:::to-teacher-web-blog, ap-northeast-2).
      {
        protocol: "https",
        hostname: "to-teacher-web-blog.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "to-teacher-web-blog.s3.amazonaws.com",
      },
    ],
  },
  async headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

    return [
      {
        source: "/exam/:path*",
        headers: noIndex,
      },
      // 앱 웹뷰 전용 화면. 네이티브 앱 안에서만 열리므로 검색 결과에 나올 이유가 없고,
      // app-settings의 약관·개인정보처리방침은 /terms, /privacy와 사실상 같은 내용이라
      // 색인되면 중복 콘텐츠가 된다. robots.txt의 Disallow가 아니라 헤더로 막는 이유는
      // src/app/robots.ts의 주석과 같다 — 크롤을 막으면 크롤러가 noindex를 읽지 못한다.
      //
      // `/app-:path*` 같은 접두사 한 줄로는 못 잡는다. 반복 파라미터는 앞에 `/` 구분자가
      // 있어야 해서 path-to-regexp가 빌드 시점에 거부한다. 웹뷰 라우트를 추가하면
      // 여기에도 함께 넣어야 한다.
      {
        source: "/app-exam-screen",
        headers: noIndex,
      },
      {
        source: "/app-question-feedback",
        headers: noIndex,
      },
      {
        source: "/app-settings/:path*",
        headers: noIndex,
      },
    ];
  },
};

export default nextConfig;
