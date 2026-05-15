import { createFinder } from "../lib/createFinder";
import { validateModules } from "../lib/validateFrontmatter";
import { type BlogFrontmatter, blogFrontmatterSchema } from "../schemas/blog";
import type { MdxModule } from "../types";

const PREFIX = "../blog/";

const rawModules = import.meta.glob<MdxModule<BlogFrontmatter>>(
  "../blog/**/*.mdx",
  {
    eager: true,
  },
);

const validatedModules = validateModules(
  rawModules,
  blogFrontmatterSchema,
  PREFIX,
);

export const findBlog = createFinder(validatedModules, PREFIX, (a, b) =>
  b.frontmatter.date.localeCompare(a.frontmatter.date),
);
