import useCreateResource from '@/features/media/hooks/useCreateResource'
import Button from '@/shared/components/Button'
import FileIcon from '@/shared/icons/FileIcon'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'

type UploadResourceFormProps = {
	parentFolder?: string | null
	isPrivate?: boolean
	onUploadComplete?: () => void
}

const formatBytes = (bytes: number) => {
	if (bytes === 0) return '0 B'

	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
	const value = bytes / 1024 ** exponent

	return `${value.toFixed(value >= 100 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

export default function UploadResourceForm({
	parentFolder,
	isPrivate = false,
	onUploadComplete,
}: UploadResourceFormProps) {
	const { t } = useTranslation()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [error, setError] = useState<string | null>(null)
	const [uploadedCount, setUploadedCount] = useState(0)
	const createResourceMutation = useCreateResource()

	const addFiles = (files: File[]) => {
		setError(null)
		setUploadedCount(0)

		setSelectedFiles((currentFiles) => {
			const knownFiles = new Set(currentFiles.map(fileKey))
			const newFiles = files.filter((file) => !knownFiles.has(fileKey(file)))
			return [...currentFiles, ...newFiles]
		})
	}

	const onDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setIsDragging(false)

		if (!event.dataTransfer.files.length) {
			return
		}

		addFiles(Array.from(event.dataTransfer.files))
	}

	const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files?.length) {
			return
		}

		addFiles(Array.from(event.target.files))
		event.target.value = ''
	}

	const handleUpload = async () => {
		if (!selectedFiles.length || createResourceMutation.isPending) {
			return
		}

		setError(null)

		const results = await Promise.all(
			selectedFiles.map(async (file) => {
				try {
					await createResourceMutation.mutateAsync({
						name: file.name,
						type: 'FILE',
						isPrivate,
						parentFolder,
						mimeType: file.type || 'application/octet-stream',
						file,
					})
					return { ok: true, name: file.name }
				} catch {
					return { ok: false, name: file.name }
				}
			}),
		)

		const failedFiles = results.reduce<string[]>((acc, curr) => {
			if (!curr.ok) {
				acc.push(curr.name)
			}
			return acc
		}, [])
		const successfulUploads = results.filter((r) => r.ok).length
		setUploadedCount(successfulUploads)

		if (!failedFiles.length) {
			setSelectedFiles([])
			onUploadComplete?.()
			return
		}

		setError(`${t('errors.uploadFailed')} (${failedFiles.join(', ')})`)
	}

	const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0)

	return (
		<div className="w-full flex flex-col gap-3">
			<div
				className={`w-full rounded-lg border-2 border-dashed p-6 transition-colors duration-200 cursor-pointer ${
					isDragging
						? 'border-stroke-focus bg-surface'
						: 'border-stroke hover:border-stroke-focus hover:bg-surface'
				}`}
				onDragOver={(event) => {
					event.preventDefault()
					setIsDragging(true)
				}}
				onDragLeave={(event) => {
					event.preventDefault()
					setIsDragging(false)
				}}
				onDrop={onDrop}
				onClick={() => fileInputRef.current?.click()}
				aria-label={t('media.uploadFiles')}
				role="treeitem"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						fileInputRef.current?.click()
					}
				}}
			>
				<input
					ref={fileInputRef}
					type="file"
					aria-label={t('media.uploadFiles')}
					className="hidden"
					multiple
					onChange={onFileInputChange}
				/>

				<div className="flex flex-col items-center gap-3 text-center">
					<FileIcon className="size-9 text-stroke" />
					<p className="text-sm text-ink-muted">{t('media.dragAndDropResource')}</p>
					<Button type="button" variant="secondary" onClick={(event) => event.preventDefault()}>
						{t('media.selectFiles')}
					</Button>
				</div>
			</div>

			{selectedFiles.length > 0 && (
				<div className="w-full rounded-lg border border-stroke p-3 flex flex-col gap-2">
					<div className="flex justify-between items-center gap-2">
						<span className="text-sm text-ink-muted">
							{t('media.filesSelected', { count: selectedFiles.length })}
						</span>
						<span className="text-xs text-ink-muted">
							{t('media.totalSize')}: {formatBytes(totalSize)}
						</span>
					</div>

					<ul className="max-h-32 overflow-auto text-sm text-ink-muted space-y-1">
						{selectedFiles.map((file) => (
							<li key={fileKey(file)} className="truncate" title={file.name}>
								{file.name}
							</li>
						))}
					</ul>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							disabled={createResourceMutation.isPending}
							onClick={() => setSelectedFiles([])}
						>
							{t('actions.remove')}
						</Button>
						<Button type="button" disabled={createResourceMutation.isPending} onClick={handleUpload}>
							{createResourceMutation.isPending ? t('media.uploading') : t('media.uploadFiles')}
						</Button>
					</div>
				</div>
			)}

			{uploadedCount > 0 && (
				<p className="text-sm text-primary-500">{t('media.uploadCompleted', { count: uploadedCount })}</p>
			)}

			{error && <p className="text-sm text-danger-500">{error}</p>}
		</div>
	)
}
