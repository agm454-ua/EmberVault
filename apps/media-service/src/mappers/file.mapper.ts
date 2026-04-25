import type { Prisma } from '../generated/prisma/client.js'
import type { TFile, TResource } from '@customTypes/resource.js'
import { metaSelect, extractMetadata } from '@mappers/meta/index.js'
import formatBytes from '@utils/formatBytes.js'

export const fileSelect = {
    ...metaSelect,
    id: true,
    mime_type: true,
    size_bytes: true,
    storage_path: true,
    checksum: true,
    thumbnail_path: true,
} satisfies Prisma.filesSelect

type FileRow = Prisma.filesGetPayload<{ select: typeof fileSelect }>

// Returns only the file-specific fields — base fields come from mapResource
export const mapFile = (
    row: FileRow,
): Omit<TFile, keyof TResource | 'type'> => ({
    mimeType: row.mime_type ?? '',
    size: formatBytes(row.size_bytes ?? 0),
    storagePath: row.storage_path ?? null,
    checksum: row.checksum ?? null,
    thumbnailPath: row.thumbnail_path ?? null,
    metadata: extractMetadata(row),
})
