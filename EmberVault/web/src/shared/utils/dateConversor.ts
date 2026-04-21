/**
 * Converts ISO 8601 date string to a formatted display string
 * Handles both full timestamps and date-only formats
 */
export function formatDate(dateStr: string | Date | null): string | null {
	if (!dateStr) return null

	const date = new Date(dateStr)
	if (isNaN(date.getTime())) return null

	return date.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
}

/**
 * Formats full timestamp with time
 */
export function formatDateTime(dateStr: string | Date | null): string | null {
	if (!dateStr) return null

	const date = new Date(dateStr)
	if (isNaN(date.getTime())) return null

	return date.toLocaleString('es-ES', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

/**
 * Formats relative time (e.g., "hace 2 horas")
 */
/* export function formatRelativeTime(
    dateStr: string | Date | null,
): string | null {
    if (!dateStr) return null

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'hace un momento'
    if (diffMins < 60)
        return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24)
        return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 30) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`

    return formatDate(dateStr)
} */
