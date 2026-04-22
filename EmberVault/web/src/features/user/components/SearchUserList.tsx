import type { TUser } from '@/api/user/user.types'
import SearchUserListItem from './SearchUserListItem'

type SearchUserListProps = {
    users: TUser[]
    selectedUserId?: string | null
    onSelectUser?: (user: TUser) => void
    getUserDescription?: (user: TUser) => string | undefined
    disabled?: boolean
    className?: string
}

export default function SearchUserList({
    users,
    selectedUserId,
    onSelectUser,
    getUserDescription,
    disabled = false,
    className = '',
}: SearchUserListProps) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {users.map((user) => (
                <SearchUserListItem
                    key={user.id}
                    user={user}
                    selected={selectedUserId === user.id}
                    onSelect={onSelectUser}
                    description={getUserDescription?.(user)}
                    disabled={disabled}
                />
            ))}
        </div>
    )
}