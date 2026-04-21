import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import useCreateUser from "../hooks/useCreateUser";
import ErrorMessage from "@/shared/components/ErrorMessage";
import BlurPage from "@/shared/components/BlurPage";

export default function CreateUserModal({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation()

    const [username, setUsername] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const createUser = useCreateUser()


    const handleSubmit = (e: SubmitEvent<HTMLElement>) => {
        e.preventDefault()
        if (!username.trim() || !email.trim() || !password.trim() || !birthdate) {
            setError(t('errors.allFieldsRequired'))
            return
        }

        setError('')
        createUser.mutate(
            {
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
                birthDate: birthdate,
            },
            {
                onError: (err) => {
                    console.error(err)
                    setError(t('errors.registrationFailed'))
                },
                onSuccess: () => {
                    onClose()
                },
            },
        )
    }

    return (
        <BlurPage>

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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        label={t('userData.birthdate') + ':'}
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                    />
                </div>
                <div className="w-full flex gap-4">
                    <Input
                        label={t('userData.email') + ':'}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label={t('userData.password') + ':'}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="w-full flex gap-4 justify-center pt-8">

                    <Button variant="primary" type="submit">
                        {t('auth.createAccount')}
                    </Button>
                    <Button variant="ghost" type="button" onClick={onClose}>
                        {t('actions.cancel')}
                    </Button>
                </div>
            </form>
        </BlurPage>
    )
}