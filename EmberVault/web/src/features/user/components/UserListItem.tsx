import type { TUser } from '@/api/user/user.types'
import { queryClient } from '@/api/queryClient'
import { ContextMenu } from '@/shared/components/ContextMenu'
import { useContextMenu } from '@/shared/hooks/useContextMenu'
import useSetUserSystemRole from '@/features/auth/hooks/useSetUserSystemRole'
import useDeleteUser from '../hooks/useDeleteUser'
import useUpdateUser from '../hooks/useUpdateUser'
import { useTranslation } from 'react-i18next'
import ProfilePicture from './ProfilePicture'
import UserStatus from './UserStatus'

export default function UserListItem({ user }: { user: TUser }) {
	const { t } = useTranslation()
	const menu = useContextMenu()

	const deleteUser = useDeleteUser(user.id)
	const promoteToAdmin = useSetUserSystemRole(user.id, 'admin')
	const updateUser = useUpdateUser(user.id)

	const isSuspended = user.status === 'suspended'
	const isDeleted = user.status === 'deleted'
	const shouldReactivate = isSuspended || isDeleted
	const roleName = user.system_role?.name ?? '-'

	const isPending = deleteUser.isPending || promoteToAdmin.isPending || updateUser.isPending

	const refreshUserList = async () => {
		await queryClient.invalidateQueries({ queryKey: ['listUsers'] })
	}

	const handleDelete = async () => {
		const confirmed = window.confirm(t('admin.confirmDeleteUser', { username: user.username }))
		if (!confirmed) return

		await deleteUser.mutateAsync()
		await refreshUserList()
	}

	const handlePromoteToAdmin = async () => {
		await promoteToAdmin.mutateAsync()
		await refreshUserList()
	}

	const handleToggleUserStatus = async () => {
		await updateUser.mutateAsync({ status: shouldReactivate ? 'active' : 'suspended' })
		await refreshUserList()
	}

	const items = [
		{
			label: t('admin.promoteToAdmin'),
			onClick: handlePromoteToAdmin,
			disabled: isPending,
		},
		{
			label: shouldReactivate ? t('admin.reactivateUser') : t('admin.suspendUser'),
			onClick: handleToggleUserStatus,
			disabled: isPending,
		},
		{
			label: t('actions.delete'),
			onClick: handleDelete,
			danger: true,
			disabled: isPending,
		},
	]

	return (
		<>
			{menu.isOpen && <ContextMenu x={menu.position.x} y={menu.position.y} items={items} onClose={menu.close} />}
			<div
				className="flex w-full items-center text-sm gap-4 px-4 py-2 border-b border-stroke-muted hover:bg-surface-muted last:border-0 text-ink-muted"
				{...menu.bind()}
			>
				<ProfilePicture pictureUrl={user.avatarURL ?? user.profilePictureUrl} alt={`${user.username}'s profile picture`} />
				<p className="w-xs ml-4">{user.username}</p>
				<p className="w-xs">{user.email}</p>
				<p className="w-28 capitalize">{roleName}</p>
				<UserStatus status={user.status ?? '-'} />
			</div>
		</>
	)
}
