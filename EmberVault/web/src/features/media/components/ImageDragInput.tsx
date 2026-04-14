import UploadImageIcon from '@/shared/icons/UploadImageIcon'
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface ImageDragInputProps {
	label?: string
	onImageSelect?: (file: File) => void
}

export function ImageDragInput({ label, onImageSelect }: ImageDragInputProps) {
	const { t } = useTranslation()
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0]
			// Basic validation to ensure it's an image
			if (file.type.startsWith('image/')) {
				onImageSelect?.(file)
			}
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]
			onImageSelect?.(file)
		}
	}

	return (
		<div className="w-full flex flex-col gap-1">
			{label && <label className="text-sm text-ink pl-0.5">{label}</label>}

			{/* Drag & Drop Zone */}
			<div
				className={`relative w-full py-6 border-2 border-dashed rounded-lg flex flex-col gap-2 items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out group
                ${isDragging ? 'border-stroke-focus bg-surface' : 'border-stroke hover:border-stroke-focus hover:bg-surface'}
                `}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
			>
				{/* Hidden File Input */}
				<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

				<UploadImageIcon className={`text-stroke group-hover:text-stroke-focus transition-colors duration-200 ${isDragging ? 'text-stroke-focus' : ''}`} />

				{/* Text */}
				<span className={`text-sm text-stroke group-hover:text-stroke-focus transition-colors duration-200${isDragging ? 'text-stroke-focus' : ''}`}>
					{t('media.dragAndDropImage')}
				</span>
			</div>
		</div>
	)
}

export default ImageDragInput
