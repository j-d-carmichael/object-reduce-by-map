import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser/providers/playwright';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
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
