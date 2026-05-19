import { cloudflare } from "@cloudflare/vite-plugin";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import rehypeMermaid from "rehype-mermaid";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { remarkVideoLink } from "./src/mdx/remark-video-link";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkGfm,
          remarkVideoLink,
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
    },
    reactRouter(),
    svgr(),
    cloudflare(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "daleui-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
