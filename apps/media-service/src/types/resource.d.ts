export type TResourceID = string
export type TResourceState =
    | 'pending'
    | 'uploading'
    | 'ready'
    | 'error'
    | 'processing'
    | 'deleted'

export interface TResource {
    id: TResourceID
    name: string
    isPrivate: boolean
    state: TResourceState
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    parentFolder: TResourceID | null
    owner: TUserID | null
}

export interface TFile extends TResource {
    type: 'FILE'
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
    type: 'FOLDER'
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
