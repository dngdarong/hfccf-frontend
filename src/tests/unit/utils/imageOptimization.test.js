import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { optimizeImageFile } from '@/utils/imageOptimization'

const originalCreateElement = document.createElement.bind(document)
const originalRequestAnimationFrame = window.requestAnimationFrame?.bind(window)
const originalCreateImageBitmap = globalThis.createImageBitmap

function makeFile({ size = 512 * 1024, type = 'image/jpeg', name = 'avatar.jpg' } = {}) {
  return new File([new Uint8Array(size)], name, { type })
}

function mockCanvas({ alpha = 255, blobSize = 96 * 1024 } = {}) {
  const ctx = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray([0, 0, 0, alpha]),
    })),
  }

  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    toBlob: vi.fn((callback, mimeType) => {
      callback(new Blob([new Uint8Array(blobSize)], { type: mimeType }))
    }),
  }

  vi.spyOn(document, 'createElement').mockImplementation((tagName, ...args) => {
    if (tagName === 'canvas') {
      return canvas
    }

    return originalCreateElement(tagName, ...args)
  })

  return { canvas, ctx }
}

describe('optimizeImageFile', () => {
  beforeEach(() => {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => {
        callback(0)
        return 1
      }
    }

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })

    globalThis.createImageBitmap = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalCreateImageBitmap) {
      globalThis.createImageBitmap = originalCreateImageBitmap
    } else {
      delete globalThis.createImageBitmap
    }

    if (originalRequestAnimationFrame) {
      window.requestAnimationFrame = originalRequestAnimationFrame
    }
  })

  it('returns the original tiny JPEG when no resize or compression is needed', async () => {
    globalThis.createImageBitmap.mockResolvedValueOnce({ width: 160, height: 160, close: vi.fn() })

    const file = makeFile({ size: 64 * 1024, type: 'image/jpeg', name: 'tiny-avatar.jpg' })
    const result = await optimizeImageFile(file)

    expect(result).toBe(file)
  })

  it('resizes and recompresses a large opaque JPEG file', async () => {
    globalThis.createImageBitmap.mockResolvedValueOnce({ width: 1200, height: 900, close: vi.fn() })
    mockCanvas({ alpha: 255, blobSize: 88 * 1024 })

    const file = makeFile({ size: 700 * 1024, type: 'image/jpeg', name: 'large-photo.jpg' })
    const result = await optimizeImageFile(file)

    expect(result).toBeInstanceOf(File)
    expect(result).not.toBe(file)
    expect(result.type).toBe('image/jpeg')
    expect(result.name).toBe('large-photo.jpg')
    expect(result.size).toBeLessThan(file.size)
  })

  it('preserves transparency by returning a PNG file', async () => {
    globalThis.createImageBitmap.mockResolvedValueOnce({ width: 900, height: 900, close: vi.fn() })
    mockCanvas({ alpha: 0, blobSize: 104 * 1024 })

    const file = makeFile({ size: 900 * 1024, type: 'image/png', name: 'transparent-logo.png' })
    const result = await optimizeImageFile(file)

    expect(result).toBeInstanceOf(File)
    expect(result.type).toBe('image/png')
    expect(result.name).toBe('transparent-logo.png')
  })

  it('returns GIF files unchanged', async () => {
    const file = makeFile({ size: 400 * 1024, type: 'image/gif', name: 'animated.gif' })
    const result = await optimizeImageFile(file)

    expect(result).toBe(file)
    expect(globalThis.createImageBitmap).not.toHaveBeenCalled()
  })
})
