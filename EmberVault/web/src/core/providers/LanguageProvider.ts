import { useEffect, type ReactNode } from 'react'
import i18n from '@config/i18n'
import { useUIStore } from '@stores/uiStore'

const getSupportedLanguage = (language: string, supportedLanguages: string[]) => {
	if (supportedLanguages.includes(language)) {
		return language
	}

	const baseLanguage = language.split('-')[0]
	if (supportedLanguages.includes(baseLanguage)) {
		return baseLanguage
	}

	return null
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const language = useUIStore((s) => s.language)
	const setLanguage = useUIStore((s) => s.setLanguage)

	useEffect(() => {
		const supportedLanguages = Object.keys(i18n.options.resources ?? {})
		if (supportedLanguages.length === 0) {
			return
		}

		const fallbackLanguage = supportedLanguages[0]
		const currentI18nLanguage =
			getSupportedLanguage(i18n.resolvedLanguage ?? i18n.language, supportedLanguages) ?? fallbackLanguage

		setLanguage(currentI18nLanguage)
	}, [setLanguage])

	useEffect(() => {
		if (!language) {
			return
		}

		const supportedLanguages = Object.keys(i18n.options.resources ?? {})
		if (supportedLanguages.length === 0) {
			return
		}

		const fallbackLanguage = supportedLanguages[0]
		const normalizedLanguage = getSupportedLanguage(language, supportedLanguages) ?? fallbackLanguage

		if (normalizedLanguage !== language) {
			setLanguage(normalizedLanguage)
			return
		}

		const currentI18nLanguage =
			getSupportedLanguage(i18n.resolvedLanguage ?? i18n.language, supportedLanguages) ?? fallbackLanguage

		if (currentI18nLanguage !== normalizedLanguage) {
			void i18n.changeLanguage(normalizedLanguage)
		}
	}, [language, setLanguage])

	return children
}

export default LanguageProvider
