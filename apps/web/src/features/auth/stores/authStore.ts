import { client } from '@/api/client'
import { create } from 'zustand'

let initializePromise: Promise<void> | null = null

type AuthState = {
	accessToken: string | null
	isInitialized: boolean
	setAccessToken: (token: string | null) => void
	clearAuth: () => void
	initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: null,
	isInitialized: false,

	setAccessToken: (token) => set({ accessToken: token }),
	clearAuth: () => set({ accessToken: null, isInitialized: true }),

	initialize: async () => {
		if (useAuthStore.getState().isInitialized) return
		if (initializePromise) return initializePromise

		initializePromise = (async () => {
			try {
				const res = await client.post('/auth/api/refresh', {})
				const accessToken: string | null = res.data?.data?.token ?? null

				set({ accessToken, isInitialized: true })
			} catch {
				set({ accessToken: null, isInitialized: true })
			} finally {
				initializePromise = null
			}
		})()

		return initializePromise
	},
}))
