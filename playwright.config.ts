import { defineConfig, devices, type Project } from '@playwright/test';

// Every device below runs in all three engines: Chromium (Chrome, Edge, Samsung Internet),
// Firefox and WebKit (Safari). Firefox has no "mobile" emulation, so it gets the same
// screen size and touch input without the mobile flag.
const screens: Record<string, (typeof devices)[string]> = {
  'iphone-se': devices['iPhone SE'],
  'iphone-se-landscape': devices['iPhone SE landscape'],
  'iphone-15': devices['iPhone 15'],
  'iphone-15-landscape': devices['iPhone 15 landscape'],
  'android-small': devices['Galaxy S8'],
  'android-small-landscape': devices['Galaxy S8 landscape'],
  'android-large': devices['Pixel 7'],
  'android-large-landscape': devices['Pixel 7 landscape'],
  'ipad': devices['iPad (gen 7)'],
  'ipad-landscape': devices['iPad (gen 7) landscape'],
  'laptop': { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
  'desktop-large': { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
};

const projects: Project[] = [];
for (const engine of ['chromium', 'firefox', 'webkit'] as const) {
  for (const [name, device] of Object.entries(screens)) {
    const { defaultBrowserType: _engine, userAgent: _ua, isMobile, ...rest } = device;
    projects.push({
      name: `${engine}/${name}`,
      use: {
        ...rest,
        browserName: engine,
        // Playwright's full Chromium build (no separate headless-shell download needed).
        ...(engine === 'chromium' ? { channel: 'chromium' } : {}),
        // Keep the device's own user agent only in its native engine.
        ...(engine === device.defaultBrowserType ? { userAgent: device.userAgent } : {}),
        ...(engine === 'firefox' ? {} : { isMobile }),
      },
    });
  }
}

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://localhost:4173', locale: 'fr-FR' },
  projects,
  // Test the production build, as Cloudflare will serve it.
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
