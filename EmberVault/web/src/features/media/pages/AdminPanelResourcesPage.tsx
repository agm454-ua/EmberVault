import { useMemo } from 'react'
import { usePagination } from '@/shared/hooks/usePagination'
import FileTable from '../components/FileTable'
import GlobalStorageUsedCard from '../components/GlobalStorageUsedCard'
import GlobalTotalFilesCard from '../components/GlobalTotalFilesCard'
import useListFiles from '../hooks/useListFiles'
import PaginationButtons from '@/shared/components/PaginationButtons'

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
				<PaginationButtons
					page={page + 1}
					handleNext={() => handleNext(lastResourceId)}
					handlePrevious={handlePrevious}
					hasMore={hasMore}
				/>
			</section>
		</>
	)
}
