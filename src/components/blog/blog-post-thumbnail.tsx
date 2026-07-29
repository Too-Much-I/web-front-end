import Image from "next/image";

/**
 * 썸네일이 없는 글도 카드가 비어 보이지 않도록, slug에서 결정론적으로 고른
 * 브랜드 계열 그라디언트를 대신 그린다.
 */
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #fdba74, #ea580c)",
  "linear-gradient(135deg, #1e3a8a, #172554)",
  "linear-gradient(135deg, #fbbf24, #f97316)",
  "linear-gradient(135deg, #fb923c, #1e3a8a)",
] as const;

function pickGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
}

export function BlogPostThumbnail({
  slug,
  thumbnailUrl,
  title,
  priority = false,
  sizes = "(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw",
}: {
  slug: string;
  thumbnailUrl: string | null;
  title: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!thumbnailUrl) {
    return (
      <div
        aria-hidden
        className="aspect-video w-full"
        style={{ backgroundImage: pickGradient(slug) }}
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-orange-50">
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
