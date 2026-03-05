import { defineConfig } from "@playwright/test";

const PORT = 3001;
const url = `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;

const webServerCommand =
  isCI
    ? `npm run start -- -p ${PORT} -H 127.0.0.1`
    : process.platform === "win32"
      ? `cmd /c "if exist .next rmdir /s /q .next && npm run build && npm run start -- -p ${PORT} -H 127.0.0.1"`
      : `rm -rf .next && npm run build && npm run start -- -p ${PORT} -H 127.0.0.1`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "smoke.spec.ts",
  timeout: 30_000,
  use: {
    baseURL: url,
    headless: true,
  },
  webServer: {
    command: webServerCommand,
    url,
    reuseExistingServer: !isCI,
    timeout: 240_000,
  },
});
