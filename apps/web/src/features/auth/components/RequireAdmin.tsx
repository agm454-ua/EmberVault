import { Navigate, Outlet } from 'react-router-dom'
import { useMe } from '@/features/auth/hooks/useMe'
import { routes } from '@/core/config/constants'
import { Spinner } from '@/shared/components/Spinner'

export function RequireAdmin() {
	const { data, isLoading } = useMe()

	if (isLoading) return <Spinner />

	if (!data || !data.system_role) {
		return <Navigate to={routes.login} replace />
	}

	if (data.system_role.name !== 'admin') {
		return <Navigate to={routes.library} replace />
	}

	return <Outlet />
}
