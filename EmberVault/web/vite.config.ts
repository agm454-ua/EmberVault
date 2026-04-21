import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@locales': path.resolve(__dirname, './src/locales'),
			'@features': path.resolve(__dirname, './src/features'),
			'@config': path.resolve(__dirname, './src/core/config'),
			'@api': path.resolve(__dirname, './src/api'),
			'@router': path.resolve(__dirname, './src/core/router'),
			'@shared': path.resolve(__dirname, './src/shared'),
			'@styles': path.resolve(__dirname, './src/styles'),
			'@providers': path.resolve(__dirname, './src/core/providers'),
			'@stores': path.resolve(__dirname, './src/core/stores'),
			'@core': path.resolve(__dirname, './src/core'),
		},
	},
})
