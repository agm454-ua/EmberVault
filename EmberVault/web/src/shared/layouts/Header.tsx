import Logo from '@shared/components/Logo'
import LinkButton from '../components/LinkButton'
import UserIcon from '../icons/UserIcon'
import LanguageButton from '../components/LanguageButton'

function Header() {
	return (
		<>

			<header className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 border-b border-stroke justify-between bg-surface-canvas z-40">
				<Logo />
				<div className="flex items-center gap-3">
					<LanguageButton />
					<LinkButton variant="primary" round>
						<UserIcon />
					</LinkButton>
				</div>
			</header>
			{/* separator */}
			<div className="mt-16"></div>
		</>
	)
}

export default Header
