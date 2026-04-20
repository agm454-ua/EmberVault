import { avgStaleTime } from '@/core/config/constants'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			retry: 1,
			staleTime: avgStaleTime,
		},
	},
})

export default queryClient
