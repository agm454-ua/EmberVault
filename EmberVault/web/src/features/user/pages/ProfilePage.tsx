import Title from '@/shared/layouts/Title'
import ProfilePicture from '../components/ProfilePicture'
import { useTranslation } from 'react-i18next'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
export default function ProfilePage() {
	const { t } = useTranslation()

	return (
		<section>
			<Title>{'› ' + t('nav.profile')}</Title>

			<form className="my-10 bg-surface-canvas p-8 rounded-xl border border-stroke max-w-3xl w-full mx-auto flex flex-col gap-10">
				<div className="flex gap-10 items-start">
					{/* Profile picture section */}
					<div className="flex flex-col items-center gap-8 pr-8 ">
						<p className="text-sm text-ink text-center">{t('userData.profilePicture')}</p>

						<ProfilePicture className="h-32! w-32!" />

						<div className="flex gap-2 ">
							<Button variant="secondary">{t('actions.edit')}</Button>
							<Button variant="danger">{t('actions.remove')}</Button>
						</div>
					</div>

					{/* Form fields */}
					<div className="flex flex-col gap-5 flex-1 max-w-md">
						<Input label={t('userData.username') + ':'} />
						<Input label={t('userData.birthdate') + ':'} type="date" />
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-4 border-t border-stroke">
					<Button variant="ghost">{t('actions.cancel')}</Button>
					<Button variant="primary" type="submit">
						{t('actions.save')}
					</Button>
				</div>
			</form>
		</section>
	)
}
