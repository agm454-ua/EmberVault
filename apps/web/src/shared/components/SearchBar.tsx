import { useTranslation } from 'react-i18next'
import SearchIcon from '../icons/SearchIcon'

export default function SearchBar() {
	const { t } = useTranslation()

	return (
		<div className="relative flex items-center justify-between bg-surface-canvas border border-stroke rounded ">
			<input
				type="text"
				placeholder={t('search.placeholder')}
				className="border border-stroke-muted px-2 py-1 w-full text-ink-muted focus:outline-primary-500"
				aria-label={t('search.search')}
			/>
			<SearchIcon className="text-ink-muted size-6 absolute right-2 cursor-pointer" />
		</div>
	)
}
