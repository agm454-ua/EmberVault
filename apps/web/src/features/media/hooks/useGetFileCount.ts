import mediaApi from '@/api/media/media.api'
import { useQuery } from '@tanstack/react-query'

export const useGetFileCount = () => {
	return useQuery({
		queryKey: ['getFileCount'],
		queryFn: () => mediaApi.getFileCount(),
	})
}

export default useGetFileCount
