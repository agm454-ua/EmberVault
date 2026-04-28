import type { Config } from 'tailwindcss'

export default {
	darkMode: ['selector', '[data-theme="dark"]'],
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				// Brand / primary actions
				primary: {
					50: '#FAEDE4',
					100: '#F5C4A7',
					400: '#E8895A',
					500: '#C1663F',
					600: '#BC4713',
					700: '#8C3410',
				},

				// Status colors
				success: {
					50: '#e6f4e6',
					500: '#2a9e45',
					600: '#2d7a3a',
				},
				warning: {
					50: '#fdf3e3',
					500: '#d98c0e',
					600: '#9a6510',
				},
				danger: {
					50: '#fceee9',
					500: '#f02806',
					600: '#c71907',
				},
				info: {
					50: '#e8f0fb',
					500: '#2563bf',
					600: '#1d4e8f',
				},

				// UI surfaces
				surface: {
					canvas: '#ffffff',
					DEFAULT: '#FDF7F2',
					muted: '#fcf7f3',
					gray: '#F3EDE9',
					tint: '#F5E9DD',
					raised: '#EEDCCB',
				},

				// Text
				ink: {
					DEFAULT: '#3D3D3D',
					muted: '#656565',
					inverse: '#ffffff',
					primary: '#C1663F',
					linked: '#2563bf',
				},

				// Borders
				stroke: {
					DEFAULT: '#C8C8C8',
					strong: '#656565',
					muted: '#F5F5F5',
					focus: '#BC4713',
				},
			},
			fontFamily: {
				sans: ['"Noto Sans Variable"', 'ui-sans-serif', 'system-ui'],
				heading: ['GFS Didot', 'serif'],
			},
		},
	},
	plugins: [],
} satisfies Config
