import NewUserIcon from '@/shared/icons/NewUserIcon'
import { useTranslation } from 'react-i18next'
import useUsersAddedLastWeek from '../hooks/useUsersAddedLastWeek'

export default function UsersAddedLastWeekCard() {
	const { t } = useTranslation()

	const { data } = useUsersAddedLastWeek()
	const usersAddedLastWeek = data ?? '--'

	return (
		<div className="flex items-center gap-4 p-4 pr-8 border border-stroke rounded-xl">
			<div className="bg-green-600 rounded-lg p-4">
				<NewUserIcon className="size-8 text-white" />
			</div>
			<div className="h-full flex flex-col gap-1">
				<p className=" text-ink">{t('admin.usersAddedLastWeek')}</p>
				<p className="text-2xl font-semibold">{usersAddedLastWeek}</p>
			</div>
		</div>
	)
}
