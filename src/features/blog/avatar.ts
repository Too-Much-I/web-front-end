/**
 * 아바타는 이미지 파일이 아니라 avatarSeed 문자열에서 결정론적으로 만들어 낸
 * 그라디언트 원이다. 서버가 준 seed(예: "otter-14")가 같으면 언제 어디서 그리든
 * 같은 색이 나오므로, 별도 이미지 자산이나 CDN 없이 익명 프로필을 표현할 수 있다.
 */

/** 브랜드(오렌지)와 blue-950 사이 계열로 묶은 아바타 배경. */
const AVATAR_GRADIENTS = [
  "linear-gradient(140deg, #fb923c, #ea580c)",
  "linear-gradient(140deg, #60a5fa, #1e3a8a)",
  "linear-gradient(140deg, #fbbf24, #f97316)",
  "linear-gradient(140deg, #34d399, #0f766e)",
  "linear-gradient(140deg, #f472b6, #be185d)",
  "linear-gradient(140deg, #a78bfa, #5b21b6)",
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function avatarGradient(seed: string): string {
  return AVATAR_GRADIENTS[hashSeed(seed) % AVATAR_GRADIENTS.length];
}

/**
 * 아바타 안에 넣을 글자. "성실한 당근"처럼 형용사 + 명사 형태이므로 명사의 첫 글자를
 * 쓴다. 공백이 없으면 첫 글자로 떨어진다.
 */
export function avatarInitial(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return "?";
  const lastWord = trimmed.split(/\s+/).at(-1) ?? trimmed;
  return lastWord.charAt(0);
}
