const DEFAULT_MAX_WIDTH = 512
const DEFAULT_MAX_HEIGHT = 512
const DEFAULT_QUALITY = 0.84
const DEFAULT_MIN_SIZE_BYTES = 128 * 1024

const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const LOSSLESS_TYPES = new Set(['image/png'])
const PRESERVE_TYPES = new Set(['image/gif'])

function isBrowserFile(file: any): file is File {
  return typeof File !== 'undefined' && file instanceof File
}

function isCompressibleType(type: string): boolean {
  return COMPRESSIBLE_TYPES.has(String(type || '').trim().toLowerCase())
}

function getMimeTypeForOutput(fileType: string, hasTransparency: boolean): string {
  if (hasTransparency) return 'image/png'
  if (LOSSLESS_TYPES.has(String(fileType || '').trim().toLowerCase())) {
    return 'image/jpeg'
  }

  return 'image/jpeg'
}

function getOutputExtension(mimeType: string): string {
  switch (String(mimeType || '').trim().toLowerCase()) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

function normalizeBaseName(name: string): string {
  const source = String(name || '').trim()

  if (!source) return 'image'

  const withoutExtension = source.replace(/\.[^.]+$/, '')
  return withoutExtension || 'image'
}

function buildOutputFileName(file: File, mimeType: string): string {
  const baseName = normalizeBaseName(file?.name)
  const extension = getOutputExtension(mimeType)

  return `${baseName}.${extension}`
}

function getTargetDimensions(width: number, height: number, maxWidth: number, maxHeight: number) {
  const safeWidth = Math.max(Number(width) || 0, 1)
  const safeHeight = Math.max(Number(height) || 0, 1)
  const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight, 1)

  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
    scaled: scale < 1,
  }
}

function waitForFrame(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => resolve())
      return
    }

    window.setTimeout(resolve, 0)
  })
}

function loadImageElement(file: File): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => resolve({ image, objectUrl })
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to load image file.'))
    }
    image.src = objectUrl
  })
}

async function loadImageSource(file: File) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        source: bitmap,
        width: Number(bitmap?.width) || 0,
        height: Number(bitmap?.height) || 0,
        cleanup: () => bitmap?.close?.(),
      }
    } catch {
      // Fall back to an <img> element when createImageBitmap is unavailable or fails.
    }
  }

  const { image, objectUrl } = await loadImageElement(file)

  return {
    source: image,
    width: Number(image?.naturalWidth || image?.width) || 0,
    height: Number(image?.naturalHeight || image?.height) || 0,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  }
}

function createCanvasContext(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context is not available.')
  }

  return { canvas, ctx }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number | undefined): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality)
  })
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const sampleWidth = Math.max(1, Math.min(width, 64))
    const sampleHeight = Math.max(1, Math.min(height, 64))
    const pixels = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data
    const step = Math.max(4, Math.floor(pixels.length / 256))

    for (let index = 3; index < pixels.length; index += step) {
      if (pixels[index] < 255) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}

function shouldSkipOptimization(file: File, dimensions: any, { maxWidth, maxHeight, minSizeToCompress }: any): boolean {
  if (!isBrowserFile(file)) return true
  if (!isCompressibleType(file.type)) return true

  const isWithinSizeLimit = Number(file.size) > 0 && Number(file.size) <= minSizeToCompress
  const isWithinDimensionLimit =
    Number(dimensions?.width) <= maxWidth && Number(dimensions?.height) <= maxHeight

  return isWithinSizeLimit && isWithinDimensionLimit
}

/**
 * Compress and resize an image file on the client before upload.
 * Returns the original file when compression is not needed or fails.
 */
export async function optimizeImageFile(file: any, options: any = {}): Promise<File | Blob> {
  if (!isBrowserFile(file)) {
    return file
  }

  if (PRESERVE_TYPES.has(String(file.type || '').trim().toLowerCase())) {
    return file
  }

  const settings = {
    maxWidth: DEFAULT_MAX_WIDTH,
    maxHeight: DEFAULT_MAX_HEIGHT,
    quality: DEFAULT_QUALITY,
    minSizeToCompress: DEFAULT_MIN_SIZE_BYTES,
    ...options,
  }

  try {
    await waitForFrame()

    const image = await loadImageSource(file)
    const dimensions = getTargetDimensions(
      image.width,
      image.height,
      Number(settings.maxWidth) || DEFAULT_MAX_WIDTH,
      Number(settings.maxHeight) || DEFAULT_MAX_HEIGHT,
    )

    try {
      if (shouldSkipOptimization(file, image, settings)) {
        return file
      }

      const { canvas, ctx } = createCanvasContext(dimensions.width, dimensions.height)
      ctx.drawImage(image.source, 0, 0, dimensions.width, dimensions.height)

      const outputMimeType = getMimeTypeForOutput(
        file.type,
        hasTransparency(ctx, dimensions.width, dimensions.height),
      )
      const quality =
        outputMimeType === 'image/png' ? undefined : Number(settings.quality) || DEFAULT_QUALITY
      const blob = await canvasToBlob(canvas, outputMimeType, quality)

      if (!blob) {
        return file
      }

      if (!dimensions.scaled && blob.size >= file.size) {
        return file
      }

      return new File([blob], buildOutputFileName(file, blob.type || outputMimeType), {
        type: blob.type || outputMimeType,
        lastModified: file.lastModified || Date.now(),
      })
    } finally {
      image.cleanup?.()
    }
  } catch {
    return file
  }
}

export function isOptimizableImageFile(file: any): boolean {
  return isBrowserFile(file) && !PRESERVE_TYPES.has(String(file.type || '').trim().toLowerCase()) && isCompressibleType(file.type)
}
