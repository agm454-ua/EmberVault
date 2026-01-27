const minAge = 13

export function validateBirthDate(birthDate?: string): string | null {
    if (!birthDate) return 'Birth date is required'

    const date = new Date(birthDate)
    if (isNaN(date.getTime())) return 'Birth date is invalid'

    const now = new Date()
    if (date >= now) return 'Birth date must be in the past'

    const age =
        now.getFullYear() -
        date.getFullYear() -
        (now.getMonth() < date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
            ? 1
            : 0)

    if (age < minAge) {
        return `You must be at least ${minAge} years old`
    }

    return null
}

export default validateBirthDate
