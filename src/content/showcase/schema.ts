import { z } from "zod";

export const showcaseInputSchema = z.object({
  url: z.url(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.url().optional(),
});

export type ShowcaseInput = z.infer<typeof showcaseInputSchema>;

export const showcaseCardSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  image: z.string().min(1),
  siteName: z.string().min(1),
  url: z.url(),
});

export type ShowcaseCard = z.infer<typeof showcaseCardSchema>;
