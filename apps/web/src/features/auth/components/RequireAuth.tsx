import { Navigate, Outlet } from 'react-router-dom'
import { useMe } from '@/features/auth/hooks/useMe'
import { PageLoader } from '@/shared/pages/PageLoader'
import { routes } from '@/core/config/constants'

export function RequireAuth() {
	const { data, isLoading } = useMe()

	if (isLoading) return <PageLoader />

	if (!data) {
		return <Navigate to={routes.login} replace />
	}

	return <Outlet />
}
