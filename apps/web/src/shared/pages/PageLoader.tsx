import { useTranslation } from 'react-i18next'
import { Spinner } from '../components/Spinner'

export function PageLoader() {
	const { t } = useTranslation()
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<Spinner size="lg" label={t('nav.loading')} />
		</div>
	)
}
