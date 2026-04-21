import FileRow from './FileRow'
import type { TResourceResponse } from '../types/resources'
import { useTranslation } from 'react-i18next'
import FolderOpenIcon from '../icons/FolderOpenIcon'
import FolderIcon from '../icons/FolderIcon'
import { useEffect, useRef, useState, type DragEvent, type SubmitEvent } from 'react'
import Button from '@/shared/components/Button'
import useCreateResource from '../hooks/useCreateResource'
import { useContextMenu } from '@/shared/hooks/useContextMenu'
import { ContextMenu } from '@/shared/components/ContextMenu'
import useUpdateResource from '../hooks/useUpdateResource'
import SuccessMessage from '@/shared/components/SuccessMessage'
import ErrorMessage from '@/shared/components/ErrorMessage'
import sortResources from '../utils/sortResources'

export default function FileTable({
	resources = [],
	className,
	mode = 'library',
	enableFolderControls = false,
	currentFolderId,
	path = [],
	onOpenFolder,
	onNavigateToPath,
	fullPage = true,
}: {
	resources?: TResourceResponse[]
	className?: string
	mode?: 'library' | 'trash' | 'admin'
	enableFolderControls?: boolean
	currentFolderId?: string | null
	path?: Array<{ id: string; name: string }>
	onOpenFolder?: (resource: TResourceResponse) => void
	onNavigateToPath?: (index: number) => void
	fullPage?: boolean
}) {
	const sortedResources = sortResources(resources)

	const { t } = useTranslation()
	const createResourceMutation = useCreateResource()
	const [newFolderName, setNewFolderName] = useState('')
	const [createFolderError, setCreateFolderError] = useState<string | null>(null)
	const [isInlineCreateOpen, setIsInlineCreateOpen] = useState(false)
	const [draggingFile, setDraggingFile] = useState<TResourceResponse | null>(null)
	const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null)
	const [movingFileError, setMovingFileError] = useState<string | null>(null)
	const [isTableFileDragOver, setIsTableFileDragOver] = useState(false)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [uploadedCount, setUploadedCount] = useState(0)
	const tableFileDragDepth = useRef(0)
	const newFolderInputRef = useRef<HTMLInputElement>(null)
	const headerMenu = useContextMenu()
	const moveFileMutation = useUpdateResource(draggingFile?.id ?? '')

	useEffect(() => {
		if (!isInlineCreateOpen) {
			return
		}

		newFolderInputRef.current?.focus()
	}, [isInlineCreateOpen])

	const openInlineCreateRow = () => {
		setCreateFolderError(null)
		setNewFolderName('')
		setIsInlineCreateOpen(true)
	}

	const closeInlineCreateRow = () => {
		if (createResourceMutation.isPending) {
			return
		}

		setCreateFolderError(null)
		setNewFolderName('')
		setIsInlineCreateOpen(false)
	}

	const handleCreateFolder = async (event: SubmitEvent<HTMLElement>) => {
		event.preventDefault()

		const normalizedName = newFolderName.trim()
		if (!normalizedName || createResourceMutation.isPending) {
			return
		}

		setCreateFolderError(null)

		try {
			await createResourceMutation.mutateAsync({
				name: normalizedName,
				type: 'FOLDER',
				isPrivate: false,
				parentFolder: currentFolderId ?? null,
			})

			setNewFolderName('')
			setCreateFolderError(null)
			setIsInlineCreateOpen(false)
		} catch {
			setCreateFolderError(t('errors.generic'))
		}
	}

	const canNavigateBack = path.length > 1
	const isDraggingFile = Boolean(draggingFile)
	const isTrashMode = mode === 'trash'
	const isAdminMode = mode === 'admin'
	const canCreateFolders = !isTrashMode && !isAdminMode
	const canUploadFiles = !isTrashMode && !isAdminMode

	const hasExternalFiles = (event: DragEvent<HTMLElement>) => Array.from(event.dataTransfer.types).includes('Files')

	const clearDragState = () => {
		setDraggingFile(null)
		setDropTargetFolderId(null)
	}

	const handleFileDragStart = (resource: TResourceResponse) => {
		if (resource.type !== 'FILE') {
			return
		}

		setMovingFileError(null)
		setDraggingFile(resource)
	}

	const handleFolderDragOver = (resource: TResourceResponse) => {
		if (!draggingFile || resource.type !== 'FOLDER') {
			return
		}

		if (draggingFile.parentFolder === resource.id) {
			setDropTargetFolderId(null)
			return
		}

		setDropTargetFolderId(resource.id)
	}

	const handleFolderDrop = async (resource: TResourceResponse) => {
		if (!draggingFile || resource.type !== 'FOLDER') {
			return
		}

		if (draggingFile.parentFolder === resource.id || moveFileMutation.isPending) {
			clearDragState()
			return
		}

		setMovingFileError(null)

		try {
			await moveFileMutation.mutateAsync({ parentFolder: resource.id })
			clearDragState()
		} catch {
			setMovingFileError(t('errors.editFailed'))
			clearDragState()
		}
	}

	const handleTableDragEnter = (event: DragEvent<HTMLDivElement>) => {
		if (!canUploadFiles) {
			return
		}

		if (!hasExternalFiles(event)) {
			return
		}

		event.preventDefault()
		tableFileDragDepth.current += 1
		setIsTableFileDragOver(true)
	}

	const handleTableDragOver = (event: DragEvent<HTMLDivElement>) => {
		if (!canUploadFiles) {
			return
		}

		if (!hasExternalFiles(event)) {
			return
		}

		event.preventDefault()
		event.dataTransfer.dropEffect = 'copy'
	}

	const handleTableDragLeave = (event: DragEvent<HTMLDivElement>) => {
		if (!canUploadFiles) {
			return
		}

		if (!hasExternalFiles(event)) {
			return
		}

		event.preventDefault()
		tableFileDragDepth.current = Math.max(0, tableFileDragDepth.current - 1)
		if (tableFileDragDepth.current === 0) {
			setIsTableFileDragOver(false)
		}
	}

	const handleTableDrop = async (event: DragEvent<HTMLDivElement>) => {
		if (!canUploadFiles) {
			return
		}

		if (!hasExternalFiles(event)) {
			return
		}

		event.preventDefault()
		tableFileDragDepth.current = 0
		setIsTableFileDragOver(false)

		const droppedFiles = Array.from(event.dataTransfer.files ?? [])
		if (!droppedFiles.length || createResourceMutation.isPending) {
			return
		}

		setUploadError(null)
		setUploadedCount(0)

		let successfulUploads = 0
		const failedFiles: string[] = []

		for (const file of droppedFiles) {
			try {
				await createResourceMutation.mutateAsync({
					name: file.name,
					type: 'FILE',
					isPrivate: false,
					parentFolder: currentFolderId ?? null,
					mimeType: file.type || 'application/octet-stream',
					file,
				})
				successfulUploads += 1
			} catch {
				failedFiles.push(file.name)
			}
		}

		setUploadedCount(successfulUploads)

		setTimeout(() => {
			setUploadedCount(0)
		}, 5000)

		if (failedFiles.length) {
			setUploadError(`${t('errors.uploadFailed')} (${failedFiles.join(', ')})`)
		}
	}

	const headerMenuItems = [
		{
			label: t('media.createFolder'),
			onClick: openInlineCreateRow,
			disabled: !canCreateFolders || isInlineCreateOpen || createResourceMutation.isPending,
		},
	]

	const hasResources = Boolean(sortedResources && sortedResources.length > 0)

	return (
		<div className={`w-full flex flex-col gap-4 ${fullPage ? 'h-[calc(100vh-8rem)]' : ''}`}>
			{headerMenu.isOpen && (
				<ContextMenu
					x={headerMenu.position.x}
					y={headerMenu.position.y}
					items={headerMenuItems}
					onClose={headerMenu.close}
				/>
			)}

			{enableFolderControls && (
				<div className="absolute bottom-8 right-4 z-2000">
					<Button
						type="button"
						variant="secondary"
						disabled={!canNavigateBack}
						onClick={() => onNavigateToPath?.(path.length - 2)}
					>
						{t('nav.back')}
					</Button>
				</div>
			)}

			<div
				className={`relative min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden no-scrollbar ${className || ''}`}
				onDragEnter={handleTableDragEnter}
				onDragOver={handleTableDragOver}
				onDragLeave={handleTableDragLeave}
				onDrop={handleTableDrop}
			>
				{movingFileError && <ErrorMessage text={movingFileError} />}
				{uploadError && <ErrorMessage text={uploadError} />}
				{uploadedCount > 0 && <SuccessMessage text={t('media.uploadCompleted', { count: uploadedCount })} />}

				{canUploadFiles && isTableFileDragOver && (
					<div className="absolute inset-0 z-20 bg-surface-canvas/85 border-2 border-dashed border-stroke-focus rounded-lg flex items-center justify-center pointer-events-none">
						<div className="text-sm text-ink-muted">{t('media.dragAndDropResource')}</div>
					</div>
				)}
				<table className="min-w-0 w-full table-fixed border-collapse">
					<thead className="h-12 text-sm text-ink" {...headerMenu.bind()}>
						<tr>
							<th className="w-1/3 sticky top-0 z-10 bg-surface-gray text-start pl-4 font-medium">
								{t('resourceData.name')}
							</th>
							<th className="sticky top-0 z-10 bg-surface-gray font-medium">{t('resourceData.owner')}</th>
							<th className="sticky top-0 z-10 bg-surface-gray font-medium">
								{t('resourceData.lastModified')}
							</th>
							<th className="sticky top-0 z-10 bg-surface-gray font-medium">{t('resourceData.size')}</th>
							<th className="sticky top-0 z-10 w-12 bg-surface-gray font-medium"></th>
						</tr>
					</thead>
					<tbody>
						{enableFolderControls && canNavigateBack && (
							<tr
								className="border-b border-stroke-muted h-12 text-sm text-ink-muted hover:bg-surface-muted cursor-pointer"
								onClick={() => onNavigateToPath?.(path.length - 2)}
							>
								<td>
									<div className="flex min-w-0 gap-2 items-center pl-4">
										<FolderIcon />
										<span className="truncate" title="..">
											..
										</span>
									</div>
								</td>
								<td className="text-center">-</td>
								<td className="text-center">-</td>
								<td className="text-center">-</td>
								<td className="h-12"></td>
							</tr>
						)}

						{canCreateFolders && isInlineCreateOpen && (
							<>
								<tr className="border-b border-stroke-muted bg-surface-muted/40">
									<td colSpan={5}>
										<form onSubmit={handleCreateFolder} className="px-4 py-3 flex flex-col gap-2">
											<div className="flex items-center gap-2">
												<input
													ref={newFolderInputRef}
													type="text"
													value={newFolderName}
													onChange={(event) => setNewFolderName(event.target.value)}
													placeholder={t('media.folderNamePlaceholder')}
													className="flex-1 rounded-md border border-stroke bg-surface-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-stroke-focus focus:outline-none"
													maxLength={120}
												/>
												<Button
													type="button"
													variant="ghost"
													disabled={createResourceMutation.isPending}
													onClick={closeInlineCreateRow}
												>
													{t('actions.cancel')}
												</Button>
												<Button
													type="submit"
													disabled={!newFolderName.trim() || createResourceMutation.isPending}
												>
													{createResourceMutation.isPending
														? t('media.creatingFolder')
														: t('media.createFolder')}
												</Button>
											</div>
											{createFolderError && (
												<p className="text-sm text-danger-500">{createFolderError}</p>
											)}
										</form>
									</td>
								</tr>
							</>
						)}

						{sortedResources.map((resource) => (
							<FileRow
								key={resource.id}
								resource={resource}
								mode={mode}
								onOpenFolder={onOpenFolder}
								onFileDragStart={handleFileDragStart}
								onFileDragEnd={clearDragState}
								onFolderDragOver={handleFolderDragOver}
								onFolderDragLeave={() => setDropTargetFolderId(null)}
								onFolderDrop={handleFolderDrop}
								isDropTarget={dropTargetFolderId === resource.id}
								isDraggingFile={isDraggingFile}
							/>
						))}

						{!hasResources && !isInlineCreateOpen && (
							<tr>
								<td colSpan={5}>
									<div className="w-full py-16 flex flex-col items-center justify-center gap-4">
										<FolderOpenIcon className="text-ink-muted w-8 h-8 " />
										<div className="text-lg text-ink-muted">{t('media.noFiles')}</div>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
