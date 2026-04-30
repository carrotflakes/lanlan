import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    postcss: {
      plugins: []
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  }
});
