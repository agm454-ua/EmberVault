import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    CopyObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ENV } from '@config/env.js'
import { createHash } from 'crypto'
import type { Readable } from 'stream'

const s3 = new S3Client({
    endpoint: ENV.S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
        accessKeyId: ENV.S3_ACCESS_KEY,
        secretAccessKey: ENV.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
})

// Signs against the internal endpoint so SeaweedFS can verify the signature,
// then rewrites the URL to the public-facing nginx proxy before returning it.
const s3Presign = new S3Client({
    endpoint: ENV.S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
        accessKeyId: ENV.S3_ACCESS_KEY,
        secretAccessKey: ENV.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
})

const BUCKET = ENV.S3_BUCKET
const PROFILE_PICTURES_BUCKET = ENV.S3_PROFILE_PICTURES_BUCKET

const joinUrl = (base: string, path: string): string => {
    const normalizedBase = base.replace(/\/+$/, '')
    const normalizedPath = path.replace(/^\/+/, '')
    return `${normalizedBase}/${normalizedPath}`
}

const encodeStoragePath = (storagePath: string): string => {
    return storagePath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')
}

// Rewrites the internal S3 endpoint in a presigned URL to the public-facing
// nginx proxy, preserving the path and query string.
const rewriteToPublicEndpoint = (internalUrl: string): string => {
    if (!ENV.S3_PUBLIC_ENDPOINT) return internalUrl

    const parsed = new URL(internalUrl)
    const publicEndpoint = new URL(ENV.S3_PUBLIC_ENDPOINT)

    parsed.protocol = publicEndpoint.protocol
    parsed.hostname = publicEndpoint.hostname
    // Explicitly reset the port; assigning `host` alone can keep the old one.
    parsed.port = publicEndpoint.port

    // Prepend the public path prefix (e.g. /s3) if present
    if (publicEndpoint.pathname !== '/') {
        parsed.pathname =
            publicEndpoint.pathname.replace(/\/+$/, '') + parsed.pathname
    }

    // Strip checksum params that SeaweedFS can't verify on presigned URLs
    parsed.searchParams.delete('x-amz-checksum-crc32')
    parsed.searchParams.delete('x-amz-sdk-checksum-algorithm')

    return parsed.toString()
}

export const buildStoragePath = (
    resourceId: string,
    fileName: string,
): string => {
    const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : ''
    return `${resourceId}${ext}`
}

export const getUploadUrl = async (
    storagePath: string,
    mimeType: string,
    expiresIn = 300,
): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: storagePath,
        ContentType: mimeType,
    })
    const url = await getSignedUrl(s3Presign, command, { expiresIn })
    return rewriteToPublicEndpoint(url)
}

export const deleteObject = async (storagePath: string): Promise<void> => {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: storagePath,
        }),
    )
}

export const getSizeInBytes = async (storagePath: string): Promise<number> => {
    const head = await s3.send(
        new HeadObjectCommand({
            Bucket: BUCKET,
            Key: storagePath,
        }),
    )

    return head.ContentLength ?? 0
}

export const getHash = async (storagePath: string): Promise<string | null> => {
    const response = await s3.send(
        new GetObjectCommand({
            Bucket: BUCKET,
            Key: storagePath,
        }),
    )

    const stream = response.Body as Readable
    const hash = createHash('sha256')

    await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
            hash.update(chunk)
        })
        stream.on('end', resolve)
        stream.on('error', reject)
    })

    return hash.digest('hex')
}

export const copyObject = async (
    originalStoragePath: string,
    newStoragePath: string,
): Promise<boolean> => {
    await s3.send(
        new CopyObjectCommand({
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${originalStoragePath}`,
            Key: newStoragePath,
        }),
    )
    return true
}

export const getFileSignedUrl = async (
    path: string,
    expiresIn = 3600,
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: path,
    })
    const url = await getSignedUrl(s3Presign, command, { expiresIn })
    return rewriteToPublicEndpoint(url)
}

export const getDownloadUrl = async (
    storagePath: string,
    fileName: string,
    expiresIn = 600,
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: storagePath,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
    })
    const url = await getSignedUrl(s3Presign, command, { expiresIn })
    return rewriteToPublicEndpoint(url)
}

export const uploadProfilePictureObject = async (
    storagePath: string,
    body: Buffer,
    mimeType: string,
): Promise<void> => {
    await s3.send(
        new PutObjectCommand({
            Bucket: PROFILE_PICTURES_BUCKET,
            Key: storagePath,
            Body: body,
            ContentType: mimeType,
        }),
    )
}

export const deleteProfilePictureObject = async (
    storagePath: string,
): Promise<void> => {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: PROFILE_PICTURES_BUCKET,
            Key: storagePath,
        }),
    )
}

export const getProfilePictureUrl = (storagePath: string): string => {
    const endpoint = ENV.S3_PUBLIC_ENDPOINT ?? ENV.S3_ENDPOINT
    const encodedPath = encodeStoragePath(storagePath)
    return joinUrl(endpoint, `${PROFILE_PICTURES_BUCKET}/${encodedPath}`)
}

export const getProfilePictureStoragePathFromUrl = (
    avatarUrl: string,
): string | null => {
    const endpoints = [ENV.S3_PUBLIC_ENDPOINT, ENV.S3_ENDPOINT].filter(
        (value): value is string => !!value,
    )

    for (const endpoint of endpoints) {
        const normalizedEndpoint = endpoint.replace(/\/+$/, '')
        const prefix = `${normalizedEndpoint}/${PROFILE_PICTURES_BUCKET}/`

        if (avatarUrl.startsWith(prefix)) {
            const encodedStoragePath = avatarUrl.slice(prefix.length)
            return decodeURIComponent(encodedStoragePath)
        }
    }

    return null
}

export const getFileStream = async (
    storagePath: string,
): Promise<Readable | null> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: storagePath,
    })
    const response = await s3.send(command)
    return response.Body as Readable
}