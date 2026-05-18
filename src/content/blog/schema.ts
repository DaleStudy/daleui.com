import { z } from "zod";

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  author: z.string().min(1),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
