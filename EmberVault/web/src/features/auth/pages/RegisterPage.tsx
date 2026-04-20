import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { Link, useNavigate } from 'react-router-dom'
import ImageDragInput from '@/features/media/components/ImageDragInput'
import { useState, type SubmitEvent } from 'react'
import ErrorMessage from '@/shared/components/ErrorMessage'
import useRegister from '../hooks/useRegister'

export function RegisterPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const [username, setUsername] = useState('')
	const [birthdate, setBirthdate] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [error, setError] = useState('')

	const register = useRegister()

	const handleSubmit = (e: SubmitEvent<HTMLElement>) => {
		e.preventDefault()
		if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !birthdate) {
			setError(t('errors.allFieldsRequired'))
			return
		}

		if (password !== confirmPassword) {
			setError(t('errors.passwordsDontMatch'))
			return
		}

		setError('')
		register.mutate(
			{
				username: username.trim(),
				email: email.trim(),
				password: password.trim(),
				confirmPassword: confirmPassword.trim(),
				birthDate: birthdate,
			},
			{
				onError: (err) => {
					console.log(err)
					setError(t('errors.registrationFailed'))
				},
				onSuccess: () => {
					navigate(routes.profile)
				},
			},
		)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form
				className="w-1/2 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8"
				onSubmit={(e) => handleSubmit(e)}
			>
				<h1 className="text-xl text-ink">{t('auth.createAccount')}</h1>
				{error && <ErrorMessage text={error} />}
				<div className="w-full flex gap-4">
					<Input
						label={t('userData.username') + ':'}
						type="text"
						className="w-1/2"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<Input
						label={t('userData.birthdate') + ':'}
						type="date"
						className="w-1/2"
						value={birthdate}
						onChange={(e) => setBirthdate(e.target.value)}
					/>
				</div>
				<Input
					label={t('userData.email') + ':'}
					type="email"
					className="w-1/2!"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<div className="w-full flex gap-4">
					<Input
						label={t('userData.password') + ':'}
						type="password"
						className="w-1/2"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Input
						label={t('auth.confirmPassword') + ':'}
						type="password"
						className="w-1/2"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</div>
				<ImageDragInput label={t('userData.profilePicture') + ':'} />

				<Button variant="primary" type="submit" className="px-14">
					{t('auth.createAccount')}
				</Button>
				<Link className="text-xs text-ink-linked" to={routes.login}>
					{t('auth.haveAccount')}
				</Link>
			</form>
		</section>
	)
}

export default RegisterPage
