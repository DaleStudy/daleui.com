import type { ShowcaseInput } from "./schema";

/**
 * DaleUI를 사용 중인 프로젝트 목록. `{ url }` 한 줄만 추가하면 나머지 카드 정보는
 * 빌드 타임에 OG 메타데이터에서 자동 추출됩니다. OG가 부실할 때만
 * title/description/image를 수동으로 오버라이드하세요({@link ShowcaseInput}).
 */
export const showcaseEntries: ShowcaseInput[] = [
  { url: "https://www.daleui.com" },
];
