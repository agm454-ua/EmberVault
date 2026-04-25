const pattern: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function validateMailFormat(email: string) {
    return pattern.test(email)
}
