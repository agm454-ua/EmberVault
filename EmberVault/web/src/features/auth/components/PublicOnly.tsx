import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function PublicOnly() {
	const accessToken = useAuthStore((s) => s.accessToken)

	if (accessToken) {
		return <Navigate to="/library" replace />
	}

	return <Outlet />
}
