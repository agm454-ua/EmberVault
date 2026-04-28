import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
        },
    },
    resolve: {
        alias: {
            '@services': path.resolve(__dirname, './src/services'),
            '@controllers': path.resolve(__dirname, './src/controllers'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@middlewares': path.resolve(__dirname, './src/middlewares'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@config': path.resolve(__dirname, './src/config'),
            '@mappers': path.resolve(__dirname, './src/mappers'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@customTypes': path.resolve(__dirname, './src/types'),
        },
    },
})
