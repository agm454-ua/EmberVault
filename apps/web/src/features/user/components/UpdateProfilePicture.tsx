import ENV from '@/core/config/env'
import UploadImageIcon from '@/shared/icons/UploadImageIcon'
import { useTranslation } from 'react-i18next'

export default function UpdateProfilePicture({
	pictureUrl = ENV.VITE_DEFAULT_PROFILE_PICTURE_URL,
	alt = 'Profile Picture',
	className = '',
	disabled = false,
	onClick = () => {},
}: {
	pictureUrl?: string | null
	alt?: string
	className?: string
	disabled?: boolean
	onClick?: () => void
}) {
	const { t } = useTranslation()
	const finalPictureUrl = pictureUrl ?? ENV.VITE_DEFAULT_PROFILE_PICTURE_URL
	return (
		<button
			className="relative flex items-center justify-center size-32 cursor-pointer group"
			onClick={onClick}
			tabIndex={0}
			type="button"
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
		>
			<img
				src={finalPictureUrl}
				alt={alt}
				onError={(e) => {
					if (e.currentTarget.src !== ENV.VITE_DEFAULT_PROFILE_PICTURE_URL) {
						e.currentTarget.src = ENV.VITE_DEFAULT_PROFILE_PICTURE_URL
					}
				}}
				className={`aspect-square rounded-full border-stroke object-cover size-32 ${disabled ? '' : 'group-hover:blur-xs'} ${className}`}
			/>
			<div
				className={`absolute inset-0 rounded-full bg-black/20 opacity-0 ${disabled ? '' : 'group-hover:opacity-100'} transition-opacity`}
			/>
			<div
				className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 ${disabled ? '' : 'group-hover:opacity-100'} transition-opacity`}
			>
				<UploadImageIcon className="text-ink-inverse z-10" />
				<p className="text-xs text-ink-inverse text-center">{t('profilePage.uploadProfilePicture')}</p>
			</div>
		</button>
	)
}
