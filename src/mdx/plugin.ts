import mdx from "@mdx-js/rollup";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import rehypeMermaid from "rehype-mermaid";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { remarkDocsToc } from "./remark-docs-toc";
import { remarkVideoLink } from "./remark-video-link";

/** 목차와 heading id 생성은 문서 본문에만 적용합니다. 블로그 글은 기존대로 rehype-slug가 맡습니다. */
const DOCS_CONTENT = /[\\/]src[\\/]content[\\/]docs[\\/]/;

/** 개발 서버·빌드와 테스트가 같은 방식으로 MDX를 컴파일하도록 한곳에서 정의합니다. */
export function mdxPlugin() {
  return {
    enforce: "pre" as const,
    ...mdx({
      format: "detect",
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkGfm,
        remarkVideoLink,
        [remarkDocsToc, { include: DOCS_CONTENT }],
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "noreferrer"] },
        ],
        [rehypeMermaid, { strategy: "pre-mermaid" }],
        [
          rehypeExpressiveCode,
          {
            themes: ["github-light", "github-dark"],
          },
        ],
      ],
    }),
  };
}
