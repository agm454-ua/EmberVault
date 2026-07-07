import { useEffect, useReducer, useRef, useState } from 'react'
import { pdfjs } from 'react-pdf'
import BlurPage from './BlurPage'
import { useTranslation } from 'react-i18next'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type Props = {
	src: string | null
	name?: string
	onClose: () => void
}
type PdfState =
	| { status: 'idle'; zoomIndex: number }
	| { status: 'loading'; zoomIndex: number }
	| { status: 'error'; zoomIndex: number }
	| { status: 'ready'; zoomIndex: number; pdf: pdfjs.PDFDocumentProxy; numPages: number }

type PdfAction =
	| { type: 'load' }
	| { type: 'success'; pdf: pdfjs.PDFDocumentProxy; numPages: number }
	| { type: 'error' }
	| { type: 'zoom_in' }
	| { type: 'zoom_out' }
	| { type: 'zoom_reset' }

function pdfReducer(state: PdfState, action: PdfAction): PdfState {
	switch (action.type) {
		case 'load':
			return { ...state, status: 'loading', zoomIndex: DEFAULT_ZOOM_INDEX }
		case 'success':
			return { ...state, status: 'ready', pdf: action.pdf, numPages: action.numPages }
		case 'error':
			return { ...state, status: 'error' }
		case 'zoom_in':
			return { ...state, zoomIndex: Math.min(state.zoomIndex + 1, ZOOM_STEPS.length - 1) }
		case 'zoom_out':
			return { ...state, zoomIndex: Math.max(state.zoomIndex - 1, 0) }
		case 'zoom_reset':
			return { ...state, zoomIndex: DEFAULT_ZOOM_INDEX }
	}
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5]
const DEFAULT_ZOOM_INDEX = 2 // 1.0

export default function PdfPreviewModal({ src, name, onClose }: Props) {
	const { t } = useTranslation()

	const [pdfState, dispatch] = useReducer(pdfReducer, { status: 'idle', zoomIndex: DEFAULT_ZOOM_INDEX })
	const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)

	const [numPages, setNumPages] = useState(0)

	const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null)

	const scale = ZOOM_STEPS[zoomIndex]

	// Load document whenever src changes
	useEffect(() => {
		if (!src) return

		let cancelled = false
		let localPdf: pdfjs.PDFDocumentProxy | null = null

		dispatch({ type: 'load' })

		pdfjs.getDocument(src).promise.then(
			(pdf) => {
				if (cancelled) return
				localPdf = pdf
				setPdfDoc(pdf)
				setNumPages(pdf.numPages)
				dispatch({ type: 'success', pdf, numPages: pdf.numPages })
			},
			() => {
				if (!cancelled) dispatch({ type: 'error' })
			},
		)

		return () => {
			cancelled = true
			localPdf?.destroy()
		}
	}, [src])

	// Keyboard shortcuts
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			} else if ((e.metaKey || e.ctrlKey) && e.key === '=') {
				e.preventDefault()
				setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1))
			} else if ((e.metaKey || e.ctrlKey) && e.key === '-') {
				e.preventDefault()
				setZoomIndex((i) => Math.max(i - 1, 0))
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [onClose])

	const zoomIn = () => setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1))
	const zoomOut = () => setZoomIndex((i) => Math.max(i - 1, 0))
	const zoomReset = () => setZoomIndex(DEFAULT_ZOOM_INDEX)

	return (
		<BlurPage onClose={onClose}>
			<div
				className="flex flex-col rounded-xl overflow-hidden shadow-2xl bg-surface-base"
				style={{ width: 'min(92vw, 900px)', maxHeight: '92vh' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* ── Toolbar ── */}
				<div className="flex items-center justify-between px-3 py-2 border-b border-stroke-muted bg-surface-muted shrink-0 gap-2">
					{/* File name */}
					<div className="flex items-center gap-2 min-w-0 flex-1">
						<PdfFileIcon className="size-4 text-ink-muted shrink-0" />
						<span className="text-sm font-medium text-ink-base truncate" title={name}>
							{name ?? 'Document.pdf'}
						</span>
					</div>

					{/* Center controls */}
					<div className="flex items-center gap-1 shrink-0">
						<span className="text-xs text-ink-muted tabular-nums select-none px-2 text-center">
							{pdfState.status === 'ready'
								? `${numPages} ${numPages === 1 ? t('pdfPreview.page') : t('pdfPreview.pages')}`
								: '—'}
						</span>

						<Divider />

						{/* Zoom */}
						<IconBtn onClick={zoomOut} disabled={zoomIndex === 0} title={t('pdfPreview.zoomOut')}>
							<MinusIcon />
						</IconBtn>

						<button
							type="button"
							onClick={zoomReset}
							title={t('pdfPreview.resetZoom')}
							className="text-xs text-ink-muted tabular-nums w-10 text-center hover:text-ink-base transition-colors rounded px-1 py-0.5 hover:bg-surface-gray"
						>
							{Math.round(scale * 100)}%
						</button>

						<IconBtn
							onClick={zoomIn}
							disabled={zoomIndex === ZOOM_STEPS.length - 1}
							title={t('pdfPreview.zoomIn')}
						>
							<PlusIcon />
						</IconBtn>
					</div>

					{/* Right: close */}
					<div className="flex items-center justify-end flex-1">
						<IconBtn onClick={onClose} title={t('pdfPreview.close')}>
							<CloseIcon />
						</IconBtn>
					</div>
				</div>

				<div
					className="flex-1 overflow-auto bg-surface-gray flex flex-col items-center p-6 gap-6"
					style={{ minHeight: 0 }}
				>
					{pdfState.status === 'loading' && (
						<div className="flex flex-col items-center justify-center gap-3 text-ink-muted py-20 mt-auto mb-auto">
							<Spinner />
							<span className="text-sm">{t('nav.loading')}</span>
						</div>
					)}

					{pdfState.status === 'error' && (
						<div className="flex flex-col items-center justify-center gap-2 text-ink-muted py-20 mt-auto mb-auto">
							<WarningIcon className="size-8 text-red-400" />
							<span className="text-sm">{t('pdfPreview.loadError')}</span>
						</div>
					)}

					{pdfState.status === 'ready' &&
						pdfDoc &&
						Array.from({ length: pdfState.numPages }).map((_, i) => (
							<PdfPage key={i + 1} pdf={pdfDoc} pageNumber={i + 1} scale={scale} />
						))}
				</div>

				{/* ── Footer hint ── */}
				{pdfState.status === 'ready' && (
					<div className="shrink-0 flex items-center justify-center py-1.5 border-t border-stroke-muted bg-surface-muted">
						<span className="text-[11px] text-ink-subtle select-none">{t('pdfPreview.footerHint')}</span>
					</div>
				)}
			</div>
		</BlurPage>
	)
}

