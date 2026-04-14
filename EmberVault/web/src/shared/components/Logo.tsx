function Logo({ height = '2.25rem' }: { height?: string }) {
	return (
		<span
			className="flex items-center gap-2 font-heading text-ink"
			style={{ height: height, fontSize: `calc(${height} * 0.7)` }}
		>
			<img src="/assets/Logo.svg" alt="Logo" className="h-full w-auto aspect-square" />
			EmberVault
		</span>
	)
}

export default Logo
