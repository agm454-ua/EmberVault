import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import FileTable from '../components/FileTable'
import useListFolderResources from '../hooks/useListFolderResources'
import { useMe } from '@/features/auth/hooks/useMe'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { useMemo } from 'react'
import type { TResourceResponse } from '../types/resources'
import { useSearchParams } from 'react-router-dom'

type TPathSegment = {
  id: string
  name: string
}

export function LibraryPage() {
  const { t } = useTranslation()
  const { data, isLoading: isMeLoading, isError: isMeError } = useMe()
  const [searchParams, setSearchParams] = useSearchParams()

  const rootFolderId = data?.root_folder ?? ''

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
      segments.length
        ? { path: segments.map((s) => `${s.id}:${encodeURIComponent(s.name)}`).join(',') }
        : {},
      { replace: false }
    )
  }

  const path = useMemo(() => {
    if (!rootFolderId) return []
    return [{ id: rootFolderId, name: t('nav.library') }, ...nestedPath]
  }, [rootFolderId, t, nestedPath])

  const titlePath = useMemo(() => {
    if (!path.length) return t('nav.library')
    return path.map((s) => s.name).join(' / ')
  }, [path, t])

  const currentFolderId = useMemo(() => {
    return path[path.length - 1]?.id ?? rootFolderId
  }, [path, rootFolderId])

  const listFolderResources = useListFolderResources(currentFolderId)

  const handleOpenFolder = (resource: TResourceResponse) => {
    if (resource.type !== 'FOLDER') return

    const fullPath = rootFolderId
      ? [{ id: rootFolderId, name: t('nav.library') }, ...nestedPath]
      : nestedPath

    const existingIndex = fullPath.findIndex((s) => s.id === resource.id)
    if (existingIndex >= 0) {
      setNestedPath(existingIndex === 0 ? [] : fullPath.slice(1, existingIndex + 1))
    } else {
      setNestedPath([...nestedPath, { id: resource.id, name: resource.name }])
    }
  }

  const handleNavigateToPath = (index: number) => {
    const fullPath = rootFolderId
      ? [{ id: rootFolderId, name: t('nav.library') }, ...nestedPath]
      : nestedPath

    if (index < 0 || index >= fullPath.length) return
    setNestedPath(index === 0 ? [] : fullPath.slice(1, index + 1))
  }

  if (isMeLoading) return <div>{t('nav.loading')}</div>
  if (isMeError || !data || !data.root_folder) return <ErrorMessage text={t('errors.generic')} />
  if (listFolderResources.isLoading) return <div>{t('nav.loading')}</div>
  if (listFolderResources.isError) return <ErrorMessage text={t('errors.generic')} />

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