"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  isSearchQueryTooShort,
  normalizeSearchQuery,
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
} from "@/features/blog/api/search-blog-posts";

/**
 * 제출하면 `/blog/search`로 이동하는 검색창.
 *
 * 목록 안에서 걸러내지 않고 별도 라우트로 보내는 이유는
 * docs/blog-search-route-separation.md 참고.
 */
export function BlogSearchField({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = normalizeSearchQuery(value);
    if (isSearchQueryTooShort(query)) {
      setError(`검색어는 ${SEARCH_QUERY_MIN_LENGTH}자 이상 입력해 주세요.`);
      return;
    }

    setError(null);
    router.push(`/blog/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full max-w-lg">
      <div className="relative flex items-center">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 size-4 text-zinc-400"
        />
        <input
          type="search"
          name="q"
          value={value}
          maxLength={SEARCH_QUERY_MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          aria-label="블로그 글 검색"
          aria-invalid={error ? true : undefined}
          placeholder="궁금한 주제를 검색해 보세요"
          className="w-full rounded-full border border-orange-200 bg-white py-3 pr-4 pl-11 text-sm text-blue-950 shadow-sm placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 focus:outline-none sm:text-base"
        />
      </div>
      {error ? (
        <p role="alert" className="pt-2 pl-4 text-sm text-orange-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
