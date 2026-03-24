import { defineMetaMapper } from './types.js'

export default defineMetaMapper({
    select: {
        images: { select: { width_px: true, height_px: true } },
    },
    map: (file) => {
        if (!file.images) return null
        return {
            widthPx: file.images.width_px,
            heightPx: file.images.height_px,
        }
    },
})
