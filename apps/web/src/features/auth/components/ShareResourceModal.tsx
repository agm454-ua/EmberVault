import type { TResourceResponse } from '@/api/media/media.types'
import { queryClient } from '@/api/queryClient'
import { authApi } from '@/api/auth/auth.api'
import type { TRole, TUser } from '@/api/user/user.types'
import useGetAvailableResourceRoles from '@/features/auth/hooks/useGetAvailableResourceRoles'
import useListUsersWithResourceRole from '@/features/auth/hooks/useListUsersWithResourceRole'
import useMe from '@/features/auth/hooks/useMe'
import useSetUserResourceRole from '@/features/auth/hooks/useSetUserResourceRole'
import SearchUserList from '@/features/user/components/SearchUserList'
import { useSearchUsers } from '@/features/user/hooks/useSearchUsers'
import BlurPage from '@/shared/components/BlurPage'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ExistingAssignment = {
	userId: string
	role?: TRole
	roleName?: string
	username?: string
	email?: string
}

export default function ShareResourceModal({
	resource,
	onClose,
}: {
	resource: TResourceResponse
	onClose: () => void
}) {
	const { t } = useTranslation()
	const { data: me } = useMe()

	const [query, setQuery] = useState('')
	const [selectedUser, setSelectedUser] = useState<TUser | null>(null)
	const [selectedRole, setSelectedRole] = useState('')
	const [error, setError] = useState<string | null>(null)

	const normalizedQuery = query.trim()
	const searchUsers = useSearchUsers(normalizedQuery)
	const availableRoles = useGetAvailableResourceRoles()
	const usersWithRole = useListUsersWithResourceRole(resource.id, me?.id ?? '')
	const selectedRoleName = selectedRole || availableRoles.data?.[1]?.name || ''
	const setUserResourceRole = useSetUserResourceRole(resource.id, selectedUser?.id ?? '', selectedRoleName)
	const [revokingUserId, setRevokingUserId] = useState<string | null>(null)

	const existingAssignments = useMemo(() => {
		const map = new Map<string, string>()
		for (const assignment of (usersWithRole.data as ExistingAssignment[] | undefined) ?? []) {
			const roleName = assignment.role?.name ?? assignment.roleName
			if (roleName) {
				map.set(assignment.userId, roleName)
			}
		}

		return map
	}, [usersWithRole.data])

	const candidateUsers = useMemo(() => {
		return (searchUsers.data ?? []).filter((user) => user.id !== me?.id)
	}, [me?.id, searchUsers.data])

	const assignedUsers = useMemo(() => {
		return ((usersWithRole.data as ExistingAssignment[] | undefined) ?? []).map((assignment) => ({
			userId: assignment.userId,
			roleName: assignment.role?.name ?? assignment.roleName ?? '-',
			username: assignment.username,
			email: assignment.email,
		}))
	}, [usersWithRole.data])

	const selectedUserCurrentRole = selectedUser ? existingAssignments.get(selectedUser.id) : null
	const isRoleAlreadyAssigned = Boolean(selectedUserCurrentRole && selectedUserCurrentRole === selectedRoleName)

	const handleAssignRole = async () => {
		if (!selectedUser || !selectedRoleName) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		try {
			setError(null)
			await setUserResourceRole.mutateAsync()

			await queryClient.invalidateQueries({ queryKey: ['listUsersWithResourceRole', resource.id] })
			setSelectedUser(null)
			setQuery('')
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const apiError = err.response?.data as { error?: string; message?: string } | undefined
				setError(apiError?.error ?? apiError?.message ?? t('errors.shareFailed'))
				return
			}

			setError(t('errors.shareFailed'))
		}
	}

	const handleRevokeRole = async (userId: string) => {
		try {
			setError(null)
			setRevokingUserId(userId)
			await authApi.removeUserResourceRole(resource.id, userId)
			await queryClient.invalidateQueries({ queryKey: ['listUsersWithResourceRole', resource.id] })
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const apiError = err.response?.data as { error?: string; message?: string } | undefined
				setError(apiError?.error ?? apiError?.message ?? t('errors.shareFailed'))
				return
			}

			setError(t('errors.shareFailed'))
		} finally {
			setRevokingUserId(null)
		}
	}

	const showNoResults = normalizedQuery.length > 1 && !searchUsers.isFetching && candidateUsers.length === 0

	return (
		<BlurPage onClose={onClose}>
			<div className="bg-surface-canvas rounded-lg p-6 w-120 max-w-[95vw] flex flex-col gap-4">
				<h1 className="text-lg font-semibold text-ink">{t('actions.share')}</h1>

				<div className="flex flex-col gap-2">
					<p className="text-sm pl-1 text-ink">{t('search.users', { defaultValue: t('search.search') })}</p>
					<Input
						type="text"
						placeholder={t('search.placeholder')}
						value={query}
						onChange={(event) => {
							setQuery(event.target.value)
							if (error) {
								setError(null)
							}
						}}
					/>
				</div>

				{normalizedQuery.length > 0 && (
					<div className="max-h-56 overflow-y-auto border border-stroke-muted rounded-md p-2">
						{searchUsers.isFetching ? (
							<p className="text-sm text-ink-muted px-2 py-3">{t('nav.loading')}</p>
						) : null}

						{showNoResults ? (
							<p className="text-sm text-ink-muted px-2 py-3">
								{t('search.noResults', { query: normalizedQuery })}
							</p>
						) : null}

						{candidateUsers.length > 0 ? (
							<SearchUserList
								users={candidateUsers}
								selectedUserId={selectedUser?.id}
								onSelectUser={(user) => {
									setSelectedUser(user)
									if (error) {
										setError(null)
									}
								}}
								getUserDescription={(user) => {
									const roleName = existingAssignments.get(user.id)
									return roleName ? `Current role: ${roleName}` : undefined
								}}
								disabled={setUserResourceRole.isPending}
							/>
						) : null}
					</div>
				)}

				<div className="flex flex-col gap-2">
					<p className="text-sm pl-1 text-ink">{t('userData.role')}</p>
					<select
						className="text-sm capitalize border border-stroke rounded-md px-3 py-2 bg-surface-canvas text-ink-muted outline-none focus:border-stroke-focus disabled:bg-stroke-muted disabled:cursor-not-allowed"
						value={selectedRoleName}
						onChange={(event) => {
							setSelectedRole(event.target.value)
							if (error) {
								setError(null)
							}
						}}
						disabled={!selectedUser || availableRoles.isLoading || setUserResourceRole.isPending}
					>
						{(availableRoles.data ?? []).map((role) =>
							role.name === 'owner' ? null : (
								<option key={role.id ?? role.name} value={role.name}>
									{role.name}
								</option>
							),
						)}
					</select>
					{selectedUserCurrentRole ? (
						<p className="text-xs text-ink-muted">
							Current role for {selectedUser?.username}: {selectedUserCurrentRole}
						</p>
					) : null}
				</div>

				<div className="flex flex-col gap-2">
					<p className="text-sm pl-1 text-ink">{t('auth.usersWithAccess')}</p>
					<div className="max-h-56 overflow-y-auto border border-stroke-muted rounded-md p-2 flex flex-col gap-2">
						{usersWithRole.isLoading ? (
							<p className="text-sm text-ink-muted px-2 py-3">{t('nav.loading')}</p>
						) : null}

						{!usersWithRole.isLoading && assignedUsers.length === 1 ? (
							<p className="text-xs text-ink-muted px-2 py-3">{t('auth.noUsersWithAccess')}</p>
						) : null}

						{assignedUsers.map((entry) =>
							entry.roleName === 'owner' ? null : (
								<div
									key={entry.userId}
									className="flex items-center justify-between gap-2 p-2 rounded border border-stroke-muted"
								>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">{entry.username ?? entry.userId}</p>
										<p className="text-xs text-ink-muted truncate">{entry.email ?? '-'}</p>
										<p className="text-xs text-primary-600 capitalize">
											{t('userData.role')}: {entry.roleName}
										</p>
									</div>
									<Button
										variant="danger"
										disabled={Boolean(revokingUserId) || setUserResourceRole.isPending}
										onClick={() => handleRevokeRole(entry.userId)}
									>
										{t('actions.remove')}
									</Button>
								</div>
							),
						)}
					</div>
				</div>

				{error ? <p className="text-sm text-danger-500">{error}</p> : null}

				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={onClose} disabled={setUserResourceRole.isPending}>
						{t('actions.cancel')}
					</Button>
					<Button
						onClick={handleAssignRole}
						disabled={
							!selectedUser || !selectedRoleName || isRoleAlreadyAssigned || setUserResourceRole.isPending
						}
					>
						{t('actions.share')}
					</Button>
				</div>
			</div>
		</BlurPage>
	)
}
