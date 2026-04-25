// Transforms bytes into useful units (KB, MB, GB, etc.)
export function formatBytes(bytes: bigint | number): string {
    const value = typeof bytes === 'bigint' ? Number(bytes) : bytes

    if (value === 0) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const exponent = Math.floor(Math.log(value) / Math.log(1024))
    const clamped = Math.min(exponent, units.length - 1)
    const result = value / Math.pow(1024, clamped)

    return `${result.toFixed(2)} ${units[clamped]}`
}

export default formatBytes
