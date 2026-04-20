import './styles/global.css'
import AppRoutes from '@core/router/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import { PageLoader } from '@shared/pages/PageLoader'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useEffect } from 'react'

function App() {
	const { initialize, isInitialized } = useAuthStore()

	useEffect(() => {
		initialize()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (!isInitialized) return <PageLoader />

	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}

export default App
