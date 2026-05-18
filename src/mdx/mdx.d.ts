declare module "*.mdx" {
  import type { MDXContent } from "mdx/types";

  export const frontmatter: unknown;
  const MDXComponent: MDXContent;
  export default MDXComponent;
}
