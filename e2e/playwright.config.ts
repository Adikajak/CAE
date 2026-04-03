import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    // Runs auth.setup.ts once to create session files
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Authenticated as regular user (lea@mail.com)
    {
      name: 'chromium-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts|login\.spec\.ts|register\.spec\.ts|profile-public\.spec\.ts|teams-public\.spec\.ts|members-public\.spec\.ts|tournament-details-public\.spec\.ts|member-details-public\.spec\.ts/,
    },
    // Authenticated as admin (ines@mail.com)
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts|login\.spec\.ts|register\.spec\.ts|profile\.spec\.ts|profile-public\.spec\.ts|teams\.spec\.ts|members\.spec\.ts|tournament-details\.spec\.ts|teams-public\.spec\.ts|members-public\.spec\.ts|tournament-details-public\.spec\.ts|member-details\.spec\.ts|member-details-public\.spec\.ts|notification\.spec\.ts|notification\.spec\.ts/,
    },
    // No authentication — for login/register/unauthenticated tests
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec\.ts|register\.spec\.ts|profile-public\.spec\.ts|teams-public\.spec\.ts|members-public\.spec\.ts|tournament-details-public\.spec\.ts|member-details-public\.spec\.ts/,
    },
  ],
});
