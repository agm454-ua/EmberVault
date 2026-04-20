import { useMemo } from 'react'
import Button from '@/shared/components/Button'
import { usePagination } from '@/shared/hooks/usePagination'
import FileTable from '../components/FileTable'
import GlobalStorageUsedCard from '../components/GlobalStorageUsedCard'
import GlobalTotalFilesCard from '../components/GlobalTotalFilesCard'
import useListFiles from '../hooks/useListFiles'

export default function AdminPanelResourcesPage() {
	const take = 10
	const { page, currentCursor, handleNext, handlePrevious } = usePagination()
	const { data } = useListFiles(false, currentCursor, take)

	const files = useMemo(() => {
		if (!Array.isArray(data)) {
			return []
		}

		return data
	}, [data])

	const hasMore = files.length === take
	const lastResourceId = files[files.length - 1]?.id

	return (
		<>
			<section className="p-4">
				<div className="flex gap-4">
					<GlobalStorageUsedCard />
					<GlobalTotalFilesCard />
				</div>
				<div className="mt-12"></div>
				<FileTable
					className="border border-stroke rounded-xl"
					resources={files}
					fullPage={false}
					mode="admin"
				/>
				<div className="flex gap-2 mt-4 w-full items-center justify-end">
					<Button onClick={handlePrevious} disabled={page === 0}>
						Previous page
					</Button>
					<span className="text-sm text-ink">Page {page + 1}</span>
					<Button onClick={() => handleNext(lastResourceId)} disabled={!hasMore}>
						Next page
					</Button>
				</div>
			</section>
		</>
	)
}
