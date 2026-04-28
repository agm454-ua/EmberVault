import { useTranslation } from 'react-i18next'
import LinkButton from '../components/LinkButton'
import { useLocation } from 'react-router-dom'
import { routes } from '@/core/config/constants'

export default function AdminNav() {
	const { t } = useTranslation()
	const location = useLocation()

	const isAdminRes = location.pathname === routes.adminResources
	const isAdminUsers = location.pathname === routes.adminUsers

	return (
		<nav className="flex h-16 border-b border-stroke items-center gap-4 px-6">
			<LinkButton
				variant={isAdminRes ? 'secondary' : 'ghost'}
				to={routes.adminResources}
				className="px-16! py-3!"
			>
				{t('media.files')}
			</LinkButton>
			<LinkButton variant={isAdminUsers ? 'secondary' : 'ghost'} to={routes.adminUsers} className="px-16! py-3!">
				{t('user.users')}
			</LinkButton>
		</nav>
	)
}
