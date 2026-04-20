import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import WIP from '@/shared/components/WIP'

export function SharedPage() {
	const { t } = useTranslation()

	return (
		<>
			<Title>{'› ' + t('nav.shared')}</Title>

			<WIP />
		</>
	)
}

export default SharedPage
