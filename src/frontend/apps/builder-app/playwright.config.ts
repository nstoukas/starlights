import { defineConfig, devices } from "@playwright/test";

const port = 55099;
const baseURL = `http://localhost:${port}`;

/**
 * Browser tests for the builder app. The Vite dev server runs on its own, with the API base
 * pointed at the same origin, and each test stubs the API with page.route, so no backend or
 * Docker is needed. Uses the locally installed Google Chrome (no browser download).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: `npx vite --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_BASE: baseURL, BROWSER: "none" },
  },
});
