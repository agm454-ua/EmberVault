import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'
import useListFolderResources from '../hooks/useListFolderResources'
import { useMe } from '@/features/auth/hooks/useMe'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { useMemo, useState } from 'react'
import type { TResourceResponse } from '../types/resources'

type TPathSegment = {
	id: string
	name: string
}

export function LibraryPage() {
	const { t } = useTranslation()

	const { data, isLoading: isMeLoading, isError: isMeError } = useMe()
	const [nestedPath, setNestedPath] = useState<TPathSegment[]>([])

	const rootFolderId = data?.root_folder ?? ''

	const path = useMemo(() => {
		if (!rootFolderId) {
			return []
		}

		return [{ id: rootFolderId, name: t('nav.library') }, ...nestedPath]
	}, [rootFolderId, t, nestedPath])

	const titlePath = useMemo(() => {
		if (!path.length) {
			return t('nav.library')
		}

		return path.map((segment) => segment.name).join(' / ')
	}, [path, t])

	const currentFolderId = useMemo(() => {
		if (!path.length) {
			return rootFolderId
		}

		return path[path.length - 1]?.id ?? rootFolderId
	}, [path, rootFolderId])

	const listFolderResources = useListFolderResources(currentFolderId)

	const handleOpenFolder = (resource: TResourceResponse) => {
		if (resource.type !== 'FOLDER') {
			return
		}

		setNestedPath((currentNestedPath) => {
			const fullPath = rootFolderId
				? [{ id: rootFolderId, name: t('nav.library') }, ...currentNestedPath]
				: currentNestedPath

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
			const fullPath = rootFolderId
				? [{ id: rootFolderId, name: t('nav.library') }, ...currentNestedPath]
				: currentNestedPath

			if (index < 0 || index >= fullPath.length) {
				return currentNestedPath
			}

			if (index === 0) {
				return []
			}

			return fullPath.slice(1, index + 1)
		})
	}

	if (isMeLoading) {
		return <div>{t('nav.loading')}</div>
	}

	if (isMeError || !data || !data.root_folder) {
		return <ErrorMessage text={t('errors.generic')} />
	}

	if (listFolderResources.isLoading) {
		return <div>{t('nav.loading')}</div>
	}

	if (listFolderResources.isError) {
		return <ErrorMessage text={t('errors.generic')} />
	}

	return (
		<>
			<Title>{'› ' + titlePath}</Title>
			<FileTable
				resources={listFolderResources.data}
				enableFolderControls
				currentFolderId={currentFolderId}
				path={path}
				onOpenFolder={handleOpenFolder}
				onNavigateToPath={handleNavigateToPath}
			/>
		</>
	)
}

export default LibraryPage
