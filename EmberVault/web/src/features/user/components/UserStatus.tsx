import { useTranslation } from "react-i18next"

export default function UserStatus({ status }: { status: 'active' | 'suspended' | 'deleted' | string }) {
	const { t } = useTranslation()

    const statusClasses =
        status === 'active'
            ? 'text-success-500 bg-success-50 border-success-500'
            : status === 'suspended'
                ? 'text-warning-500 bg-warning-50 border-warning-500'
                : status === 'deleted'
                    ? 'text-danger-500 bg-danger-50 border-danger-500'
                    : 'text-ink-muted bg-surface-gray border-stroke'

    return (

        <div className="w-28">
            <span className={`inline-flex border px-2 py-0.5 rounded-md text-xs capitalize ${statusClasses}`}>
                {status === '-' ? status : t(`user.statusValues.${status}`, status)}
            </span>
        </div>
    )

}