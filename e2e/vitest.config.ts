import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        testTimeout: 1000 * 60,
        include: ['./**/*.test.ts'],
        hookTimeout: 60 * 1000,
        threads: false
    }
})
