export const userStatus = new Set(['active', 'suspended', 'deleted'])

export function validateUserStatus(status: string): string | null {
    if (!userStatus.has(status)) {
        return `Invalid status. Allowed values are: ${Array.from(userStatus).join(', ')}`
    }
    return null
}