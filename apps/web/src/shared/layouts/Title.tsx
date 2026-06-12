import type { ReactNode } from 'react'

export default function Title({ children }: { children: ReactNode }) {
	return (
		<>
			<h1 className="w-full border-b border-stroke h-16 flex items-center px-6 text-lg bg-surface-canvas fixed">
				{children}
			</h1>
			{/* separator */}
			<div className="mt-16" />
		</>
	)
}
