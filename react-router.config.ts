import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "@react-router/dev/config";
import { DOCS_FLAT_ITEMS } from "./src/sections/docs/docsNav";

const blogDir = join(import.meta.dirname, "src/content/blog");
const blogSlugs = readdirSync(blogDir)
  .filter((name) => /\.mdx?$/.test(name))
  .map((name) => name.replace(/\.mdx?$/, ""));

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: false,
  async prerender({ getStaticPaths }) {
    return [
      ...getStaticPaths(),
      ...blogSlugs.map((slug) => `/blog/${slug}`),
      ...DOCS_FLAT_ITEMS.map((item) => `/docs/${item.id}`),
    ];
  },
} satisfies Config;
