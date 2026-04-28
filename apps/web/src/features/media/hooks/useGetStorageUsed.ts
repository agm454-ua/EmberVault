import mediaApi from '@/api/media/media.api'
import { useQuery } from '@tanstack/react-query'

export const useGetStorageUsed = () => {
	return useQuery({
		queryKey: ['getStorageUsed'],
		queryFn: () => mediaApi.getStorageUsed(),
	})
}

export default useGetStorageUsed
