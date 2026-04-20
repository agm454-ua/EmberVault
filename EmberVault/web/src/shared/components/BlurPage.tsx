import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type BlurPageProps = {
	children: ReactNode
}

export default function BlurPage({ children }: BlurPageProps) {
	// Prevent issues in non-browser environments
	if (typeof document === 'undefined') return null

	return createPortal(
		<div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center">
			{children}
		</div>,
		document.body,
	)
}
