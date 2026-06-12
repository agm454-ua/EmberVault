import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import LinkButton from '@/shared/components/LinkButton'
import Button from '@/shared/components/Button'
import useForgotPassword from '../hooks/useForgotPassword'
import { useState, type SubmitEvent, type MouseEvent } from 'react'
import ErrorMessage from '@/shared/components/ErrorMessage'
import WarningMessage from '@/shared/components/WarningMessage'

export function ResetPasswordLinkPage() {
	const { t } = useTranslation()
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [showCodeSent, setShowCodeSent] = useState(false)

	const forgotPassword = useForgotPassword()

	const handleSendRecoveryCode = (e: SubmitEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
		e.preventDefault()
		if (!email.trim()) {
			setError(t('errors.allFieldsRequired'))
			return
		}
		setError('')
		forgotPassword.mutate(email)
		setShowCodeSent(true)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form
				className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8"
				onSubmit={(e) => handleSendRecoveryCode(e)}
			>
				<h1 className="text-xl">{t('auth.recoverPassword')}</h1>
				<p className="text-xs">{t('auth.insertEmailToRecover')}</p>
				{error && <ErrorMessage text={error} />}
				<div className="w-full flex flex-col gap-1">
					<Input
						label={t('userData.email') + ':'}
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					{
						//<p className="text-xs text-ink-linked cursor-pointer" onClick={handleSendRecoveryCode}>
						//	{t('auth.resendRecoveryCode')}
						//</p>
					}
				</div>
				{showCodeSent && <WarningMessage text={t('auth.recoveryCodeSent')} />}
				<Button variant="primary" type="submit">
					{t('auth.sendRecoveryCode')}
				</Button>
				<div className="flex flex-col items-end w-full gap-2">
					<div className="border-b-2 border-gray-200 w-full" />
					<LinkButton variant="secondary" to={routes.login}>
						{t('nav.back')}
					</LinkButton>
				</div>
			</form>
		</section>
	)
}

export default ResetPasswordLinkPage
