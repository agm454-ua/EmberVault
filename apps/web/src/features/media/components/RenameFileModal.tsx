import BlurPage from '@/shared/components/BlurPage'
import Input from '@/shared/components/Input'
import type { TResourceResponse } from '../types/resources'
import getFileExtension from '../utils/getFileExtension'
import Button from '@/shared/components/Button'
import { useTranslation } from 'react-i18next'
import { useUpdateResource } from '../hooks/useUpdateResource'
import { useMemo, useState, type SubmitEvent } from 'react'
import axios from 'axios'

export default function RenameFileModal({ resource, onClose }: { resource: TResourceResponse; onClose: () => void }) {
	const { t } = useTranslation()
	const rename = useUpdateResource(resource.id)

	const extension = getFileExtension(resource.name)
	const initialNameWithoutExtension = useMemo(() => {
		if (!extension) {
			return resource.name
		}

		const suffix = `.${extension}`
		return resource.name.toLowerCase().endsWith(suffix) ? resource.name.slice(0, -suffix.length) : resource.name
	}, [extension, resource.name])

	const [name, setName] = useState(initialNameWithoutExtension)
	const [error, setError] = useState<string | null>(null)
	const resourceType = String(resource.type).toUpperCase() === 'FOLDER' ? 'FOLDER' : 'FILE'

	const handleSubmit = async (event: SubmitEvent<HTMLElement>) => {
		event.preventDefault()

		const trimmedName = name.trim()
		if (!trimmedName) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		const nextName = extension ? `${trimmedName}.${extension}` : trimmedName

		if (nextName === resource.name) {
			onClose()
			return
		}

		try {
			await rename.mutateAsync({
				name: nextName,
				type: resourceType,
			})

			onClose()
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const apiError = err.response?.data as { error?: string; message?: string } | undefined
				setError(apiError?.error ?? apiError?.message ?? t('errors.editFailed'))
				return
			}

			setError(t('errors.editFailed'))
		}
	}

	return (
		<BlurPage onClose={onClose}>
			<form className="bg-surface-canvas rounded-lg p-6 w-96" onSubmit={handleSubmit}>
				<h2 className="text-lg font-semibold mb-4">{t('media.rename')}</h2>
				<Input
					label={t('media.newName')}
					value={name}
					error={error ?? undefined}
					autoFocus
					onChange={(event) => {
						setName(event.target.value)
						if (error) {
							setError(null)
						}
					}}
				/>
				<div className="mt-4 flex justify-end gap-2">
					<Button variant="ghost" onClick={onClose} disabled={rename.isPending}>
						{t('actions.cancel')}
					</Button>
					<Button type="submit" disabled={rename.isPending}>
						{t('actions.save')}
					</Button>
				</div>
			</form>
		</BlurPage>
	)
}
