import type { TResourceResponse } from '@/api/media/media.types'

const typeOrder: Record<string, number> = {
	FOLDER: 0,
	FILE: 1,
}

export default function sortResources(resources: TResourceResponse[]): TResourceResponse[] {
	const sorted = resources.sort((a, b) => {
		const typeDiff = typeOrder[a.type] - typeOrder[b.type]
		if (typeDiff !== 0) return typeDiff

		return a.name.localeCompare(b.name)
	})

	return sorted
}
