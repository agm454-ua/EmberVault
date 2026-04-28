import mediaApi from '@/api/media/media.api'
import type { TUploadAvatarPayload } from '@/api/media/media.types'
import { useMutation } from '@tanstack/react-query'

export const useUploadAvatar = () => {
	return useMutation({
		mutationKey: ['uploadAvatar'],
		mutationFn: ({ file, userId }: TUploadAvatarPayload) => mediaApi.uploadAvatar(file, userId),
	})
}

export default useUploadAvatar
