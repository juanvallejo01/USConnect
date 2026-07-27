/**
 * Downscales and re-encodes an image file as a JPEG data URL.
 *
 * Raw camera/gallery photos can be several MB; base64-encoding them (~33% size
 * inflation) and storing several per user quickly exceeds localStorage/backend
 * payload limits. Compressing client-side before upload keeps each photo in the
 * ~100-300KB range regardless of the original file size.
 */
export function compressImageToDataUrl(
  file: File,
  { maxDimension = 1080, quality = 0.75 }: { maxDimension?: number; quality?: number } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }

    img.src = objectUrl
  })
}
