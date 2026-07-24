import { z } from "zod";

/** 쇼케이스 항목은 실제 웹페이지여야 하므로 http/https URL만 허용합니다. */
const httpUrl = z.url({ protocol: /^https?$/ });

export const showcaseInputSchema = z.object({
  url: httpUrl,
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  image: httpUrl.optional(),
});

export type ShowcaseInput = z.infer<typeof showcaseInputSchema>;

export const showcaseCardSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  image: z.string().min(1),
  siteName: z.string().min(1),
  url: httpUrl,
});

export type ShowcaseCard = z.infer<typeof showcaseCardSchema>;
