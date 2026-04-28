export default function ImageFileIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#e17100"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={'shrink-0 ' + (className ?? 'w-6 h-6')}
		>
			<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
			<circle cx="9" cy="9" r="2" />
			<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
		</svg>
	)
}
