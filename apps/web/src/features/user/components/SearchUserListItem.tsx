import type { TUser } from '@/api/user/user.types'
import { ENV } from '@/core/config/env'

type SearchUserListItemProps = {
	user: TUser
	selected?: boolean
	onSelect?: (user: TUser) => void
	description?: string
	disabled?: boolean
}

export default function SearchUserListItem({
	user,
	selected = false,
	onSelect,
	description,
	disabled = false,
}: SearchUserListItemProps) {
	const imageUrl = user.profile_picture_url ?? ENV.VITE_DEFAULT_PROFILE_PICTURE_URL
	const isClickable = typeof onSelect === 'function'

	const sharedClasses =
		'flex items-center gap-3 p-2 rounded transition-colors text-left ' +
		(selected ? 'bg-surface-tint border border-primary-500 ' : 'hover:bg-surface border border-transparent ')

	if (isClickable) {
		return (
			<button
				type="button"
				onClick={() => onSelect(user)}
				disabled={disabled}
				className={
					sharedClasses + (disabled ? 'opacity-60 cursor-not-allowed w-full' : 'cursor-pointer w-full')
				}
			>
				<img src={imageUrl} alt={`${user.username}'s avatar`} className="size-8 rounded-full" />
				<div className="min-w-0">
					<p className="text-sm font-medium truncate">{user.username}</p>
					<p className="text-xs text-ink-muted truncate">{user.email}</p>
					{description ? <p className="text-xs text-primary-600 truncate">{description}</p> : null}
				</div>
			</button>
		)
	}

	return (
		<div className={sharedClasses}>
			<img src={imageUrl} alt={`${user.username}'s avatar`} className="size-8 rounded-full" />
			<div className="min-w-0">
				<p className="text-sm font-medium">{user.username}</p>
				<p className="text-xs text-ink-muted">{user.email}</p>
				{description ? <p className="text-xs text-primary-600 truncate">{description}</p> : null}
			</div>
		</div>
	)
}
