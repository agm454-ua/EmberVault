import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useResetPassword from '../hooks/useResetPassword'
import { useState, type SubmitEvent } from 'react'
import type { ResetPasswordDTO } from '@/api/auth/auth.types'
import ErrorMessage from '@/shared/components/ErrorMessage'

export function ResetPasswordPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const [searchParams] = useSearchParams()

	const code = searchParams.get('code')
	const id = searchParams.get('id')

	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const resetPassword = useResetPassword()

	const handleSubmit = (e: SubmitEvent<HTMLElement>) => {
		e.preventDefault()

		const trimmedPassword = password.trim()
		if (!trimmedPassword) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		if (!id || !code) {
			setError(t('errors.resetPasswordFailed'))
			return
		}

		const data: ResetPasswordDTO = {
			id,
			password: trimmedPassword,
			code,
		}

		resetPassword.mutate(data, {
			onError: () => {
				setError(t('errors.resetPasswordFailed'))
			},
			onSuccess: () => {
				setError('')
				navigate(routes.login)
			},
		})
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form
				className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8"
				onSubmit={(e) => handleSubmit(e)}
			>
				<h1 className="text-xl">{t('auth.newPassword')}</h1>
				<p className="text-xs self-start">{t('auth.insertNewPassword')}</p>
				{error && <ErrorMessage text={error} />}
				<Input
					label={t('auth.newPassword') + ':'}
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Button variant="primary" type="submit">
					{t('auth.modifyPassword')}
				</Button>
			</form>
		</section>
	)
}

export default ResetPasswordPage
