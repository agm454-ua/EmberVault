import AlertIcon from '../icons/AlertIcon'

export default function WarningMessage({ text = 'Warning' }: { text: string }) {
	return (
		<div className="flex gap-2 w-full bg-warning-50 border border-warning-500 rounded-md px-4 py-1 my-2">
			<AlertIcon className="text-warning-500 w-4 shrink-0" />
			<p className="text-warning-500">{text}</p>
		</div>
	)
}
