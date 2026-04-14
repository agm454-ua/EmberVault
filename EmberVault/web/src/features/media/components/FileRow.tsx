import { formatDate } from '@/shared/utils/dateConversor'
import type { TResourceResponse } from '../types/resources'
import getResourceIcon from '../utils/getResourceIcon'
import OptionsIcon from '@/shared/icons/OptionsIcon'

export default function FileRow({ resource }: { resource: TResourceResponse }) {
	const modificationDate = resource.updatedAt?.toString() ?? resource.createdAt.toString()

	const icon = getResourceIcon({ resource })

	return (
		<tr className="border-b border-stroke-muted h-12 text-sm text-ink-muted hover:bg-surface-muted cursor-pointer">
			<td>
				<div className="flex min-w-0 gap-2 items-center pl-4">
					{icon}
					<span className="truncate">{resource.name}</span>
				</div>
			</td>
			<td className="text-center">{resource.owner}</td>
			<td className="text-center">{formatDate(modificationDate)}</td>
			<td className="text-center">{resource.size}</td>
			<td className="flex items-center justify-center h-12"><OptionsIcon className='w-4 h-4' /></td>
		</tr>
	)
}
