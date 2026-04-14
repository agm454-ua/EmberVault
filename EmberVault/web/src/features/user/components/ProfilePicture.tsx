import ENV from '@/core/config/env'

export default function ProfilePicture({
	pictureUrl = ENV.VITE_DEFAULT_PROFILE_PICTURE_URL,
	alt = 'Profile Picture',
	className = '',
}: {
	pictureUrl?: string
	alt?: string
	className?: string
}) {
	return (
		<img
			src={pictureUrl}
			alt={alt}
			className={`aspect-square rounded-full border-stroke object-cover h-8 ${className}`}
		/>
	)
}
