import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '@stores/uiStore'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const theme = useUIStore((s) => s.theme)

	useEffect(() => {
		const root = document.documentElement
		if (theme === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			root.setAttribute('data-theme', prefersDark ? 'dark' : 'light ')
		} else {
			root.setAttribute('data-theme', theme)
		}
	}, [theme])

	return children
}

export default ThemeProvider
