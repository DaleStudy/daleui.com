import type { MDXContent } from "mdx/types";

export type MdxModule<F> = {
  default: MDXContent;
  frontmatter: F;
};

export type MdxDoc<F> = MdxModule<F> & {
  slug: string;
};
