export const handleResponse = <T>(promise: Promise<{ data: ApiResponse<T> }>) => promise.then((res) => res.data.data)

export type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}
