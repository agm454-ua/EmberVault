import { useTranslation } from 'react-i18next'

type SpinnerProps = {
	size?: 'sm' | 'md' | 'lg'
	label?: string
}

const sizes = {
	sm: 'w-4 h-4 border-2',
	md: 'w-7 h-7 border-2',
	lg: 'w-11 h-11 border-[3px]',
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
	const { t } = useTranslation()
	return (
		<div className="flex flex-col items-center gap-2">
			<div
				className={`${sizes[size]} rounded-full border-2 border-surface-raised border-t-primary-500 animate-spin`}
				role="status"
				aria-label={label ?? t('nav.loading')}
			/>
			{label && <span className="text-sm text-muted-foreground">{label}</span>}
		</div>
	)
}
