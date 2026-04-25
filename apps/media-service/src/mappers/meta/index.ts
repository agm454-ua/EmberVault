import type { Prisma } from '../../generated/prisma/client.js'
import type { MetaMapper } from './types.js'
import imageMeta from './image.meta.js'
import videoMeta from './video.meta.js'
import audioMeta from './audio.meta.js'

// Register mappers
const metaMappers: MetaMapper<Prisma.filesSelect>[] = [
    imageMeta,
    videoMeta,
    audioMeta,
]

// Merged select — drives the Prisma query automatically
export const metaSelect: Prisma.filesSelect = metaMappers.reduce(
    (acc, mapper) => ({ ...acc, ...mapper.select }),
    {},
)

// First non-null result wins
export const extractMetadata = (
    file: Record<string, unknown>,
): Record<string, unknown> =>
    metaMappers.reduce<Record<string, unknown> | null>(
        (acc, mapper) => acc ?? mapper.map(file as never),
        null,
    ) ?? {}
