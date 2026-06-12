import { useTranslation } from 'react-i18next'

export default function UsedSpaceBar({ usedGB, limitGB }: { usedGB: number; limitGB: number }) {
	const { t } = useTranslation()
	const used = Number(usedGB) || 0
	const limit = Number(limitGB) || 1 // avoid division by zero

	return (
		<div className="flex flex-col w-full px-4 gap-2">
			<p className="text-sm text-ink font-semibold">{t('storage.storage')}</p>
			<div className="w-full h-3 bg-stroke-muted rounded-full overflow-hidden">
				<div className="h-full bg-primary-500" style={{ width: `${Math.min((used / limit) * 100, 100)}%` }} />
			</div>
			<p className="text-xs text-ink">{t('storage.storageUsed', { used, limit })}</p>
		</div>
	)
}
