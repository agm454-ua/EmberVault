import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@providers/ThemeProvider'
import { LanguageProvider } from '@providers/LanguageProvider'
import './styles/global.css'
import './core/config/i18n'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<LanguageProvider>
				<ThemeProvider>
					<App />
				</ThemeProvider>
			</LanguageProvider>
		</QueryClientProvider>
	</StrictMode>,
)
