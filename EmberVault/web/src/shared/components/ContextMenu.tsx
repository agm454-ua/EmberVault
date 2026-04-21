import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ContextMenuItem =
	| {
			label: string
			onClick: () => void
			danger?: boolean
			disabled?: boolean
			icon?: ReactNode
			divider?: never
	  }
	| { divider: true; label?: never; onClick?: never; danger?: never; disabled?: never; icon?: never }

export type ContextMenuProps = {
	x: number
	y: number
	items: ContextMenuItem[]
	onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		if (!menuRef.current) return
		const { offsetWidth: w, offsetHeight: h } = menuRef.current
		const vw = window.innerWidth
		const vh = window.innerHeight
		const adjustedX = x + w > vw ? Math.max(0, vw - w - 8) : x
		const adjustedY = y + h > vh ? Math.max(0, vh - h - 8) : y
		menuRef.current.style.left = `${adjustedX}px`
		menuRef.current.style.top = `${adjustedY}px`
	}, [x, y])

	useEffect(() => {
		const handleClick = (e: globalThis.MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose()
			}
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}

		document.addEventListener('mousedown', handleClick)
		document.addEventListener('keydown', handleKey)
		window.addEventListener('scroll', onClose, true)
		return () => {
			document.removeEventListener('mousedown', handleClick)
			document.removeEventListener('keydown', handleKey)
			window.removeEventListener('scroll', onClose, true)
		}
	}, [onClose])

	if (typeof document === 'undefined') {
		return null
	}

	return createPortal(
		<div
			ref={menuRef}
			role="menu"
			aria-orientation="vertical"
			className="fixed bg-surface-canvas border border-stroke rounded-md shadow-md p-1 min-w-40 z-50 animate-in fade-in zoom-in-95 duration-100"
			style={{ top: y, left: x }}
		>
			{items.map((item, i) => {
				if (item.divider) {
					return <hr key={i} className="my-1 border-stroke" />
				}

				return (
					<button
						key={i}
						role="menuitem"
						disabled={item.disabled}
						onClick={() => {
							item.onClick()
							onClose()
						}}
						className={`
                            w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-sm transition-colors
                            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-gray cursor-pointer'}
                            ${item.danger ? 'text-danger-500' : 'text-ink'}
                        `}
					>
						{item.icon && <span className="shrink-0 size-4 opacity-70">{item.icon}</span>}
						{item.label}
					</button>
				)
			})}
		</div>,
		document.body,
	)
}
