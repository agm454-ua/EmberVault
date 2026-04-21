import i18n from '@config/i18n'
import { useUIStore } from '@stores/uiStore'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import LanguageIcon from '../icons/LanguageIcon'
import { languageLabels } from '@config/constants'

export default function LanguageButton({ className = '' }: { className?: string }) {
	const language = useUIStore((s) => s.language)
	const setLanguage = useUIStore((s) => s.setLanguage)
	const availableLanguages = Object.keys(i18n.options.resources ?? {})
	const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
	const languageMenuRef = useRef<HTMLDivElement>(null)

	const selectedLanguage = availableLanguages.includes(language) ? language : (availableLanguages[0] ?? language)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
				setIsLanguageMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLanguageToggle = () => {
		setIsLanguageMenuOpen((isOpen) => !isOpen)
	}

	const handleLanguageSelect = (lang: string) => {
		setLanguage(lang)
		setIsLanguageMenuOpen(false)
	}

	const classname = className ?? 'relative'
	return (
		<div className={classname} ref={languageMenuRef}>
			<Button variant="ghost" onClick={handleLanguageToggle} round>
				<LanguageIcon />
			</Button>
			{isLanguageMenuOpen && (
				<div className="absolute right-0 mt-2 z-20 min-w-40 rounded-md border border-stroke bg-surface-canvas py-1 shadow-sm">
					{availableLanguages.map((lang) => {
						const isSelected = selectedLanguage === lang
						return (
							<button
								key={lang}
								type="button"
								onClick={() => handleLanguageSelect(lang)}
								className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-surface-gray"
							>
								<span>{languageLabels[lang] ?? lang.toUpperCase()}</span>
								{isSelected && <span aria-hidden="true">✓</span>}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
