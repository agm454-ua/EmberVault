import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { useNavigate } from 'react-router-dom'

export function ResetPasswordPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleSubmit = () => {
		navigate(routes.login)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8">
				<h1 className="text-xl">{t('auth.newPassword')}</h1>
				<p className="text-xs self-start">{t('auth.insertNewPassword')}</p>
				<Input label={t('auth.newPassword') + ':'} type="password" />
				<Button variant="primary" type="submit" onClick={handleSubmit}>
					{t('auth.modifyPassword')}
				</Button>
			</form>
		</section>
	)
}

export default ResetPasswordPage
