export type TResourceID = string

export type TResourceState = 'pending' | 'uploading' | 'ready' | 'error' | 'processing' | 'deleted'

export interface TResource {
	id: TResourceID
	name: string
	isPrivate: boolean
	state: TResourceState
	createdAt: string
	updatedAt: string | null
	deletedAt: string | null
	parentFolder: TResourceID | null
	owner: string
}

export interface TFile extends TResource {
	type: string // "FILE"
	mimeType: string
	// in database, size is stored as bytes, but when returned by the API,
	// it is formatted as a human-readable string (e.g., "2.5 MB")
	size: string
	storagePath: string | null
	checksum: string | null
	thumbnailPath: string | null
	// flexible metadata object for file subtypes (images, videos, audio, etc.)
	metadata: Record<string, unknown>
}

export interface TFolder extends TResource {
	type: string // "FOLDER"
	size: string
}

export type TResourceResponse = TFile | TFolder

export interface TUpdateResourceRequest {
	name?: string
	isPrivate?: boolean
	parentFolder?: TResourceID | null
	type?: 'FILE' | 'FOLDER'
}

export interface TCreateResourceRequest {
	name: string
	isPrivate: boolean
	parentFolder?: TResourceID | null
	type: 'FILE' | 'FOLDER'
	mimeType?: string
}

export type TCreateResourceResponse = TResourceResponse & {
	uploadUrl?: string
	presignedURL?: string
	presignedUrl?: string
}

export interface TCopyResourceRequest {
	targetFolderId: TResourceID | null
	prefix?: string
}

export type TUploadAvatarPayload = {
	file: File
	userId: string
}