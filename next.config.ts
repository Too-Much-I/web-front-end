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
    return [
      {
        source: "/exam/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
