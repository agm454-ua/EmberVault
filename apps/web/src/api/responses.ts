export const handleResponse = async <T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
	const res = await promise
	const body = res.data

	if (!body.success) {
		throw new Error(body.message || 'Request failed')
	}

	return body.data
}
export type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}
