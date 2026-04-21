import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'

type ButtonProps = {
	children?: ReactNode
	onClick?: MouseEventHandler<HTMLButtonElement>
	type?: 'button' | 'submit'
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
	className?: string
	round?: boolean
	disabled?: boolean
	props?: ButtonHTMLAttributes<HTMLButtonElement>
}

export default function Button({
	children,
	onClick,
	type = 'button',
	variant = 'primary',
	className = '',
	round = false,
	disabled = false,
	...props
}: ButtonProps) {
	const baseClasses =
		' inline-flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm' +
		(className ? ` ${className}` : '') +
		(round ? ' rounded-full p-2' : ' rounded-md px-8 py-2 gap-2')

	const disabledClasses = disabled ? ' opacity-50 cursor-not-allowed bg-surface-gray' : ''

	const variantClasses = {
		primary: 'bg-primary-500 text-ink-inverse hover:bg-primary-600 font-semibold ',
		secondary: 'bg-surface-tint text-ink-primary hover:bg-surface-raised font-semibold ',
		danger: 'border border-danger-500 text-danger-500 bg-danger-50 hover:bg-danger-500 hover:text-ink-inverse font-semibold',
		ghost: 'bg-transparent text-ink font-normal hover:bg-surface-gray',
	}
	return (
		<button
			type={type}
			className={`${baseClasses} ${!disabled ? variantClasses[variant] : ''} ${disabledClasses}`}
			onClick={onClick}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	)
}
