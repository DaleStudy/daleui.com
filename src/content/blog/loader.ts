import { createFinder } from "../../mdx/createFinder";
import type { MdxModule } from "../../mdx/types";
import { validateModules } from "../../mdx/validateFrontmatter";
import { type BlogFrontmatter, blogFrontmatterSchema } from "./schema";

const PREFIX = "./";

const rawModules = import.meta.glob<MdxModule<BlogFrontmatter>>("./**/*.mdx", {
  eager: true,
});

const validatedModules = validateModules(
  rawModules,
  blogFrontmatterSchema,
  PREFIX,
);

export const findBlog = createFinder(validatedModules, PREFIX, (a, b) =>
  b.frontmatter.date.localeCompare(a.frontmatter.date),
);
