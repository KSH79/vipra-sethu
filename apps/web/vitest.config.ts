import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.spec.ts', '__tests__/**/*.spec.tsx'],
    environmentMatchGlobs: [
      ['**/__tests__/**/components/**', 'jsdom'],
    ],
  },
})
