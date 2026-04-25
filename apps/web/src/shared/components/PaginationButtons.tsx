import { useTranslation } from 'react-i18next'
import Button from './Button'

export default function PaginationButtons({
	page,
	handleNext,
	handlePrevious,
	hasMore,
}: {
	page: number
	handleNext: (...args: unknown[]) => void
	handlePrevious: (...args: unknown[]) => void
	hasMore: boolean
}) {
	const { t } = useTranslation()

	return (
		<div className="flex gap-2 mt-4 w-full items-center justify-end">
			<Button onClick={handlePrevious} disabled={page === 0}>
				{t('actions.previousPage')}
			</Button>
			<span className="text-sm text-ink">{t('nav.page', { page })}</span>
			<Button onClick={handleNext} disabled={!hasMore}>
				{t('actions.nextPage')}
			</Button>
		</div>
	)
}
