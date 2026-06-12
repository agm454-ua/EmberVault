import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'
import useListSharedResources from '../hooks/useListSharedResources'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { useMemo } from 'react'
import type { TResourceResponse } from '../types/resources'
import { useSearchParams } from 'react-router-dom'
import useListFolderResources from '../hooks/useListFolderResources'

type TPathSegment = {
	id: string
	name: string
}

const SHARED_ROOT_ID = '__shared_root__'

export function SharedPage() {
	const { t } = useTranslation()
	const [searchParams, setSearchParams] = useSearchParams()
	const sharedResources = useListSharedResources()

	const allSharedResources = useMemo(() => sharedResources.data ?? [], [sharedResources.data])

	const nestedPath = useMemo<TPathSegment[]>(() => {
		const raw = searchParams.get('path')
		if (!raw) return []
		return raw.split(',').map((segment) => {
			const [id, ...nameParts] = segment.split(':')
			return { id, name: decodeURIComponent(nameParts.join(':')) }
		})
	}, [searchParams])

	const setNestedPath = (segments: TPathSegment[]) => {
		setSearchParams(
			segments.length ? { path: segments.map((s) => `${s.id}:${encodeURIComponent(s.name)}`).join(',') } : {},
			{ replace: false },
		)
	}

	const path = useMemo(() => {
		return [{ id: SHARED_ROOT_ID, name: t('nav.shared') }, ...nestedPath]
	}, [nestedPath, t])

	const titlePath = useMemo(() => {
		if (!path.length) return t('nav.shared')
		return path.map((segment) => segment.name).join(' / ')
	}, [path, t])

	const currentFolderId = useMemo(() => {
		return path[path.length - 1]?.id ?? SHARED_ROOT_ID
	}, [path])

	const currentFolderResources = useListFolderResources(currentFolderId === SHARED_ROOT_ID ? '' : currentFolderId)

	const sharedResourceIds = useMemo(
		() => new Set(allSharedResources.map((resource) => resource.id)),
		[allSharedResources],
	)

	const visibleResources = useMemo(() => {
		if (currentFolderId === SHARED_ROOT_ID) {
			return allSharedResources.filter(
				(resource) => !resource.parentFolder || !sharedResourceIds.has(resource.parentFolder),
			)
		}

		return currentFolderResources.data ?? []
	}, [allSharedResources, currentFolderId, currentFolderResources.data, sharedResourceIds])

	const handleOpenFolder = (resource: TResourceResponse) => {
		if (resource.type !== 'FOLDER') return

		const fullPath = [{ id: SHARED_ROOT_ID, name: t('nav.shared') }, ...nestedPath]
		const existingIndex = fullPath.findIndex((segment) => segment.id === resource.id)

		if (existingIndex >= 0) {
			setNestedPath(existingIndex === 0 ? [] : fullPath.slice(1, existingIndex + 1))
		} else {
			setNestedPath([...nestedPath, { id: resource.id, name: resource.name }])
		}
	}

	const handleNavigateToPath = (index: number) => {
		const fullPath = [{ id: SHARED_ROOT_ID, name: t('nav.shared') }, ...nestedPath]
		if (index < 0 || index >= fullPath.length) return
		setNestedPath(index === 0 ? [] : fullPath.slice(1, index + 1))
	}

	if (sharedResources.isError) return <ErrorMessage text={t('errors.generic')} />
	if (currentFolderId !== SHARED_ROOT_ID && currentFolderResources.isError) {
		return <ErrorMessage text={t('errors.generic')} />
	}

	return (
		<>
			<Title>{'› ' + titlePath}</Title>
			<FileTable
				resources={visibleResources}
				mode="shared"
				enableFolderControls
				currentFolderId={currentFolderId === SHARED_ROOT_ID ? null : currentFolderId}
				path={path}
				onOpenFolder={handleOpenFolder}
				onNavigateToPath={handleNavigateToPath}
				isLoading={
					sharedResources.isLoading ||
					(currentFolderId !== SHARED_ROOT_ID && currentFolderResources.isLoading) ||
					(currentFolderId !== SHARED_ROOT_ID && currentFolderResources.isFetching)
				}
			/>
		</>
	)
}

export default SharedPage
