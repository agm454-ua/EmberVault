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
})

const s3Presign = new S3Client({
    endpoint: ENV.S3_PUBLIC_ENDPOINT ?? ENV.S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
        accessKeyId: ENV.S3_ACCESS_KEY,
        secretAccessKey: ENV.S3_SECRET_KEY,
    },
    forcePathStyle: true,
})

const BUCKET = ENV.S3_BUCKET

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
    expiresIn = 300, // 5 minutes
): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: storagePath,
        ContentType: mimeType,
    })
    return getSignedUrl(s3Presign, command, { expiresIn })
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
    return getSignedUrl(s3Presign, command, { expiresIn })
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
    return getSignedUrl(s3Presign, command, { expiresIn })
}

// For zipping
export const getFileStream = async (
    storagePath: string,
): Promise<Readable | null> => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: storagePath,
    })
    const response = await s3.send(command)
    const stream = response.Body as Readable

    return stream
}
