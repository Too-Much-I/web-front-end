#!/usr/bin/env node
// public/의 PNG·JPG를 WebP로 바꾸고, src/에서 그 경로를 참조하던 곳도 .webp로 고친다.
// 사용법:
//   pnpm images:webp                  main에 없는(새로 추가한) PNG·JPG 전부
//   pnpm images:webp public/a.png ... 지정한 파일만
import { execFileSync } from "node:child_process";
import {
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";
import { RASTER_EXT, isAllowedRaster } from "./image-policy.mjs";

/** 이보다 넓은 원본은 줄인다. 화면에서 가장 크게 보이는 이미지도 레티나 기준 이 폭이면 충분하다. */
const MAX_WIDTH = 2000;
const REFERENCE_EXT = /\.(tsx?|jsx?|mjs|css|mdx?|json)$/;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const newRasterFiles = () => {
  const onMain = new Set(
    execFileSync(
      "git",
      // -z: 한글 등 비ASCII 경로를 따옴표로 감싸지 않고 그대로 받는다.
      ["ls-tree", "-r", "-z", "--name-only", "origin/main", "public"],
      { encoding: "utf8" },
    ).split("\0"),
  );
  return walk("public").filter(
    (path) =>
      RASTER_EXT.test(path) && !onMain.has(path) && !isAllowedRaster(path),
  );
};

const targets =
  process.argv.length > 2 ? process.argv.slice(2) : newRasterFiles();

if (targets.length === 0) {
  console.log("바꿀 PNG·JPG가 없어요.");
  process.exit(0);
}

const sourceFiles = walk("src").filter((path) => REFERENCE_EXT.test(path));

for (const target of targets) {
  const path = relative(process.cwd(), target);
  if (!RASTER_EXT.test(path)) {
    console.warn(`건너뜀: ${path} (PNG·JPG가 아님)`);
    continue;
  }

  const output = path.replace(RASTER_EXT, ".webp");
  await sharp(path)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(output);

  const before = statSync(path).size;
  const after = statSync(output).size;
  unlinkSync(path);

  // public/a/b.png는 화면에서 /a/b.png로 참조된다.
  const fromUrl = `/${relative("public", path)}`;
  const toUrl = `/${relative("public", output)}`;
  const updated = sourceFiles.filter((file) => {
    const text = readFileSync(file, "utf8");
    if (!text.includes(fromUrl)) return false;
    writeFileSync(file, text.split(fromUrl).join(toUrl));
    return true;
  });

  console.log(
    `${path} → ${output}  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  );
  if (after > before)
    console.warn("  ⚠ 원본보다 커졌어요. 품질이나 크기를 확인해 주세요.");
  for (const file of updated) console.log(`  경로 수정: ${file}`);
  if (updated.length === 0)
    console.warn(`  ⚠ src/에서 ${fromUrl}를 참조하는 곳이 없어요.`);
}
