import { codecovVitePlugin } from "@codecov/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { mdxPlugin } from "./src/mdx/plugin";

export default defineConfig({
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
