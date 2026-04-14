import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { Link, useNavigate } from 'react-router-dom'

export function LoginPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleSubmit = () => {
		navigate(routes.library)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form className="w-1/3 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8">
				<h1 className="text-xl text-ink">{t('auth.login')}</h1>
				<Input label={t('auth.usernameOrEmail') + ':'} type="text" />
				<div className="w-full">
					<Input label={t('userData.password') + ':'} type="password" />
					<Link to={routes.resetPasswordLink} className="text-xs text-ink-linked float-right mt-2">
						{t('auth.forgotPassword')}
					</Link>
				</div>
				<Button variant="primary" type="submit" className="px-14" onClick={handleSubmit}>
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
