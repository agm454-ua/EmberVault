import type { ReactNode } from 'react'
import type { TResourceResponse } from '../types/resources'
import { FileTypeExtensions } from '@/core/config/constants'
import FolderIcon from '../icons/FolderIcon'
import getFileExtension from './getFileExtension'
import ImageFileIcon from '../icons/ImageFileIcon'
import VideoFileIcon from '../icons/VideoFileIcon'
import DocFileIcon from '../icons/DocFileIcon'
import SpreadsheetFileIcon from '../icons/SpreadsheetFileIcon'
import PdfFileIcon from '../icons/PdfFileIcon'
import PresentationFileIcon from '../icons/PresentationFileIcon'
import ArchiveFileIcon from '../icons/ArchiveFileIcon'
import AudioFileIcon from '../icons/AudioFileIcon'
import TextFileIcon from '../icons/TextFileIcon'
import CodeFileIcon from '../icons/CodeFileIcon'
import ExecutableFileIcon from '../icons/ExecutableFileIcon'
import FileIcon from '../icons/FileIcon'
import BookFileIcon from '../icons/BookFileIcon'

export const ResourceIconDict = {
	image: <ImageFileIcon />,
	video: <VideoFileIcon />,
	document: <DocFileIcon />,
	spreadsheet: <SpreadsheetFileIcon />,
	pdf: <PdfFileIcon />,
	presentation: <PresentationFileIcon />,
	audio: <AudioFileIcon />,
	archive: <ArchiveFileIcon />,
	text: <TextFileIcon />,
	code: <CodeFileIcon />,
	executable: <ExecutableFileIcon />,
	book: <BookFileIcon />,
	default: <FileIcon />,
}

type ResourceIconKey = keyof typeof ResourceIconDict

export function getCategoryByExtension(extension: string): ResourceIconKey | undefined {
	// clean input
	const cleanExt = extension.replace('.', '').toLowerCase()
	const entry = Object.entries(FileTypeExtensions).find(([, extensions]) => extensions.includes(cleanExt))
	if (!entry) return undefined
	const key = entry[0]
	return key in ResourceIconDict ? (key as ResourceIconKey) : undefined
}

export default function getResourceIcon({ resource }: { resource: TResourceResponse }): ReactNode {
	if (resource.type === 'FOLDER') {
		return <FolderIcon />
	}
	if (resource.type === 'FILE') {
		const extension = getFileExtension(resource.name)
		if (extension) {
			const category = getCategoryByExtension(extension)
			if (category) {
				return ResourceIconDict[category]
			}
		}
		return ResourceIconDict['default']
	}
	return null
}
