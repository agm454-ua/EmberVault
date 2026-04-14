import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'

export function SharedPage() {
	const { t } = useTranslation()

	return (
		<>
			<Title>{'› ' + t('nav.shared')}</Title>
			<FileTable />
		</>
	)
	
}

export default SharedPage
