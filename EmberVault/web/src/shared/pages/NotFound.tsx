import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
	const { t } = useTranslation()

	return (
		<div className="h-full flex flex-col pt-12 pl-12 gap-4">
			<h1 className="text-3xl font-semibold">404</h1>
			<p className="text-ink text-lg">{t('nav.notFound')}</p>
		</div>
	)
}
