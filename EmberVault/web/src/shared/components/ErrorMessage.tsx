import AlertIcon from '../icons/AlertIcon'

export default function ErrorMessage({ text = 'Error' }: { text: string }) {
	return (
		<div className="flex gap-2 w-full bg-danger-50 border border-danger-500 rounded-md px-4 py-1 my-2">
			<AlertIcon className="text-danger-500 w-4" />
			<p className="text-danger-500">{text}</p>
		</div>
	)
}
