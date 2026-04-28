import BlurPage from './BlurPage'
import Button from './Button'

type ConfirmationOverlayProps = {
	isOpen: boolean
	message: string
	confirmLabel: string
	cancelLabel: string
	isPending?: boolean
	onConfirm: () => void
	onCancel: () => void
}

export default function ConfirmationOverlay({
	isOpen,
	message,
	confirmLabel,
	cancelLabel,
	isPending = false,
	onConfirm,
	onCancel,
}: ConfirmationOverlayProps) {
	if (!isOpen) {
		return null
	}

	return (
		<BlurPage onClose={onCancel}>
			<div className="bg-surface-canvas w-fit h-fit rounded-xl border-2 border-danger-50 flex flex-col items-center justify-center gap-4 p-6">
				<p className="text-sm text-ink text-center">{message}</p>
				<div className="flex gap-2">
					<Button variant="ghost" type="button" disabled={isPending} onClick={onCancel}>
						{cancelLabel}
					</Button>
					<Button variant="danger" type="button" disabled={isPending} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</BlurPage>
	)
}
