import { Outlet } from 'react-router-dom'
import AdminNav from './AdminNav'

export default function AdminLayout() {
	return (
		<main className="overflow-auto">
			<AdminNav />
			<Outlet />
		</main>
	)
}
