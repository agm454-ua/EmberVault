import Logo from '@shared/components/Logo'
import UserIcon from '../icons/UserIcon'
import LanguageButton from '../components/LanguageButton'
import { useContextMenu } from '../hooks/useContextMenu'
import { ContextMenu } from '../components/ContextMenu'
import { useTranslation } from 'react-i18next'
import { routes } from '@/core/config/constants'
import { useNavigate } from 'react-router-dom'
import useLogout from '@/features/auth/hooks/useLogout'
import Button from '../components/Button'

function Header() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const logout = useLogout()

	const menu = useContextMenu()
	const items = [
		{ label: t('nav.profile'), onClick: () => navigate(routes.profile) },
		{ label: t('auth.logout'), onClick: () => logout.mutate() },
	]

	return (
		<>
			<header className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 border-b border-stroke justify-between bg-surface-canvas z-40">
				<Logo to="/" />
				<div className="flex items-center gap-3">
					<LanguageButton />
					{menu.isOpen && (
						<ContextMenu x={menu.position.x} y={menu.position.y} items={items} onClose={menu.close} />
					)}

					<Button
						variant="primary"
						round
						{...menu.staticBind()}
						onClick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect()

							menu.open(rect.left, rect.bottom)
						}}
					>
						<UserIcon />
					</Button>
				</div>
			</header>
			{/* separator */}
			<div className="mt-16"></div>
		</>
	)
}

export default Header
