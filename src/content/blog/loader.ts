import { createCollection } from "../../mdx/createCollection";
import type { MdxModule } from "../../mdx/types";
import { validateModules } from "../../mdx/validateFrontmatter";
import { type BlogFrontmatter, blogFrontmatterSchema } from "./schema";

const PREFIX = "./";

const rawModules = import.meta.glob<MdxModule<BlogFrontmatter>>(["./**/*.md"], {
  eager: true,
});

const validatedModules = validateModules(
  rawModules,
  blogFrontmatterSchema,
  PREFIX,
);

const blog = createCollection(validatedModules, PREFIX, (a, b) =>
  b.frontmatter.date.localeCompare(a.frontmatter.date),
);

export const findBlog = blog.find;
export const listBlog = blog.list;
