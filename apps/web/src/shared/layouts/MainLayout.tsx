import { Outlet } from 'react-router-dom'
import Header from './Header'
import NavBar from './NavBar'

export function MainLayout() {
	return (
		<div className="min-h-screen w-full overflow-x-hidden">
			<Header />

			<div className="flex min-w-0">
				<NavBar />
				<main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
export default MainLayout
