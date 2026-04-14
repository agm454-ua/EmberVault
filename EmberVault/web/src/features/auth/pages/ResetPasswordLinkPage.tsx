import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { useNavigate } from 'react-router-dom'
import LinkButton from '@/shared/components/LinkButton'
import Button from '@/shared/components/Button'

export function ResetPasswordLinkPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleSendRecoveryCode = () => {
		navigate(routes.resetPassword)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8">
				<h1 className="text-xl">{t('auth.recoverPassword')}</h1>
				<p className="text-xs">{t('auth.insertEmailToRecover')}</p>
				<Input label={t('userData.email') + ':'} type="email" />
				<Button variant="primary" type="submit" onClick={handleSendRecoveryCode}>
					{t('auth.sendRecoveryCode')}
				</Button>
				<LinkButton variant="secondary" to={routes.login}>
					{t('nav.back')}
				</LinkButton>
			</form>
		</section>
	)
}

export default ResetPasswordLinkPage
