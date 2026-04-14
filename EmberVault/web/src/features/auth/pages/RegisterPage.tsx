import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { useTranslation } from 'react-i18next'
import { routes } from '@config/constants'
import { Link, useNavigate } from 'react-router-dom'
import ImageDragInput from '@/features/media/components/ImageDragInput'

export function RegisterPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleSubmit = () => {
		navigate(routes.profile)
	}

	return (
		<section className="w-full flex flex-col gap-1 items-center justify-center">
			<Logo height="2.5rem" />
			<form className="w-1/2 min-w-96 flex flex-col items-center gap-6 bg-surface-canvas border-stroke rounded-xl py-6 px-8">
				<h1 className="text-xl text-ink">{t('auth.createAccount')}</h1>
				<div className="w-full flex gap-4">
					<Input label={t('userData.username') + ':'} type="text" className="w-1/2" />
					<Input label={t('userData.birthdate') + ':'} type="date" className="w-1/2" />
				</div>
				<Input label={t('userData.email') + ':'} type="email" className="w-1/2!" />
				<div className="w-full flex gap-4">
					<Input label={t('userData.password') + ':'} type="password" className="w-1/2" />
					<Input label={t('auth.confirmPassword') + ':'} type="password" className="w-1/2" />
				</div>
				<ImageDragInput label={t('userData.profilePicture') + ':'} />

				<Button variant="primary" type="submit" className="px-14" onClick={handleSubmit}>
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
