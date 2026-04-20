import { useState, type InputHTMLAttributes } from 'react'
import Button from './Button'
import ShowIcon from '@shared/icons/ShowIcon'
import HideIcon from '@shared/icons/HideIcon'

type InputProps = {
	label?: string
	error?: string
	type?: string | 'text' | 'email' | 'password' | 'date'
	disabled?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export default function Input({ label, error, className, type, disabled, ...props }: InputProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className="flex flex-col gap-1 w-full">
			{label && <label className="text-sm text-ink pl-0.5">{label}</label>}

			<div className="relative w-full">
				<input
					className={`text-ink-muted text-sm border rounded-md px-4 py-2 w-full transition-colors duration-100 outline-none 
						${error ? 'border-danger-500' : 'border-stroke focus:border-stroke-focus'}
						${disabled ? 'bg-stroke-muted cursor-not-allowed' : 'bg-surface-canvas'}
					 ${className ?? ''}`}
					type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
					disabled={disabled}
					{...props}
				/>

				{type === 'password' && (
					<Button
						type="button"
						variant="ghost"
						className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-ink"
						onClick={() => setShowPassword(!showPassword)}
						round
					>
						{showPassword ? <HideIcon /> : <ShowIcon />}
					</Button>
				)}
			</div>

			{error && <span className="text-sm text-danger-500">{error}</span>}
		</div>
	)
}
