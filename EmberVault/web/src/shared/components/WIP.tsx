import { useTranslation } from 'react-i18next'
import HelmetIcon from '../icons/HelmetIcon'

export default function WIP() {
	const { t } = useTranslation()
	return (
		<div className="flex flex-col w-full mt-64 gap-2 items-center justify-center">
			<HelmetIcon className="w-16 h-16 stroke-1 text-ink-muted" />
			<p className="text-md text-ink-muted">{t('nav.wip')}</p>
		</div>
	)
}
