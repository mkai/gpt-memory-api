import { defineConfig, configDefaults } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, "**/build/**"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: [
        ...(configDefaults.coverage.reporter ?? []),
        "text-summary",
        "lcov",
      ],
      exclude: [...(configDefaults.coverage.exclude ?? []), "**/dist/**"],
    },
  },
})
