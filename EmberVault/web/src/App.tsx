import './styles/global.css'
import AppRoutes from '@core/router/AppRoutes'
import { BrowserRouter } from 'react-router-dom'

function App() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}

export default App
