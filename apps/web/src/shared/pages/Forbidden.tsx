import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function ForbiddenPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			navigate('/')
		}, 3000)

		return () => clearTimeout(timeoutId)
	}, [navigate])

	return (
		<div className="h-full flex flex-col pt-12 pl-12 gap-4">
			<h1 className="text-3xl font-semibold">401</h1>
			<p className="text-ink text-lg">{t('nav.forbidden')}</p>
		</div>
	)
}
