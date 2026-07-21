import { z } from "zod";

export const testimonialSchema = z.object({
  /** 인용한 사람의 이름 */
  name: z.string().trim().min(1),
  /** 소속 또는 역할 (예: 엔지니어, 디자이너) */
  affiliation: z.string().trim().min(1),
  /** 인용문 */
  quote: z.string().trim().min(1),
  /** 프로필 이미지 URL (없으면 이름 첫 글자로 이니셜 아바타 표시) */
  avatar: z.url().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

/**
 * 마케팅 페이지 Testimonials 섹션에 노출되는 사용자/기여자 후기 목록.
 *
 * 후기를 추가하고 싶다면 이 배열에 항목 하나만 추가하는 PR을 보내주세요.
 * UI 코드는 수정할 필요가 없습니다.
 *
 *   {
 *     name: "이름",
 *     affiliation: "소속 또는 역할",
 *     quote: "후기 내용",
 *     avatar: "https://...", // 선택 사항, 생략하면 이니셜 아바타가 표시됩니다.
 *   }
 */
export const testimonials: Testimonial[] = [
  {
    name: "달레",
    affiliation: "엔지니어",
    quote:
      "달레UI 덕분에 디자인 시스템을 처음부터 만들 필요 없이, 바로 일관된 UI를 구축할 수 있었어요.",
    avatar: "https://avatars.githubusercontent.com/u/5466341",
  },
  {
    name: "Helena",
    affiliation: "엔지니어",
    quote:
      "접근성과 다크 모드가 기본으로 지원돼서, 별도의 고민 없이 신뢰하고 사용할 수 있는 컴포넌트예요.",
    avatar: "https://avatars.githubusercontent.com/u/38199103",
  },
  {
    name: "Ria (리아)",
    affiliation: "엔지니어",
    quote:
      "오픈소스라 직접 기여하면서 배우는 재미가 있어요. 커뮤니티도 활발해서 질문하면 금방 답이 돌아옵니다.",
    avatar: "https://avatars.githubusercontent.com/u/83909755",
  },
  {
    name: "윤섭",
    affiliation: "엔지니어",
    quote:
      "토큰 기반이라 브랜드에 맞춰 커스터마이징하기 편해요. 문서도 잘 되어 있어서 온보딩이 빨랐습니다.",
    avatar: "https://avatars.githubusercontent.com/u/47362439?v=4",
  },
  {
    name: "자혜",
    affiliation: "디자이너",
    quote:
      "디자이너와 개발자가 같은 컴포넌트를 기준으로 이야기할 수 있어서 협업이 훨씬 매끄러워졌어요.",
    avatar: "https://avatars.githubusercontent.com/u/89135410",
  },
  {
    name: "효성",
    affiliation: "엔지니어",
    quote:
      "컴포넌트 API가 직관적이라 처음 써보는데도 문서만 보고 금방 화면을 완성할 수 있었어요.",
    avatar: "https://avatars.githubusercontent.com/u/50227228",
  },
  {
    name: "승현",
    affiliation: "디자이너",
    quote:
      "일관된 토큰과 컴포넌트 덕분에 디자인 의도가 개발까지 그대로 전달돼서 만족스러워요.",
    avatar: "https://avatars.githubusercontent.com/u/69985950",
  },
];
