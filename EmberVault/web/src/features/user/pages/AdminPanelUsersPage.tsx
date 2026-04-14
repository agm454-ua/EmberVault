import GlobalTotalUsersCard from '../components/GlobalTotalUsersCard'
import UsersAddedLastWeekCard from '../components/UsersAddedLastWeekCard'

export default function AdminPanelUsersPage() {
	return (
		<>
			<section className="p-4">
				<div className="flex gap-4">
					<GlobalTotalUsersCard />
					<UsersAddedLastWeekCard />
				</div>
			</section>
		</>
	)
}
