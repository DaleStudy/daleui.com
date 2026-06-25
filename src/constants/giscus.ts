/**
 * giscus 댓글 위젯 설정값.
 *
 * giscus는 GitHub Discussions를 백엔드로 사용하므로 `repo-id`·`category-id`는
 * 민감 정보가 아니다(공개되어도 무방). 다만 저장소/카테고리 변경 시 한곳에서만
 * 고치도록 상수로 분리하고, 빌드 시 `VITE_GISCUS_*` 환경변수로 덮어쓸 수 있게 한다.
 *
 * `repoId`·`categoryId` 값 발급: https://giscus.app/ko
 * (대상 저장소가 public이고 giscus 앱이 설치돼 있으며 Discussions가 켜져 있어야 한다.)
 */
export const giscusConfig = {
  /** `owner/repo` 형식. 댓글 Discussion이 생성될 저장소. */
  repo: (import.meta.env.VITE_GISCUS_REPO ?? "DaleStudy/daleui.com") as `${string}/${string}`,
  /** giscus.app에서 발급한 저장소 ID. */
  repoId: import.meta.env.VITE_GISCUS_REPO_ID ?? "",
  /** 댓글이 생성될 Discussion 카테고리 이름. */
  category: import.meta.env.VITE_GISCUS_CATEGORY ?? "Comments",
  /** giscus.app에서 발급한 카테고리 ID. */
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID ?? "",
} as const;

/** giscus client 스크립트 URL. */
export const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";

/** giscus iframe origin (postMessage 대상). */
export const GISCUS_ORIGIN = "https://giscus.app";

export type GiscusTheme = "light" | "dark";

/**
 * client.js `<script>`에 실을 `data-*` 속성 맵을 만든다.
 *
 * 설정 상수(repo·category 등)와 고정 옵션(mapping=pathname, lang=ko 등)에
 * 현재 테마를 합쳐 반환한다. 순수 함수라 렌더링 없이 단위 테스트할 수 있다.
 */
export function buildGiscusAttributes(
  theme: GiscusTheme,
): Record<string, string> {
  return {
    "data-repo": giscusConfig.repo,
    "data-repo-id": giscusConfig.repoId,
    "data-category": giscusConfig.category,
    "data-category-id": giscusConfig.categoryId,
    "data-mapping": "pathname",
    "data-strict": "0",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "bottom",
    "data-theme": theme,
    "data-lang": "ko",
  };
}
