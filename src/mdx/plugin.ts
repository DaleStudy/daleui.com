import mdx from "@mdx-js/rollup";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { HmrContext } from "vite";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import rehypeMermaid from "rehype-mermaid";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { remarkDocsToc } from "./remark-docs-toc";
import { remarkLiveDemo } from "./remark-live-demo";
import { remarkVideoLink } from "./remark-video-link";

/** 목차와 heading id 생성은 문서 본문에만 적용합니다. 블로그 글은 기존대로 rehype-slug가 맡습니다. */
const DOCS_CONTENT = /[\\/]src[\\/]content[\\/]docs[\\/]/;

const EXAMPLE_SOURCE = /[\\/]src[\\/]examples[\\/]/;

function isDocsMdx(file: string) {
  return DOCS_CONTENT.test(file) && file.endsWith(".mdx");
}

/**
 * 예제 소스는 코드 탭 문자열로 MDX에 인라인되므로, 예제 파일만 고치면 MDX를 다시 컴파일해야
 * 코드 탭이 갱신됩니다. MDX 모듈은 HMR 경계가 아니라 어차피 리로드로 번지므로,
 * 문서 MDX 모듈을 모두 무효화하고 바로 전체 리로드합니다.
 */
function invalidateDocs({ file, server }: HmrContext) {
  if (!EXAMPLE_SOURCE.test(file)) {
    return;
  }

  for (const environment of Object.values(server.environments)) {
    for (const [id, modules] of environment.moduleGraph.fileToModulesMap) {
      if (!isDocsMdx(id)) {
        continue;
      }
      for (const module of modules) {
        environment.moduleGraph.invalidateModule(module);
      }
    }
  }

  server.hot.send({ type: "full-reload" });
}

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
        [remarkLiveDemo, { include: DOCS_CONTENT }],
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
    handleHotUpdate: invalidateDocs,
  };
}
