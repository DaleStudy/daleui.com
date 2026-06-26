import GiscusWidget from "@giscus/react";
import { useTheme } from "../hooks/useTheme";
import { giscusConfig } from "../constants/giscus";

interface GiscusProps {
  /** 댓글을 붙일 글의 discussion 번호(= slug). */
  term: string;
}

/**
 * giscus 댓글 위젯.
 *
 * 스크립트 주입·iframe 생명주기·테마/글 변경 시 setConfig 전달은 공식
 * `@giscus/react`가 맡는다. 여기서는 설정값(constants/giscus)과 현재 테마만 넘긴다.
 *
 * 블로그 글 slug가 곧 "블로그" 카테고리 Discussion 번호라 mapping=number로 연결한다.
 */
export function Giscus({ term }: GiscusProps) {
  const { isDark } = useTheme();

  return (
    <GiscusWidget
      repo={giscusConfig.repo}
      repoId={giscusConfig.repoId}
      category={giscusConfig.category}
      categoryId={giscusConfig.categoryId}
      mapping="number"
      term={term}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={isDark ? "dark" : "light"}
      lang="ko"
    />
  );
}
