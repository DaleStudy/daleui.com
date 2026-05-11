import { cloudflare } from "@cloudflare/vite-plugin";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    cloudflare(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "daleui-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
