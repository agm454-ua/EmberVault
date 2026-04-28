import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type LinkButtonProps = {
	children?: ReactNode
	onClick?: () => void
	to?: string
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
	className?: string
	round?: boolean
}

export default function LinkButton({
	children,
	onClick,
	to = '/',
	variant = 'primary',
	className,
	round = false,
}: LinkButtonProps) {
	const baseClasses =
		' inline-flex items-center justify-center transition-colors duration-200 cursor-pointer text-center text-sm' +
		(className ? ` ${className}` : '') +
		(round ? ' rounded-full p-2' : ' rounded-md px-8 py-2 gap-2')

	const variantClasses = {
		primary: 'bg-primary-500 text-ink-inverse hover:bg-primary-600 font-semibold ',
		secondary: 'bg-surface-tint text-ink-primary hover:bg-surface-raised font-semibold ',
		danger: 'border border-danger-500 text-danger-500 bg-danger-50 hover:bg-danger-500 hover:text-ink-inverse font-semibold',
		ghost: 'bg-transparent text-ink font-normal hover:bg-surface-gray',
	}
	return (
		<Link to={to} className={`${baseClasses} ${variantClasses[variant]}`} onClick={onClick}>
			{children}
		</Link>
	)
}
