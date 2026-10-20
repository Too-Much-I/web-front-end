#!/usr/bin/env node
// PR에서 public/에 새로 들어오거나 바뀐 이미지를 검사한다.
// 사용법: node scripts/check-images.mjs [기준 ref, 기본값 origin/main]
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import {
  EMBEDDED_RASTER,
  IMAGE_EXT,
  MAX_IMAGE_BYTES,
  RASTER_EXT,
  isAllowedRaster,
} from "./image-policy.mjs";

const base = process.argv[2] ?? "origin/main";

// A(추가)·M(수정)·R(이름 변경)만 본다. 지운 파일은 검사할 게 없다.
const diff = execFileSync(
  "git",
  [
    "diff",
    "--name-status",
    "--diff-filter=AMR",
    // -z: 한글 등 비ASCII 경로를 따옴표·8진수로 감싸지 않고 그대로 받는다.
    "-z",
    `${base}...HEAD`,
    "--",
    "public",
  ],
  { encoding: "utf8" },
);

// -z 출력은 "상태\0경로\0"이고, 이름 변경(R)만 "상태\0옛 경로\0새 경로\0"이다.
const fields = diff.split("\0").filter(Boolean);
const changed = [];
for (let i = 0; i < fields.length;) {
  const status = fields[i][0];
  const width = status === "R" ? 2 : 1;
  changed.push({ status, path: fields[i + width] });
  i += width + 1;
}

const errors = [];

// public/ 이미지는 브라우저가 30일 동안 다시 묻지 않고 캐시한다(next.config.ts).
// 같은 이름으로 내용만 바꾸면 그동안 옛 이미지가 보이므로, 바뀐 이미지는 새 이름을 써야 한다.
const usedOnBase = (path) =>
  execFileSync("git", ["log", "-1", "--format=%h", base, "--", path], {
    encoding: "utf8",
  }).trim() !== "";

for (const { status, path } of changed) {
  if (!IMAGE_EXT.test(path)) continue;

  // 추가(A)나 이름 변경(R)이라도 예전에 쓰던 이름이면 같은 문제가 생긴다.
  if (status === "M" || usedOnBase(path)) {
    errors.push(
      `${path}: 이미 쓰던 이름이에요. 브라우저 캐시 때문에 옛 이미지가 보일 수 있으니 새 이름(예: -v2)으로 올리고 참조 경로도 바꿔 주세요.`,
    );
    continue;
  }

  if (RASTER_EXT.test(path) && !isAllowedRaster(path)) {
    errors.push(`${path}: PNG·JPG 대신 WebP로 올려 주세요.`);
  }

  if (
    path.endsWith(".svg") &&
    EMBEDDED_RASTER.test(readFileSync(path, "utf8"))
  ) {
    errors.push(
      `${path}: PNG를 base64로 감싼 SVG예요. 보이는 영역만 잘라 WebP로 올려 주세요.`,
    );
  }

  const bytes = statSync(path).size;
  if (bytes > MAX_IMAGE_BYTES) {
    errors.push(
      `${path}: ${Math.round(bytes / 1024)}KB예요. ${MAX_IMAGE_BYTES / 1024}KB 이하로 줄여 주세요.`,
    );
  }
}

if (errors.length > 0) {
  console.error("이미지 검사 실패\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error(
    "\nPNG·JPG는 `pnpm images:webp`로 WebP 변환과 코드 경로 수정을 한 번에 할 수 있어요.",
  );
  console.error(
    "PNG로 남겨야 하는 파일(링크 미리보기·아이콘 등)이면 scripts/image-policy.mjs의 RASTER_ALLOWLIST에 추가하세요.",
  );
  process.exit(1);
}

console.log(`이미지 검사 통과 (${changed.length}개 파일 확인)`);
