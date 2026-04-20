import { useState } from 'react'
import GlobalTotalUsersCard from '../components/GlobalTotalUsersCard'
import UserList from '../components/UserList'
import UsersAddedLastWeekCard from '../components/UsersAddedLastWeekCard'
import useListUsers from '../hooks/useListUsers'
import Button from '@/shared/components/Button'
import { usePagination } from '@/shared/hooks/usePagination'
import { useTranslation } from 'react-i18next'
import CreateUserModal from '../components/CreateUserModal'

export default function AdminPanelUsersPage() {
	const {t} = useTranslation()
	const [take] = useState('10')
	const { page, currentCursor, handleNext, handlePrevious } = usePagination()
	const { data: users = [] } = useListUsers(take, currentCursor)
	const hasMore = users.length === parseInt(take)

	const [createUserModalOpen, setCreateUserModalOpen] = useState(false)

	const handleOpenCreateUserModal = () => {
		setCreateUserModalOpen(true)
	}

	const handleCloseCreateUserModal = () => {
		setCreateUserModalOpen(false)
	}

	return (
		<section className="p-4">
			<div className="flex gap-4">
				<GlobalTotalUsersCard />
				<UsersAddedLastWeekCard />
			</div>

			<div className="my-4 flex items-center justify-end w-full">
				<Button onClick={handleOpenCreateUserModal}>
					{t('admin.createUser')}
				</Button>
				{createUserModalOpen && <CreateUserModal onClose={handleCloseCreateUserModal} />}
			</div>

			<UserList users={users} />

			<div className="flex gap-2 mt-4 w-full items-center justify-end">
				<Button onClick={handlePrevious} disabled={page === 0}>
					Previous page
				</Button>
				<span className="text-sm text-ink">Page {page + 1}</span>
				<Button onClick={() => handleNext(users[users.length - 1]?.id)} disabled={!hasMore}>
					Next page
				</Button>
			</div>
		</section>
	)
}
