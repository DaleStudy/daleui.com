import { codecovVitePlugin } from "@codecov/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { mdxPlugin } from "./src/mdx/plugin";

// PR 미리보기 빌드에서는 og:image 주소를 미리보기 주소로 맞춘다.
// GitHub Actions 가 PR 빌드에 넣어 주는 GITHUB_REF(refs/pull/<번호>/merge)에서 번호를 읽는다.
const prNumber = process.env.GITHUB_REF?.match(/^refs\/pull\/(\d+)\//)?.[1];

export default defineConfig({
  define: prNumber
    ? {
        "import.meta.env.VITE_SITE_URL": JSON.stringify(
          `https://pr-${prNumber}-daleui.dalestudy.workers.dev`,
        ),
      }
    : {},
  plugins: [
    mdxPlugin(),
    reactRouter(),
    svgr(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "daleui-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
