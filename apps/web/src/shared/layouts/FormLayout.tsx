import { Outlet } from 'react-router-dom'
import LanguageButton from '@shared/components/LanguageButton'

export function FormLayout() {
	return (
		<main className="h-screen w-screen flex bg-surface">
			<LanguageButton className="absolute top-4 right-1/8 z-10" />
			<img
				src="/assets/waves.svg"
				alt="Waves"
				className="hidden sm:block h-full w-full max-w-xs lg:max-w-sm object-cover flex-1"
			/>

			{/* Content */}
			<div className="flex-8 flex items-center justify-center px-4">
				<Outlet />
			</div>

			<img
				src="/assets/waves.svg"
				alt="Waves"
				className="hidden sm:block h-full w-full max-w-xs lg:max-w-sm object-cover flex-1 scale-x-[-1]"
			/>
		</main>
	)
}
export default FormLayout
