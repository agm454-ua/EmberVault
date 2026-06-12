import LinkButton from '../components/LinkButton'
import { useTranslation } from 'react-i18next'
import LibraryIcon from '../icons/LibraryIcon'
import SharedIcon from '../icons/SharedIcon'
import TrashIcon from '../icons/TrashIcon'
import { useLocation } from 'react-router-dom'
import { routes } from '@config/constants'
import Button from '../components/Button'
import SettingsIcon from '../icons/SettingsIcon'
import UploadResourceForm from '@/features/media/components/UploadResourceForm'
import useMe from '@/features/auth/hooks/useMe'
import { useEffect, useState } from 'react'
import BlurPage from '../components/BlurPage'
import CrossIcon from '../icons/CrossIcon'
import UsedSpaceBar from '@/features/user/components/UsedSpaceBar'

export function NavBar() {
	const { t } = useTranslation()
	const location = useLocation()
	const { data: userData } = useMe()
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

	const isLibrary = location.pathname === routes.library || location.pathname === '/'
	const isShared = location.pathname === routes.shared
	const isTrash = location.pathname === routes.trash
	const isAdmin = location.pathname === routes.adminUsers || location.pathname === routes.adminResources

	useEffect(() => {
		if (!isUploadModalOpen) {
			return
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsUploadModalOpen(false)
			}
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [isUploadModalOpen])

	return (
		<>
			<nav className="fixed left-0 top-16 bottom-0 w-72 flex flex-col items-center gap-2 p-4 border-r border-stroke bg-surface-canvas z-30 overflow-y-auto">
				<Button variant="primary" className="w-full py-3 mt-2 mb-4" onClick={() => setIsUploadModalOpen(true)}>
					{t('actions.new')}
				</Button>
				<LinkButton
					variant={isLibrary ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.library}
				>
					<LibraryIcon className="size-6" />
					{t('nav.library')}
				</LinkButton>

				<LinkButton
					variant={isShared ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.shared}
				>
					<SharedIcon className="size-6" />
					{t('nav.shared')}
				</LinkButton>

				<LinkButton
					variant={isTrash ? 'secondary' : 'ghost'}
					className="w-full px-6! py-3! justify-start!"
					to={routes.trash}
				>
					<TrashIcon className="size-6" />
					{t('nav.trash')}
				</LinkButton>
				{/*Only admin users should see the admin panel button*/}
				{userData?.system_role?.name === 'admin' && (
					<LinkButton
						variant={isAdmin ? 'secondary' : 'ghost'}
						className="w-full px-6! py-3! justify-start!"
						to={routes.adminResources}
					>
						<SettingsIcon className="size-6" />
						{t('nav.adminPanel')}
					</LinkButton>
				)}
				<div className="border border-t border-stroke-muted w-full my-4" />
				<UsedSpaceBar usedGB={userData?.storage_used_gb ?? 0} limitGB={userData?.storage_limit_gb ?? 0} />
			</nav>

			{isUploadModalOpen && (
				<BlurPage>
					<div className="relative z-10 w-full max-w-2xl rounded-xl border border-stroke bg-surface-canvas p-5 shadow-xl flex flex-col gap-4">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-lg text-ink">{t('media.uploadFiles')}</h2>
							<Button
								variant="ghost"
								round
								onClick={() => setIsUploadModalOpen(false)}
								className="text-ink"
							>
								<CrossIcon />
							</Button>
						</div>

						<UploadResourceForm
							parentFolder={userData?.root_folder ?? null}
							onUploadComplete={() => setIsUploadModalOpen(false)}
						/>
					</div>
				</BlurPage>
			)}

			<div className="h-[calc(100vh-4rem)] ml-72" />
		</>
	)
}

export default NavBar
