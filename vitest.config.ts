import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { mdxPlugin } from "./src/mdx/plugin";

export default defineConfig({
  plugins: [mdxPlugin(), react(), svgr()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/setupTests.tsx"],
    coverage: {
      exclude: ["styled-system/**"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 95,
        lines: 90,
      },
      reporter: ["text", "text-summary", "lcov"],
    },
  },
});
