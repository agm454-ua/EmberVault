import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'

export function TrashPage() {
	const { t } = useTranslation()

	return (
		<>
			<Title>{'› ' + t('nav.trash')}</Title>
			<FileTable />
		</>
	)
}

export default TrashPage
