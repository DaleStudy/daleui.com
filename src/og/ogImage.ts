/**
 * OG 이미지 관련 상수와 URL 헬퍼.
 *
 * 실제 PNG는 `scripts/generate-og.mts`가 빌드 타임에 `public/og/` 아래로 생성하며,
 * 파일명은 slug 기반으로 결정적입니다. 여기서는 라우트가 `<meta og:image>`를
 * 주입할 때 사용할 절대 URL만 계산합니다(소셜 스크레이퍼는 절대 URL을 요구함).
 */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL ?? "https://www.daleui.com";

/** OG 이미지 규격 (소셜 카드 표준 1.91:1). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** 블로그 글 OG 이미지의 사이트 루트 기준 경로. */
export function blogOgImagePath(slug: string): string {
  return `/og/blog/${slug}.png`;
}

/** 블로그 글 OG 이미지의 절대 URL. */
export function blogOgImageUrl(slug: string): string {
  return `${SITE_URL}${blogOgImagePath(slug)}`;
}

/** 정적 페이지(홈·블로그 목록 등) OG 이미지의 절대 URL. */
export function staticOgImageUrl(name: string): string {
  return `${SITE_URL}/og/${name}.png`;
}
