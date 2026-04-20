export default function VideoFileIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#EF4444"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={'shrink-0 ' + (className ?? 'w-6 h-6')}
		>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z" />
		</svg>
	)
}
