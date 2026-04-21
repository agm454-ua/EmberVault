export default function BookFileIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#14B8A6"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={'shrink-0 ' + (className ?? 'w-6 h-6')}
		>
			<path d="M10 2v8l3-3 3 3V2" />
			<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
		</svg>
	)
}
