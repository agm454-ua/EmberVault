import { useNavigate } from 'react-router-dom'

function Logo({ height = '2.25rem', to = null }: { height?: string; to?: string | null }) {
	const navigate = useNavigate()
	return (
		<span
			className={'flex items-center gap-2 font-heading text-ink' + (to ? ' cursor-pointer' : '')}
			style={{ height: height, fontSize: `calc(${height} * 0.7)` }}
			onClick={() => to && navigate(to)}
		>
			<img src="/assets/Logo.svg" alt="Logo" className="h-full w-auto aspect-square" />
			EmberVault
		</span>
	)
}

export default Logo
