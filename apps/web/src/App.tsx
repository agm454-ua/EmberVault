import './styles/global.css'
import AppRoutes from '@core/router/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import { PageLoader } from '@shared/pages/PageLoader'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useEffect } from 'react'

function App() {
	const initialize = useAuthStore((state) => state.initialize)
	const isInitialized = useAuthStore((state) => state.isInitialized)

	useEffect(() => {
		initialize()
	}, [initialize])

	if (!isInitialized) return <PageLoader />

	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}

export default App
