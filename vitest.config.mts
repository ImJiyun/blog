import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Test files share one real Postgres test DB, and each file's beforeEach
    // truncates the shared tables via resetDb() — running files in parallel
    // (Vitest's default) lets one file's resetDb/writes race another file's
    // assertions. Force sequential file execution instead of adding
    // per-file DB isolation, which isn't worth the complexity at this scale.
    fileParallelism: false,
    // Vitest's default include glob matches any *.spec.ts file in the repo,
    // which would otherwise sweep up e2e/smoke.spec.ts and try to run it
    // against Playwright's test/expect, which aren't Vitest's.
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
