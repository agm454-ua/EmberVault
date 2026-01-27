const pattern: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function validateMail(email: string) {
    if (!pattern.test(email)) {
        return 'Invalid mail format'
    }
    return null
}

export default validateMail
