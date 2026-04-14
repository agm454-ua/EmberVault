import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'

export function LibraryPage() {
	const { t } = useTranslation()

	return (
		<>
			<Title>{'› ' + t('nav.library')}</Title>
			<FileTable />
		</>
	)
}

export default LibraryPage
