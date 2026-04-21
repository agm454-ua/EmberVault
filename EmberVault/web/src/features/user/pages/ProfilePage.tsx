import Title from '@/shared/layouts/Title'
import { useTranslation } from 'react-i18next'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import UpdateProfilePicture from '../components/UpdateProfilePicture'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react'
import useMe from '@/features/auth/hooks/useMe'
import useGetUser from '../hooks/useGetUser'
import useUpdateUser from '../hooks/useUpdateUser'
import useUploadAvatar from '@/features/media/hooks/useUploadAvatar'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { useQueryClient } from '@tanstack/react-query'
import ChangePasswordModal from '../components/ChangePasswordModal'

type TEditableProfile = {
	username: string
	birthDate: string
	avatarURL: string | null
}

const toDateInputValue = (date?: string) => {
	if (!date) return ''
	return date.includes('T') ? date.split('T')[0] : date
}

const normalizeAvatar = (avatar?: string | null) => {
	if (!avatar?.trim()) return null
	return avatar
}

const extractUploadedAvatarUrl = (payload: unknown): string | null => {
	if (typeof payload === 'string') {
		return payload
	}

	if (!payload || typeof payload !== 'object') {
		return null
	}

	const data = payload as Record<string, unknown>
	const directUrlFields = ['avatarURL', 'avatarUrl', 'profilePictureUrl', 'profilePictureURL', 'url']

	for (const key of directUrlFields) {
		if (typeof data[key] === 'string') {
			return data[key] as string
		}
	}

	if (data.data && typeof data.data === 'object') {
		return extractUploadedAvatarUrl(data.data)
	}

	return null
}

