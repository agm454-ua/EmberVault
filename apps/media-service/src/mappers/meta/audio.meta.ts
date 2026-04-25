import { defineMetaMapper } from './types.js'

export default defineMetaMapper({
    select: {
        audio: {
            select: {
                duration_seconds: true,
                audio_codec: true,
                bitrate: true,
            },
        },
    },
    map: (file) => {
        if (!file.audio) return null
        return {
            durationSeconds: file.audio.duration_seconds,
            audioCodec: file.audio.audio_codec,
            bitrate: file.audio.bitrate,
        }
    },
})
