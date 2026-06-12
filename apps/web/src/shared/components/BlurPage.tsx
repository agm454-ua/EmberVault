import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BlurPageProps {
	children: ReactNode
	onClose?: () => void
}

export default function BlurPage({ children, onClose }: BlurPageProps): ReactNode {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return null
	}

	return createPortal(
		<div
			className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					onClose?.()
				}
			}}
			tabIndex={-1}
		>
			{/* Prevent clicks inside the content from closing the portal */}
			<div onClick={(e) => e.stopPropagation()}>{children}</div>
		</div>,
		document.body,
	)
}
