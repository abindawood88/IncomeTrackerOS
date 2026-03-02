import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "smoke.spec.ts",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3001",
    headless: true,
  },
  webServer: {
    command: 'cmd /c "if exist .next rmdir /s /q .next && call npm.cmd run build && call npm.cmd run start -- -p 3001"',
    url: "http://127.0.0.1:3001",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
