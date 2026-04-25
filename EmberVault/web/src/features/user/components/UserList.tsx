import type { TUser } from '@/api/user/user.types'
import UserListItem from './UserListItem'
import { useTranslation } from 'react-i18next'

export default function UserList({ users }: { users: TUser[] }) {
	const { t } = useTranslation()

	return (
		<div className="rounded-xl border border-stroke">
			<div className="flex items-center h-12 text-sm text-ink font-medium bg-surface-gray rounded-t-xl border-b border-stroke pl-4">
				<p className="w-xs ml-12">{t('user.user')}</p>
				<p className="w-xs text-center">{t('userData.email')}</p>
				<p className="w-28 text-center">{t('userData.role')}</p>
				<p className="w-28 text-center">{t('userData.status')}</p>
			</div>
			{users.map((user) => (
				<UserListItem key={user.id} user={user} />
			))}
		</div>
	)
}
