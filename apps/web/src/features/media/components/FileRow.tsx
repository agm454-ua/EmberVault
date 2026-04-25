import { formatDate } from '@/shared/utils/dateConversor'
import type { TResourceResponse } from '../types/resources'
import getResourceIcon from '../utils/getResourceIcon'
import OptionsIcon from '@/shared/icons/OptionsIcon'
import { ContextMenu } from '@/shared/components/ContextMenu'
import { useTranslation } from 'react-i18next'
import { useContextMenu } from '@/shared/hooks/useContextMenu'
import useDownloadResource from '../hooks/useDownloadResource'
import { useState } from 'react'
import RenameFileModal from './RenameFileModal'
import useDeleteResource from '../hooks/useDeleteResource'
import useRestoreFromTrash from '../hooks/useRestoreFromTrash'
import useDeleteFromTrash from '../hooks/useDeleteFromTrash'
import useMe from '@/features/auth/hooks/useMe'
import ShareResourceModal from '@/features/auth/components/ShareResourceModal'
import ImagePreviewModal from '@/shared/components/ImagePreviewModal'
import { useCopyResource } from '../hooks/useCopyResource'
import type { TCopyResourceRequest } from '@/api/media/media.types'

type FileRowProps = {
	resource: TResourceResponse
	mode?: 'library' | 'trash' | 'admin' | 'shared'
	onOpenFolder?: (resource: TResourceResponse) => void
	onFileDragStart?: (resource: TResourceResponse) => void
	onFileDragEnd?: () => void
	onFolderDragOver?: (resource: TResourceResponse) => void
	onFolderDragLeave?: (resource: TResourceResponse) => void
	onFolderDrop?: (resource: TResourceResponse) => void
	isDropTarget?: boolean
	isDraggingFile?: boolean
}

