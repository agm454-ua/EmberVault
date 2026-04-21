import Button from '@/shared/components/Button'
import UploadImageIcon from '@/shared/icons/UploadImageIcon'
import { useState, useRef, useMemo, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface ImageDragInputProps {
	label?: string
	onImageSelect?: (file: File) => void
}

export function ImageDragInput({ label, onImageSelect }: ImageDragInputProps) {
	const { t } = useTranslation()
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [image, setImage] = useState<File | null>(null)

	const preview = useMemo(() => {
		if (!image) return null
		return URL.createObjectURL(image)
	}, [image])

	const handleFile = (file: File) => {
		if (file.type.startsWith('image/')) {
			setImage(file)
			onImageSelect?.(file)
		}
	}

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)

		if (e.dataTransfer.files?.[0]) {
			handleFile(e.dataTransfer.files[0])
		}
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			handleFile(e.target.files[0])
		}
	}

	return (
		<div className="w-full flex flex-col gap-1">
			{label && <label className="text-sm text-ink pl-0.5">{label}</label>}

			<div
				className={`relative w-full py-6 border-2 border-dashed rounded-lg flex flex-col gap-2 items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out group
				${isDragging ? 'border-stroke-focus bg-surface' : 'border-stroke hover:border-stroke-focus hover:bg-surface'}
				`}
				onDragOver={(e) => {
					e.preventDefault()
					setIsDragging(true)
				}}
				onDragLeave={(e) => {
					e.preventDefault()
					setIsDragging(false)
				}}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

				{preview ? (
					<div className="relative">
						<img src={preview} alt="Preview" className="max-h-40 object-contain rounded-md" />
						<Button
							variant="ghost"
							className="absolute top-2 right-2 p-1"
							onClick={(e) => {
								e.stopPropagation()
								setImage(null)
							}}
							round
						>
							✕
						</Button>
					</div>
				) : (
					<>
						<UploadImageIcon className="text-stroke group-hover:text-stroke-focus transition-colors duration-200" />
						<span className="text-sm text-stroke group-hover:text-stroke-focus transition-colors duration-200">
							{t('media.dragAndDropImage')}
						</span>
					</>
				)}
			</div>
		</div>
	)
}

export default ImageDragInput
