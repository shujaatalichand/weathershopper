import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const env = process.env.ENV || 'stage';

dotenv.config({
  path: path.resolve(__dirname, `.env.${env}`)
});

if (!process.env.BASE_URL) {
  throw new Error(`BASE_URL is missing. Check .env.${env}`);
}

export default defineConfig({
  testDir: './',
  testMatch: ['e2e/**/*.spec.ts'],
  timeout: 60 * 1000,
  globalTimeout: 10 * 60 * 1000,

  expect: {
    timeout: 10000
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 1,
  workers: process.env.CI ? 2 : 2,

  reporter: [
    ['list'],
    ['allure-playwright']
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'on',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});