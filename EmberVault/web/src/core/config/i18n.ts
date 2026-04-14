import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		resources: {
			en: { translation: (await import('@locales/en.json')).default },
			es: { translation: (await import('@locales/es.json')).default },
		},
		interpolation: { escapeValue: false },
	})

export default i18n
