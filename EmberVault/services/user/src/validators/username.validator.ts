const minLength = 3
const maxLength = 30

export function validateUsername(username?: string): string | null {
    if (!username) return 'Username is required'

    if (username.length < minLength) {
        return `Username must be at least ${minLength} characters`
    }

    if (username.length > maxLength) {
        return `Username must be at most ${maxLength} characters`
    }

    return null
}

export default validateUsername
