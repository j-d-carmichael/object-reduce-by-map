import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
        }
      ],
      headless: true,
    },
    include: ['**/*_test.js', '**/*_test.ts'],
    exclude: ['node_modules', 'dist'],
  }
});
