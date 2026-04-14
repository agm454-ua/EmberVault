import LibraryPage from '@/features/media/pages/LibraryPage'
import SharedPage from '@/features/media/pages/SharedPage'
import TrashPage from '@/features/media/pages/TrashPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import MainLayout from '@/shared/layouts/MainLayout'
import FormLayout from '@/shared/layouts/FormLayout'
import { Routes, Route } from 'react-router-dom'
import { routes } from '@config/constants'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ResetPasswordLinkPage from '@/features/auth/pages/ResetPasswordLinkPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import ProfilePage from '@/features/user/pages/ProfilePage'
import AdminPanelUsersPage from '@/features/user/pages/AdminPanelUsersPage'
import AdminPanelResourcesPage from '@/features/media/pages/AdminPanelResourcesPage'
import AdminLayout from '@/shared/layouts/AdminLayout'
import NotFoundPage from '@/shared/pages/NotFound'

export function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<LibraryPage />} />
				<Route path={routes.library} element={<LibraryPage />} />
				<Route path={routes.shared} element={<SharedPage />} />
				<Route path={routes.trash} element={<TrashPage />} />
				<Route path={routes.profile} element={<ProfilePage />} />

				{/* Admin routes */}
				<Route element={<AdminLayout />}>
					<Route path={routes.adminUsers} element={<AdminPanelUsersPage />} />
					<Route path={routes.adminResources} element={<AdminPanelResourcesPage />} />
				</Route>
			</Route>
			<Route element={<FormLayout />}>
				<Route path={routes.login} element={<LoginPage />} />
				<Route path={routes.register} element={<RegisterPage />} />
				<Route path={routes.resetPasswordLink} element={<ResetPasswordLinkPage />} />
				<Route path={routes.resetPassword} element={<ResetPasswordPage />} />
			</Route>

			{/* Not Found */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}

export default AppRoutes
