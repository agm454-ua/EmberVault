import CheckIcon from '../icons/CheckIcon'

export default function SuccessMessage({ text = 'Success' }: { text: string }) {
	return (
		<div className="flex gap-2 w-full bg-success-50 border border-success-500 rounded-md px-4 py-1 my-2">
			<CheckIcon className="text-success-500 w-4" />
			<p className="text-success-500">{text}</p>
		</div>
	)
}
