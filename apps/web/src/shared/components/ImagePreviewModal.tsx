import BlurPage from "./BlurPage";

export default function ImagePreviewModal({ src, onClose }: { src: string | null; onClose: () => void }) {
    return (
        <BlurPage onClose={onClose}>
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
                <img
                    src={src ?? ''}
                    alt="Preview"
                    className="max-w-[80vw] max-h-[70vh] w-auto h-auto object-contain rounded"
                />
            </div>
        </BlurPage>
    )
}