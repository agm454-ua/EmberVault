import mediaApi from '@/api/media/media.api'
import { useMutation } from '@tanstack/react-query'

export const useUploadAvatar = () => {
	return useMutation({
		mutationKey: ['uploadAvatar'],
		mutationFn: mediaApi.uploadAvatar,
	})
}

export default useUploadAvatar
