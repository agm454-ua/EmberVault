import FileIcon from '@/shared/icons/FileIcon'
import { useTranslation } from 'react-i18next'
import useGetFileCount from '../hooks/useGetFileCount'

export default function GlobalTotalFilesCard() {
	const { t } = useTranslation()

	const { data } = useGetFileCount()

	return (
		<div className="flex items-center gap-4 p-4 border border-stroke w-sm rounded-xl">
			<div className="bg-green-600 rounded-lg p-4">
				<FileIcon className="w-8 h-8 text-white" />
			</div>
			<div className="h-full flex flex-col gap-1">
				<p className=" text-ink">{t('admin.totalFiles')}</p>
				<p className="text-2xl font-semibold">{data ?? '--'}</p>
			</div>
		</div>
	)
}
