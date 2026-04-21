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

type FileRowProps = {
	resource: TResourceResponse
	mode?: 'library' | 'trash' | 'admin'
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
	const download = useDownloadResource(resource.id)
	const moveToTrash = useDeleteResource('', resource.id)
	const restoreFromTrash = useRestoreFromTrash(resource.id)
	const deleteFromTrash = useDeleteFromTrash(resource.id)

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
					label: t('media.moveToTrash'),
					onClick: handleMoveToTrash,
					danger: true,
					disabled: moveToTrash.isPending,
				},
			]
		: [
				{ label: t('media.download'), onClick: handleDownload, disabled: download.isPending },
				{ label: t('media.rename'), onClick: () => setRenameModalOpen(true), disabled: moveToTrash.isPending },
				{
					label: t('media.moveToTrash'),
					onClick: handleMoveToTrash,
					danger: true,
					disabled: moveToTrash.isPending,
				},
			]

	const items = mode === 'trash' ? trashItems : libraryItems

	const menu = useContextMenu()

	return (
		<>
			{mode !== 'trash' && renameModalOpen && (
				<RenameFileModal resource={resource} onClose={() => setRenameModalOpen(false)} />
			)}
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
					{resource.owner ?? '-'}
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
