import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
interface UIStore {
	theme: Theme
	language: string
	setTheme: (theme: Theme) => void
	setLanguage: (lang: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
	theme: 'light',
	language: '',
	setTheme: (theme) => set({ theme }),
	setLanguage: (language) => set({ language }),
}))
