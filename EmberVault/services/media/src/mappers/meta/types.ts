import type { Prisma } from 'src/generated/prisma/client.js'

export interface MetaMapper<TSelect extends Prisma.filesSelect> {
    select: TSelect
    map: (
        file: Prisma.filesGetPayload<{ select: TSelect }>,
    ) => Record<string, unknown> | null
}

export function defineMetaMapper<TSelect extends Prisma.filesSelect>(
    mapper: MetaMapper<TSelect>,
): MetaMapper<TSelect> {
    return mapper
}