// Individual Page
function PdfPage({ pdf, pageNumber, scale }: { pdf: pdfjs.PDFDocumentProxy; pageNumber: number; scale: number }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const renderTaskRef = useRef<pdfjs.RenderTask | null>(null)

	useEffect(() => {
		let cancelled = false
		let task: pdfjs.RenderTask | null = null

		const render = async () => {
			const canvas = canvasRef.current
			if (!canvas) return

			renderTaskRef.current?.cancel()

			try {
				const page = await pdf.getPage(pageNumber)
				if (cancelled) return

				const viewport = page.getViewport({ scale })
				const ctx = canvas.getContext('2d')!

				const dpr = window.devicePixelRatio || 1
				canvas.width = viewport.width * dpr
				canvas.height = viewport.height * dpr
				canvas.style.width = `${viewport.width}px`
				canvas.style.height = `${viewport.height}px`
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

				task = page.render({ canvasContext: ctx, canvas, viewport })
				renderTaskRef.current = task

				await task.promise
			} catch (e: unknown) {
				if (e instanceof Error && e.name !== 'RenderingCancelledException') {
					console.error(`Error rendering page ${pageNumber}:`, e)
				}
			}
		}

		render()

		return () => {
			cancelled = true
			task?.cancel()
		}
	}, [pdf, pageNumber, scale])

	return (
		<canvas
			ref={canvasRef}
			className="rounded shadow-lg bg-white shrink-0 max-w-full"
			style={{ minHeight: '400px' }}
		/>
	)
}

// Buttons
function IconBtn({
	onClick,
	disabled,
	title,
	children,
}: {
	onClick: () => void
	disabled?: boolean
	title?: string
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className="p-1.5 rounded text-ink-muted hover:text-ink-base hover:bg-surface-gray disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
		>
			{children}
		</button>
	)
}

function Divider() {
	return <div className="w-px h-4 bg-stroke-muted mx-1" />
}

function Spinner() {
	return (
		<svg className="size-6 animate-spin text-ink-muted" viewBox="0 0 24 24" fill="none">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
		</svg>
	)
}

// Icons
function PdfFileIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
			/>
		</svg>
	)
}

function MinusIcon() {
	return (
		<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
		</svg>
	)
}

function PlusIcon() {
	return (
		<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
		</svg>
	)
}

function CloseIcon() {
	return (
		<svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	)
}

function WarningIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			/>
		</svg>
	)
}
