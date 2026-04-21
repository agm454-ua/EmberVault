import { useState, type SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import BlurPage from '@/shared/components/BlurPage'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import ErrorMessage from '@/shared/components/ErrorMessage'
import CrossIcon from '@/shared/icons/CrossIcon'
import useChangePassword from '@/features/auth/hooks/useChangePassword'
import ConfirmationOverlay from '@/shared/components/ConfirmationOverlay'

type ChangePasswordModalProps = {
	isOpen: boolean
	onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
	const { t } = useTranslation()
	const changePassword = useChangePassword()

	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [error, setError] = useState('')
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')

	if (!isOpen) {
		return null
	}

	const resetState = () => {
		setOldPassword('')
		setNewPassword('')
		setConfirmNewPassword('')
		setError('')
		setIsConfirmOpen(false)
	}

	const handleClose = () => {
		if (changePassword.isPending) return
		onClose()
		resetState()
	}

	const handleSave = (e: SubmitEvent<HTMLElement>) => {
		e.preventDefault()

		if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		if (newPassword.trim() !== confirmNewPassword.trim()) {
			setError(t('errors.passwordsDontMatch'))
			return
		}

		if (newPassword.trim() === oldPassword.trim()) {
			setError(t('errors.editFailed'))
			return
		}

		setError('')
		setIsConfirmOpen(true)
	}

	const handleConfirm = async () => {
		try {
			await changePassword.mutateAsync({
				oldPassword: oldPassword.trim(),
				newPassword: newPassword.trim(),
				confirmNewPassword: confirmNewPassword.trim(),
			})
			handleClose()
		} catch {
			setIsConfirmOpen(false)
			setError(t('errors.editFailed'))
		}
	}

	return (
		<BlurPage>
			<div className="relative z-10 w-full max-w-lg rounded-xl border border-stroke bg-surface-canvas p-5 shadow-xl flex flex-col gap-4">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-lg text-ink">{t('profilePage.changePassword')}</h2>
					<Button
						variant="ghost"
						round
						disabled={changePassword.isPending}
						onClick={handleClose}
						className="text-ink"
					>
						<CrossIcon />
					</Button>
				</div>

				<form className="w-full flex flex-col gap-4" onSubmit={handleSave}>
					{error && <ErrorMessage text={error} />}

					<Input
						type="password"
						label={t('profilePage.currentPassword') + ':'}
						value={oldPassword}
						disabled={changePassword.isPending}
						onChange={(e) => {
							setOldPassword(e.target.value)
							if (error) setError('')
						}}
					/>
					<Input
						type="password"
						label={t('profilePage.newPassword') + ':'}
						value={newPassword}
						disabled={changePassword.isPending}
						onChange={(e) => {
							setNewPassword(e.target.value)
							if (error) setError('')
						}}
					/>
					<Input
						type="password"
						label={t('profilePage.confirmNewPassword') + ':'}
						value={confirmNewPassword}
						disabled={changePassword.isPending}
						onChange={(e) => {
							setConfirmNewPassword(e.target.value)
							if (error) setError('')
						}}
					/>

					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							variant="ghost"
							type="button"
							disabled={changePassword.isPending}
							onClick={handleClose}
						>
							{t('actions.cancel')}
						</Button>
						<Button variant="danger" type="submit" disabled={changePassword.isPending}>
							{t('actions.save')}
						</Button>
					</div>
				</form>

				<ConfirmationOverlay
					isOpen={isConfirmOpen}
					message={t('actions.confirm') + '?'}
					cancelLabel={t('actions.cancel')}
					confirmLabel={changePassword.isPending ? t('nav.loading') : t('actions.confirm')}
					isPending={changePassword.isPending}
					onCancel={() => setIsConfirmOpen(false)}
					onConfirm={handleConfirm}
				/>
			</div>
		</BlurPage>
	)
}
