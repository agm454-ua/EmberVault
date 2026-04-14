import FileTable from '../components/FileTable'
import GlobalStorageUsedCard from '../components/GlobalStorageUsedCard'
import GlobalTotalFilesCard from '../components/GlobalTotalFilesCard'

export default function AdminPanelResourcesPage() {
	return (
		<>
			<section className="p-4">
				<div className="flex gap-4">
					<GlobalStorageUsedCard />
					<GlobalTotalFilesCard />
				</div>
				<div className="mt-12"></div>
				<FileTable className="border border-stroke rounded-xl"/>
			</section>
		</>
	)
}
