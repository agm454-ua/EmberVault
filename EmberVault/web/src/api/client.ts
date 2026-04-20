import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios'
import ENV from '../core/config/env'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { queryClient } from './queryClient'

interface ApiErrorPayload {
	code: string
	message: string
}

let isRefreshing = false
let failedQueue: Array<{
	resolve: (token: string) => void
	reject: (err: unknown) => void
}> = []

const buildApiUrl = (path: string) => `${ENV.VITE_BASE_API_URL.replace(/\/+$/, '')}${path}`

const isRefreshEndpoint = (url?: string) => typeof url === 'string' && url.includes('/auth/api/refresh')

function processQueue(error: unknown, token: string | null) {
	failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
	failedQueue = []
}

export const client: AxiosInstance = axios.create({
	baseURL: ENV.VITE_BASE_API_URL,
	withCredentials: true,
})

// Attach access token to every request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = useAuthStore.getState().accessToken
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

// Handle 401 / 403 / 404 responses
client.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiErrorPayload>) => {
		const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
		const status = error.response?.status
		const isRefreshCall = isRefreshEndpoint(original?.url)

		//  404: just let it bubble up normally
		if (status === 404) {
			// TODO add notification
			return Promise.reject(error)
		}

		//  403: user lacks privilege, do NOT refresh
		if (status === 403) {
			// TODO add notification
			return Promise.reject(error)
		}

		// Refresh endpoint itself should never trigger another refresh attempt.
		if (status === 401 && isRefreshCall) {
			return Promise.reject(error)
		}

		//  401: attempt refresh
		if (status === 401 && !original._retry) {
			if (isRefreshing) {
				// Queue this request until refresh completes
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				}).then((token) => {
					original.headers.Authorization = `Bearer ${token}`
					return client(original)
				})
			}

			original._retry = true
			isRefreshing = true

			try {
				const { data } = await axios.post(buildApiUrl('/auth/api/refresh'), {}, { withCredentials: true })
				const newToken = data?.data?.token

				if (!newToken) {
					throw new Error('Refresh response did not include token')
				}

				useAuthStore.getState().setAccessToken(newToken)
				client.defaults.headers.common.Authorization = `Bearer ${newToken}`
				processQueue(null, newToken)

				original.headers.Authorization = `Bearer ${newToken}`
				return client(original) // retry original request
			} catch (refreshError) {
				processQueue(refreshError, null)
				useAuthStore.getState().setAccessToken(null)
				queryClient.setQueryData(['me'], null)
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	},
)