export default function ProfilePage() {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { data: meData } = useMe()
	const userId = meData?.id ?? ''

	const { data: fullUserData } = useGetUser(userId)
	const updateUser = useUpdateUser(userId)
	const uploadAvatar = useUploadAvatar()

	const [isEditing, setIsEditing] = useState(false)
	const [username, setUsername] = useState('')
	const [birthDate, setBirthDate] = useState('')
	const [avatarURL, setAvatarURL] = useState<string | null>(null)
	const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
	const [error, setError] = useState('')
	const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)

	const [initialProfile, setInitialProfile] = useState<TEditableProfile>({
		username: '',
		birthDate: '',
		avatarURL: null,
	})

	const canSubmit = useMemo(() => {
		if (!isEditing || !userId) return false
		if (!username.trim()) return false

		const hasBaseFieldChanges =
			username.trim() !== initialProfile.username ||
			birthDate !== initialProfile.birthDate ||
			normalizeAvatar(avatarURL) !== initialProfile.avatarURL

		return hasBaseFieldChanges || !!selectedAvatarFile
	}, [avatarURL, birthDate, initialProfile, isEditing, selectedAvatarFile, userId, username])

	useEffect(() => {
		if (!meData && !fullUserData) return

		const nextUsername = fullUserData?.username ?? meData?.username ?? ''
		const nextBirthDate = toDateInputValue(fullUserData?.birthdate ?? fullUserData?.birthdate ?? meData?.birthdate)
		const nextAvatarURL = normalizeAvatar(fullUserData?.profile_picture_url ?? fullUserData?.profile_picture_url)

		if (!isEditing) {
			setUsername(nextUsername)
			setBirthDate(nextBirthDate)
			setAvatarURL(nextAvatarURL)
			setSelectedAvatarFile(null)
			setInitialProfile({
				username: nextUsername,
				birthDate: nextBirthDate,
				avatarURL: nextAvatarURL,
			})
		}
	}, [fullUserData, isEditing, meData])

	const resetForm = () => {
		setUsername(initialProfile.username)
		setBirthDate(initialProfile.birthDate)
		setAvatarURL(initialProfile.avatarURL)
		setSelectedAvatarFile(null)
		setError('')
		setIsEditing(false)
	}

	const handleAvatarSelection = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			setError(t('errors.uploadFailed'))
			return
		}

		setSelectedAvatarFile(file)
		setAvatarURL(URL.createObjectURL(file))
		setError('')
	}

	const handleAvatarRemove = () => {
		if (!isEditing) return
		setSelectedAvatarFile(null)
		setAvatarURL(null)
		setError('')
	}

	const handleSubmit = async (e: SubmitEvent<HTMLElement>) => {
		e.preventDefault()

		if (!userId) {
			setError(t('errors.unauthorized'))
			return
		}

		const trimmedUsername = username.trim()
		if (!trimmedUsername) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		setError('')

		let nextAvatarURL = normalizeAvatar(avatarURL)
		if (selectedAvatarFile) {
			try {
				const uploadResult = await uploadAvatar.mutateAsync(selectedAvatarFile)
				nextAvatarURL = extractUploadedAvatarUrl(uploadResult)
				if (!nextAvatarURL) {
					throw new Error('Avatar URL missing in upload response')
				}
			} catch {
				setError(t('errors.uploadFailed'))
				return
			}
		}

		const payload: { username?: string; birthDate?: string; avatarURL?: string | null } = {}

		if (trimmedUsername !== initialProfile.username) {
			payload.username = trimmedUsername
		}

		if (birthDate !== initialProfile.birthDate) {
			payload.birthDate = birthDate
		}

		if (nextAvatarURL !== initialProfile.avatarURL) {
			payload.avatarURL = nextAvatarURL
		}

		if (Object.keys(payload).length === 0) {
			setIsEditing(false)
			return
		}

		try {
			await updateUser.mutateAsync(payload)

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['me'] }),
				queryClient.invalidateQueries({ queryKey: ['getUser', userId] }),
			])

			setInitialProfile({
				username: trimmedUsername,
				birthDate,
				avatarURL: nextAvatarURL,
			})
			setAvatarURL(nextAvatarURL)
			setSelectedAvatarFile(null)
			setIsEditing(false)
		} catch {
			setError(t('errors.editFailed'))
		}
	}

	return (
		<>
			<Title>{'› ' + t('nav.profile')}</Title>

			<form
				className="mt-28 bg-surface-canvas p-8 rounded-xl border border-stroke max-w-3xl w-full mx-auto flex flex-col gap-10"
				onSubmit={handleSubmit}
			>
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					accept="image/*"
					onChange={handleAvatarSelection}
					disabled={!isEditing || uploadAvatar.isPending || updateUser.isPending}
				/>

				{error && <ErrorMessage text={error} />}

				<div className="flex gap-10 items-start">
					{/* Profile picture section */}
					<div className="flex flex-col items-center gap-8 pr-8 ">
						<p className="text-sm text-ink text-center">{t('userData.profilePicture')}</p>

						<UpdateProfilePicture pictureUrl={avatarURL} className="h-32! w-32!" disabled={!isEditing} />

						<div className="flex gap-2 ">
							<Button
								variant="secondary"
								disabled={!isEditing || uploadAvatar.isPending || updateUser.isPending}
								onClick={() => fileInputRef.current?.click()}
							>
								{t('actions.edit')}
							</Button>
							<Button
								variant="danger"
								disabled={!isEditing || (!avatarURL && !selectedAvatarFile) || uploadAvatar.isPending || updateUser.isPending}
								onClick={handleAvatarRemove}
							>
								{t('actions.remove')}
							</Button>
						</div>
					</div>

					{/* Form fields */}
					<div className="flex flex-col gap-5 flex-1 max-w-md">
						<Input
							label={t('userData.username') + ':'}
							disabled={!isEditing || updateUser.isPending || uploadAvatar.isPending}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<Input
							label={t('userData.birthdate') + ':'}
							type="date"
							disabled={!isEditing || updateUser.isPending || uploadAvatar.isPending}
							value={birthDate}
							onChange={(e) => setBirthDate(e.target.value)}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-4 border-t border-stroke">
					<Button
						variant="ghost"
						disabled={updateUser.isPending || uploadAvatar.isPending}
						onClick={resetForm}
					>
						{t('actions.cancel')}
					</Button>
					<Button
						variant="primary"
						disabled={isEditing ? !canSubmit || updateUser.isPending || uploadAvatar.isPending : false}
						onClick={(e) => {
							if (isEditing) return
							e.preventDefault()
							setError('')
							setIsEditing(true)
						}}
						type={isEditing ? 'submit' : 'button'}
					>
						{updateUser.isPending || uploadAvatar.isPending ? t('nav.loading') : isEditing ? t('actions.save') : t('actions.edit')}
					</Button>
				</div>
			</form>
			<div className="mt-8 p-8 border border-stroke rounded-lg max-w-3xl w-full mx-auto flex justify-between items-center">
				<p className="text-sm">{t('profilePage.changePassword')}</p>
				<Button variant="danger" onClick={() => setIsChangePasswordModalOpen(true)}>
					{t('profilePage.changePassword')}
				</Button>
			</div>

			<ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
		</>
	)
}
