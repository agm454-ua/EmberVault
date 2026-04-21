import mediaApi from '@/api/media/media.api'
import queryClient from '@/api/queryClient'
import { useMutation } from '@tanstack/react-query'


export const useDeleteAvatar = () => {
	return useMutation({
		mutationKey: ['deleteAvatar'],
		mutationFn: ({ userId }: { userId: string }) => mediaApi.deleteAvatar(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['me']})
        }
	})
}

export default useDeleteAvatar