export default function FileRow({
	resource,
	mode = 'library',
	onOpenFolder,
	onFileDragStart,
	onFileDragEnd,
	onFolderDragOver,
	onFolderDragLeave,
	onFolderDrop,
	isDropTarget = false,
	isDraggingFile = false,
}: FileRowProps) {
	const { t } = useTranslation()
	const isFolder = resource.type === 'FOLDER'
	const isFile = resource.type === 'FILE'

	const modificationDate = resource.updatedAt?.toString() ?? resource.createdAt.toString()
	const icon = getResourceIcon({ resource })

	const [renameModalOpen, setRenameModalOpen] = useState(false)
	const [shareModalOpen, setShareModalOpen] = useState(false)
	const [previewOpen, setPreviewOpen] = useState(false)
	const [previewSrc, setPreviewSrc] = useState<string | null>(null)
	const [createdObjectUrl, setCreatedObjectUrl] = useState<string | null>(null)
	const download = useDownloadResource(resource.id)
	const moveToTrash = useDeleteResource('', resource.id)
	const restoreFromTrash = useRestoreFromTrash(resource.id)
	const deleteFromTrash = useDeleteFromTrash(resource.id)
	const copyResource = useCopyResource(resource.id)

	const { data: userData } = useMe()
	const ownerDisplay = resource.owner === userData?.username ? t('user.me') : resource.owner

	const isImage = isFile && (resource as { mimeType?: string }).mimeType?.startsWith('image/')

	const handlePreview = async (event?: React.MouseEvent) => {
		event?.stopPropagation?.()
		if (download.isPending) return

		try {
			const result = await download.mutateAsync()
			if (typeof result === 'string') {
				setPreviewSrc(result)
			} else {
				const blob = result instanceof Blob ? result : new Blob([result as BlobPart])
				const url = URL.createObjectURL(blob)
				setCreatedObjectUrl(url)
				setPreviewSrc(url)
			}
			setPreviewOpen(true)
		} catch {
			// ignore preview errors
		}
	}

	const closePreview = () => {
		setPreviewOpen(false)
		if (createdObjectUrl) {
			URL.revokeObjectURL(createdObjectUrl)
			setCreatedObjectUrl(null)
		}
		setPreviewSrc(null)
	}

	const handleDownload = async () => {
		const downloadResult = await download.mutateAsync()

		if (typeof downloadResult === 'string') {
			const anchor = document.createElement('a')
			anchor.href = downloadResult
			anchor.download = resource.name
			document.body.appendChild(anchor)
			anchor.click()
			anchor.remove()
			return
		}

		const blob = downloadResult instanceof Blob ? downloadResult : new Blob([downloadResult as BlobPart])
		const objectUrl = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = objectUrl
		anchor.download = resource.name
		document.body.appendChild(anchor)
		anchor.click()
		anchor.remove()
		URL.revokeObjectURL(objectUrl)
	}

	const handleMoveToTrash = async () => {
		await moveToTrash.mutateAsync()
	}

	const handleRestoreFromTrash = async () => {
		await restoreFromTrash.mutateAsync()
	}

	const handleDeleteFromTrash = async () => {
		await deleteFromTrash.mutateAsync()
	}

	const handleOpenFolder = () => {
		if (!isFolder || !onOpenFolder) {
			return
		}

		onOpenFolder(resource)
	}

	const handleCopy = () => {
		const request = {
			targetFolderId: resource.parentFolder,
		} as TCopyResourceRequest
		copyResource.mutate(request)
	}

	const trashItems = isFolder
		? [
				{ label: t('media.open'), onClick: handleOpenFolder },
				{ label: t('media.restore'), onClick: handleRestoreFromTrash, disabled: restoreFromTrash.isPending },
				{
					label: t('media.permanentlyDelete'),
					onClick: handleDeleteFromTrash,
					danger: true,
					disabled: deleteFromTrash.isPending,
				},
			]
		: [
				{ label: t('media.restore'), onClick: handleRestoreFromTrash, disabled: restoreFromTrash.isPending },
				{
					label: t('media.permanentlyDelete'),
					onClick: handleDeleteFromTrash,
					danger: true,
					disabled: deleteFromTrash.isPending,
				},
			]

	const libraryItems = isFolder
		? [
				{ label: t('media.open'), onClick: handleOpenFolder, disabled: moveToTrash.isPending },
				{ label: t('media.rename'), onClick: () => setRenameModalOpen(true), disabled: moveToTrash.isPending },
				{
					label: t('media.download'),
					onClick: handleDownload,
					disabled: moveToTrash.isPending || download.isPending,
				},
				{ label: t('actions.share'), onClick: () => setShareModalOpen(true), disabled: moveToTrash.isPending },
				{
					label: t('actions.copy'),
					onClick: handleCopy,
					disabled: moveToTrash.isPending,
				},
				{
					label: t('media.moveToTrash'),
					onClick: handleMoveToTrash,
					danger: true,
					disabled: moveToTrash.isPending,
				},
			]
		: [
				...(isImage
					? [{ label: t('actions.preview'), onClick: handlePreview, disabled: download.isPending }]
					: []),
				{ label: t('media.download'), onClick: handleDownload, disabled: download.isPending },
				{ label: t('media.rename'), onClick: () => setRenameModalOpen(true), disabled: moveToTrash.isPending },
				{ label: t('actions.share'), onClick: () => setShareModalOpen(true), disabled: moveToTrash.isPending },
				{
					label: t('actions.copy'),
					onClick: handleCopy,
					disabled: moveToTrash.isPending,
				},
				{
					label: t('media.moveToTrash'),
					onClick: handleMoveToTrash,
					danger: true,
					disabled: moveToTrash.isPending,
				},
			]

	const sharedItems = isFolder
		? [
				{ label: t('media.open'), onClick: handleOpenFolder },
				{ label: t('media.download'), onClick: handleDownload, disabled: download.isPending },
			]
		: [
				...(isImage
					? [{ label: t('actions.preview'), onClick: handlePreview, disabled: download.isPending }]
					: []),
				{ label: t('media.download'), onClick: handleDownload, disabled: download.isPending },
			]

	const items = mode === 'trash' ? trashItems : mode === 'shared' ? sharedItems : libraryItems

	const menu = useContextMenu()

	return (
		<>
			{mode === 'library' && renameModalOpen && (
				<RenameFileModal resource={resource} onClose={() => setRenameModalOpen(false)} />
			)}
			{mode === 'library' && shareModalOpen && (
				<ShareResourceModal resource={resource} onClose={() => setShareModalOpen(false)} />
			)}
			{previewOpen && previewSrc && <ImagePreviewModal src={previewSrc} onClose={closePreview} />}
			{menu.isOpen && <ContextMenu x={menu.position.x} y={menu.position.y} items={items} onClose={menu.close} />}
			<tr
				className={`border-b border-stroke-muted h-12 text-sm text-ink-muted hover:bg-surface-muted cursor-pointer ${
					isDropTarget ? 'bg-surface-tint ring-1 ring-primary-500' : ''
				}`}
				onClick={handleOpenFolder}
				draggable={mode === 'library' && isFile}
				onDragStart={(event) => {
					if (mode !== 'library' || !isFile) {
						return
					}

					event.dataTransfer.effectAllowed = 'move'
					event.dataTransfer.setData('text/plain', resource.id)
					onFileDragStart?.(resource)
				}}
				onDragEnd={() => {
					onFileDragEnd?.()
				}}
				onDragOver={(event) => {
					if (!isFolder || !isDraggingFile) {
						return
					}

					event.preventDefault()
					event.dataTransfer.dropEffect = 'move'
					onFolderDragOver?.(resource)
				}}
				onDragLeave={() => {
					if (!isFolder || !isDraggingFile) {
						return
					}

					onFolderDragLeave?.(resource)
				}}
				onDrop={(event) => {
					if (!isFolder || !isDraggingFile) {
						return
					}

					event.preventDefault()
					onFolderDrop?.(resource)
				}}
				{...menu.bind()}
			>
				<td>
					<div className="flex min-w-0 gap-2 items-center pl-4">
						{icon}
						<span className="truncate" title={resource.name}>
							{resource.name ?? '-'}
						</span>
					</div>
				</td>
				<td className="text-center" title={resource.owner}>
					{ownerDisplay ?? '-'}
				</td>
				<td className="text-center">{formatDate(modificationDate) ?? '-'}</td>
				<td className="text-center">{resource.size ?? '-'}</td>
				<td className="flex items-center justify-center h-12">
					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation()
							const rect = event.currentTarget.getBoundingClientRect()
							menu.open(rect.left, rect.bottom)
						}}
						className="rounded-sm p-1 hover:bg-surface-gray"
						aria-label={t('actions.actions')}
					>
						<OptionsIcon className="w-4 h-4" />
					</button>
				</td>
			</tr>
		</>
	)
}
