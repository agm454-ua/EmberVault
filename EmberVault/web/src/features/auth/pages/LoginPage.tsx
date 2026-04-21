import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { Link, useNavigate } from 'react-router-dom'
import useLogin from '../hooks/useLogin'
import { useState, type SubmitEvent } from 'react'
import ErrorMessage from '@/shared/components/ErrorMessage'
import { validateMailFormat } from '@/shared/utils/validateMailFormat'

export function LoginPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const login = useLogin()

	const handleSubmit = (e: SubmitEvent<HTMLElement>) => {
		e.preventDefault()

		if (!identifier.trim() || !password.trim()) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		setError('')

		if (validateMailFormat(identifier.trim())) {
			// If is's an email, send an email
			login.mutate(
				{ email: identifier.trim(), password: password.trim() },
				{
					onError: (err) => {
						console.log(err)
						setError(t('errors.loginFailed'))
					},
					onSuccess: () => {
						navigate(routes.library)
					},
				},
			)
			return
		} else {
			login.mutate(
				{ username: identifier.trim(), password: password.trim() },
				{
					onError: (err) => {
						console.log(err)
						setError(t('errors.loginFailed'))
					},
					onSuccess: () => {
						navigate(routes.library)
					},
				},
			)
		}
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form
				className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8"
				onSubmit={(e) => handleSubmit(e)}
			>
				<h1 className="text-xl text-ink">{t('auth.login')}</h1>
				{error && <ErrorMessage text={error} />}
				<Input
					label={t('auth.usernameOrEmail') + ':'}
					type="text"
					value={identifier}
					onChange={(e) => setIdentifier(e.target.value)}
				/>
				<div className="w-full">
					<Input
						label={t('userData.password') + ':'}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Link to={routes.resetPasswordLink} className="text-xs text-ink-linked float-right mt-2">
						{t('auth.forgotPassword')}
					</Link>
				</div>
				<Button variant="primary" type="submit" className="px-14">
					{t('auth.login')}
				</Button>
				<Link className="text-xs text-ink-linked" to={routes.register}>
					{t('auth.noAccount')}
				</Link>
			</form>
		</section>
	)
}

export default LoginPage
