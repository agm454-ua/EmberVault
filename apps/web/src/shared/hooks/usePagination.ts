import { useState } from 'react'

export function usePagination() {
	const [cursors, setCursors] = useState<Array<string | undefined>>([undefined])
	const [page, setPage] = useState(0)

	const handleNext = (lastId: string | undefined) => {
		if (!lastId) return

		setPage((currentPage) => {
			setCursors((prev) => {
				if (prev[currentPage + 1]) return prev
				return [...prev, lastId]
			})

			return currentPage + 1
		})
	}

	const handlePrevious = () => {
		setPage((p) => Math.max(0, p - 1))
	}

	return {
		page,
		currentCursor: cursors[page],
		handleNext,
		handlePrevious,
	}
}
