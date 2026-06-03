import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "@react-router/dev/config";

const blogDir = join(import.meta.dirname, "src/content/blog");
const blogSlugs = readdirSync(blogDir)
  .filter((name) => name.endsWith(".mdx"))
  .map((name) => name.replace(/\.mdx$/, ""));

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: false,
  async prerender({ getStaticPaths }) {
    return [...getStaticPaths(), ...blogSlugs.map((slug) => `/blog/${slug}`)];
  },
} satisfies Config;
