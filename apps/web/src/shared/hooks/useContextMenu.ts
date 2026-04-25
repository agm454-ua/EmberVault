import { useCallback, useState } from 'react'
import type { MouseEvent } from 'react'

export function useContextMenu() {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })

	const open = useCallback((x: number, y: number) => {
		setPosition({ x, y })
		setIsOpen(true)
	}, [])

	const close = useCallback(() => setIsOpen(false), [])

	const bind = useCallback(
		<T extends Element>() => ({
			onContextMenu: (e: MouseEvent<T>) => {
				e.preventDefault()
				open(e.clientX, e.clientY)
			},
		}),
		[open],
	)

	const staticBind = useCallback(
		<T extends Element>() => ({
			onContextMenu: (e: MouseEvent<T>) => {
				e.preventDefault()
				const rect = e.currentTarget.getBoundingClientRect()

				open(rect.left, rect.bottom)
			},
		}),
		[open],
	)

	return { isOpen, position, open, close, bind, staticBind }
}
