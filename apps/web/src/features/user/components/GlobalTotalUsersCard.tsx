import UsersIcon from '@/shared/icons/UsersIcon'
import { useTranslation } from 'react-i18next'
import { useCountUsers } from '../hooks/useCountUsers'

export default function GlobalTotalUsersCard() {
	const { t } = useTranslation()

	const { data: totalUsers } = useCountUsers()
	const totalUsersValue = totalUsers ?? '--'

	return (
		<div className="flex items-center gap-4 p-4 border border-stroke w-sm rounded-xl">
			<div className="bg-violet-600 rounded-lg p-4">
				<UsersIcon className="w-8 h-8 text-white" />
			</div>
			<div className="h-full flex flex-col gap-1">
				<p className=" text-ink">{t('admin.totalUsers')}</p>
				<p className="text-2xl font-semibold">{totalUsersValue}</p>
			</div>
		</div>
	)
}
