import { defineConfig, devices } from '@playwright/test';

/**
 * mentorme-test-grid Playwright config.
 * Safe defaults:
 *   - Headless (CI-friendly)
 *   - Chromium only by default (add more in `projects` if you need them)
 *   - Retries on CI (catches flakes without hiding bugs)
 *   - Outputs JSON results to test-grid/api/status.json via the global reporter
 */
const BASE_URL =
  process.env.TEST_GRID_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-grid/playwright-report.json' }],
    ['html', { outputFolder: 'test-grid/playwright-html', open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Optional: spin up the dev server before tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: BASE_URL,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },
});
