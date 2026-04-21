import DatabaseIcon from '@/shared/icons/DatabaseIcon'
import { useTranslation } from 'react-i18next'
import useGetStorageUsed from '../hooks/useGetStorageUsed'

export default function GlobalStorageUsedCard() {
	const { t } = useTranslation()

	const { data } = useGetStorageUsed()

	return (
		<div className="flex items-center gap-4 p-4 border border-stroke w-sm rounded-xl">
			<div className="bg-[#617bff] rounded-lg p-4">
				<DatabaseIcon className="w-8 h-8 text-white" />
			</div>
			<div className="h-full flex flex-col gap-1">
				<p className=" text-ink">{t('admin.storageUsed')}</p>
				<p className="text-2xl font-semibold">{data ?? '--'}</p>
			</div>
		</div>
	)
}
