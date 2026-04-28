import { defineMetaMapper } from './types.js'

export default defineMetaMapper({
    select: {
        videos: {
            select: {
                width_px: true,
                height_px: true,
                duration_seconds: true,
                video_codec: true,
                frame_rate: true,
                bitrate: true,
                audio_codec: true,
            },
        },
    },
    map: (file) => {
        if (!file.videos) return null
        return {
            widthPx: file.videos.width_px,
            heightPx: file.videos.height_px,
            durationSeconds: file.videos.duration_seconds,
            videoCodec: file.videos.video_codec,
            frameRate: file.videos.frame_rate,
            bitrate: file.videos.bitrate,
            audioCodec: file.videos.audio_codec,
        }
    },
})
