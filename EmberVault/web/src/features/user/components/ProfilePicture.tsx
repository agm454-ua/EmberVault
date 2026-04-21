import ENV from '@/core/config/env'

export default function ProfilePicture({
	pictureUrl = ENV.VITE_DEFAULT_PROFILE_PICTURE_URL,
	alt = 'Profile Picture',
	className = '',
}: {
	pictureUrl?: string | null
	alt?: string
	className?: string
}) {
	const finalPictureUrl = pictureUrl ?? ENV.VITE_DEFAULT_PROFILE_PICTURE_URL
	return (
		<img
			src={finalPictureUrl}
			alt={alt}
			className={`aspect-square rounded-full border-stroke object-cover h-8 ${className}`}
		/>
	)
}
