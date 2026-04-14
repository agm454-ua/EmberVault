import LinkButton from '../components/LinkButton'
import { useTranslation } from 'react-i18next'
import LibraryIcon from '../icons/LibraryIcon'
import SharedIcon from '../icons/SharedIcon'
import TrashIcon from '../icons/TrashIcon'
import { useLocation } from 'react-router-dom'
import { routes } from '@config/constants'
import Button from '../components/Button'
import SettingsIcon from '../icons/SettingsIcon'

export function NavBar() {
	const { t } = useTranslation()
	const location = useLocation()

	const isLibrary = location.pathname === routes.library
	const isShared = location.pathname === routes.shared
	const isTrash = location.pathname === routes.trash
	const isAdmin = location.pathname === routes.adminUsers || location.pathname === routes.adminResources

	return (
		<>

			<nav className="fixed left-0 top-16 bottom-0 w-72 flex flex-col items-center gap-2 py-4 border-r border-stroke px-4 bg-surface-canvas z-30 overflow-y-auto">
				<Button variant="primary" className="w-full py-3 mt-2 mb-4">
					{t('actions.new')}
				</Button>
				<LinkButton
					variant={isLibrary ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.library}
				>
					<LibraryIcon className="w-6 h-6" />
					{t('nav.library')}
				</LinkButton>

				<LinkButton
					variant={isShared ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.shared}
				>
					<SharedIcon className="w-6 h-6" />
					{t('nav.shared')}
				</LinkButton>

				<LinkButton
					variant={isTrash ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.trash}
				>
					<TrashIcon className="w-6 h-6" />
					{t('nav.trash')}
				</LinkButton>

				<LinkButton
					variant={isAdmin ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.adminResources}
				>
					<SettingsIcon className="w-6 h-6" />
					{t('nav.adminPanel')}
				</LinkButton>
			</nav>
			<div className="h-[calc(100vh-4rem)] ml-72"></div>
		</>

	)
}

export default NavBar
