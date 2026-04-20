import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { useMemo, useState } from 'react'
import type { TResourceResponse } from '../types/resources'
import useGetTrash from '../hooks/useGetTrash'
import Button from '@/shared/components/Button'
import useDeleteAllFromTrash from '../hooks/useDeleteAllFromTrash'
import SuccessMessage from '@/shared/components/SuccessMessage'
import { useRestoreAllFromTrash } from '../hooks/useRestoreAllFromTrash'

type TPathSegment = {
	id: string
	name: string
}

const TRASH_ROOT_ID = '__trash_root__'

export function TrashPage() {
	const { t } = useTranslation()
	const [nestedPath, setNestedPath] = useState<TPathSegment[]>([])
	const [emptyTrashError, setEmptyTrashError] = useState<string | null>(null)
	const [isTrashEmptied, setIsTrashEmptied] = useState(false)
	const getTrash = useGetTrash(undefined, 200)
	const deleteAllFromTrash = useDeleteAllFromTrash()
	const restoreAllFromTrash = useRestoreAllFromTrash()

	const allTrashResources = useMemo(() => getTrash.data ?? [], [getTrash.data])

	const path = useMemo(() => {
		return [{ id: TRASH_ROOT_ID, name: t('nav.trash') }, ...nestedPath]
	}, [nestedPath, t])

	const titlePath = useMemo(() => {
		if (!path.length) {
			return t('nav.trash')
		}

		return path.map((segment) => segment.name).join(' / ')
	}, [path, t])

	const currentFolderId = useMemo(() => {
		return path[path.length - 1]?.id ?? TRASH_ROOT_ID
	}, [path])

	const trashedResourceIds = useMemo(
		() => new Set(allTrashResources.map((resource) => resource.id)),
		[allTrashResources],
	)

	const visibleResources = useMemo(() => {
		if (currentFolderId === TRASH_ROOT_ID) {
			return allTrashResources.filter(
				(resource) => !resource.parentFolder || !trashedResourceIds.has(resource.parentFolder),
			)
		}

		return allTrashResources.filter((resource) => resource.parentFolder === currentFolderId)
	}, [allTrashResources, currentFolderId, trashedResourceIds])

	const handleOpenFolder = (resource: TResourceResponse) => {
		if (resource.type !== 'FOLDER') {
			return
		}

		setNestedPath((currentNestedPath) => {
			const fullPath = [{ id: TRASH_ROOT_ID, name: t('nav.trash') }, ...currentNestedPath]

			const existingIndex = fullPath.findIndex((segment) => segment.id === resource.id)
			if (existingIndex >= 0) {
				if (existingIndex === 0) {
					return []
				}

				return fullPath.slice(1, existingIndex + 1)
			}

			return [...currentNestedPath, { id: resource.id, name: resource.name }]
		})
	}

	const handleNavigateToPath = (index: number) => {
		setNestedPath((currentNestedPath) => {
			const fullPath = [{ id: TRASH_ROOT_ID, name: t('nav.trash') }, ...currentNestedPath]

			if (index < 0 || index >= fullPath.length) {
				return currentNestedPath
			}

			if (index === 0) {
				return []
			}

			return fullPath.slice(1, index + 1)
		})
	}

	if (getTrash.isLoading) {
		return <div>{t('nav.loading')}</div>
	}

	if (getTrash.isError) {
		return <ErrorMessage text={t('errors.generic')} />
	}

	const handleEmptyTrash = async () => {
		if (!allTrashResources.length || deleteAllFromTrash.isPending) {
			return
		}

		setEmptyTrashError(null)
		setIsTrashEmptied(false)

		try {
			await deleteAllFromTrash.mutateAsync()
			setIsTrashEmptied(true)
		} catch {
			setEmptyTrashError(t('errors.permanentDeleteFailed'))
		}
	}

	const handleRestoreAll = async () => {
		if (!allTrashResources.length || restoreAllFromTrash.isPending) {
			return
		}

		setEmptyTrashError(null)

		try {
			await restoreAllFromTrash.mutateAsync()
		} catch {
			setEmptyTrashError(t('errors.restoreFailed'))
		}
	}

	return (
		<>
			<Title>{'› ' + titlePath}</Title>
			<div className="py-4 px-4 flex justify-end gap-4">
				<Button
					type="button"
					variant="primary"
					disabled={!allTrashResources.length || restoreAllFromTrash.isPending}
					onClick={handleRestoreAll}
				>
					{restoreAllFromTrash.isPending ? t('nav.loading') : t('media.restoreAll')}
				</Button>
				<Button
					type="button"
					variant="danger"
					disabled={!allTrashResources.length || deleteAllFromTrash.isPending}
					onClick={handleEmptyTrash}
				>
					{deleteAllFromTrash.isPending ? t('nav.loading') : t('media.emptyTrash')}
				</Button>
			</div>

			{emptyTrashError && <ErrorMessage text={emptyTrashError} />}
			{isTrashEmptied && <SuccessMessage text={t('media.trashEmptied')} />}

			<FileTable
				mode="trash"
				resources={visibleResources}
				enableFolderControls
				currentFolderId={currentFolderId === TRASH_ROOT_ID ? null : currentFolderId}
				path={path}
				onOpenFolder={handleOpenFolder}
				onNavigateToPath={handleNavigateToPath}
			/>
		</>
	)
}

export default TrashPage
