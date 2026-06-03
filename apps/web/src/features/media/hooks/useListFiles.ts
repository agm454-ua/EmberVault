import mediaApi from '@/api/media/media.api'
import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'

export const useListFiles = (includeDeleted?: boolean, lastCursor?: string, take?: number) => {
	return useQuery({
		queryKey: ['listFiles', includeDeleted, lastCursor, take],
		queryFn: () => mediaApi.listFiles(includeDeleted, lastCursor, take),
		placeholderData: keepPreviousData,
	})
}

export default useListFiles
