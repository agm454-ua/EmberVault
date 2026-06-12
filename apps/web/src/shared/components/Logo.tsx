import { useNavigate } from 'react-router-dom'

function Logo({ height = '2.25rem', to = null }: { height?: string; to?: string | null }) {
	const navigate = useNavigate()
	return (
		<a
			className={'flex items-center gap-2 font-heading text-ink' + (to ? ' cursor-pointer' : '')}
			style={{ height: height, fontSize: `calc(${height} * 0.7)` }}
			onClick={() => to && navigate(to)}
			href={to || undefined}
			tabIndex={to ? 0 : -1}
			onKeyDown={(e) => {
				if ((e.key === 'Enter' || e.key === ' ') && to) {
					e.preventDefault()
					navigate(to)
				}
			}}
		>
			<img src="/assets/Logo.svg" alt="Logo" className="h-full w-auto aspect-square" />
			EmberVault
		</a>
	)
}

export default Logo
