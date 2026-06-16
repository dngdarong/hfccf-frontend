import { MM_TO_PX_RATIO, IMG_QUALITY } from '../constants/attendanceIdCardConstants'

export function getInitials(student: any): string {
  return (student.fullName || student.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || '?'
}

export function getAcademicYear(): string {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

export function resolveBackendUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || url.startsWith('//')) return url
  const base = String(import.meta.env.VITE_API_BASE_URL || window.location.origin)
  try {
    return new URL(url, base).href
  } catch {
    return url
  }
}

export function resolveFetchablePhotoUrl(avatarUrl: string, publicImageOrigin: string): string {
  const url = resolveBackendUrl(avatarUrl)
  if (!url) return ''

  try {
    const parsed = new URL(url, window.location.origin)
    const imageOrigin = publicImageOrigin ? new URL(publicImageOrigin, window.location.origin).origin : ''

    if (imageOrigin && parsed.origin === imageOrigin) {
      return `/__image-proxy${parsed.pathname}${parsed.search}`
    }
  } catch {
    return url
  }

  return url
}

export async function loadStudentPhotoAsImg(avatarUrl: string, publicImageOrigin: string) {
  const url = resolveFetchablePhotoUrl(avatarUrl, publicImageOrigin)
  if (!url) throw new Error('empty url')

  const isProxyRequest = url.startsWith('/__image-proxy')
  const token = isProxyRequest
    ? ''
    : window.localStorage.getItem('hfccf-auth-token') || window.sessionStorage.getItem('hfccf-auth-token') || ''

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ img, objectUrl })
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('img load'))
    }
    img.src = objectUrl
  })
}

export function imgToDataUrl(img: HTMLImageElement): string {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth || 200
  c.height = img.naturalHeight || 200
  c.getContext('2d')?.drawImage(img, 0, 0)
  return c.toDataURL('image/jpeg', IMG_QUALITY)
}

export async function waitForFonts(): Promise<void> {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      // Ignore font-loading failures and continue with the rendered fallback.
    }
  }
}

export function calculateExportWidth(cardWidth: number): number {
  return Math.round(cardWidth * MM_TO_PX_RATIO)
}

export function calculateGapPixels(gapMm: number): number {
  return Math.round(Math.max(0, Number(gapMm) || 0) * MM_TO_PX_RATIO)
}

export function sanitizeFileName(className: string): string {
  return className.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'students'
}

export function normalizeClassOptions(classes: any[]) {
  return classes.map((c) => ({
    label: c.name || c.code || String(c.id),
    value: c.id,
    level: c.level || '',
  }))
}

export function filterSelectedStudents(allStudents: any[], selectedIds: string[]): any[] {
  return allStudents.filter((s) => selectedIds.includes(s.id))
}

export function getClassInfo(classOptions: any[], selectedClassId: string) {
  const classObj = classOptions.find((c) => c.value === selectedClassId)
  return {
    name: classObj?.label || '',
    level: classObj?.level || '',
  }
}

export function getCurrentCardSize(cardSizes: any[], selectedSize: string, orientation: string) {
  const size = cardSizes.find((s) => s.value === selectedSize) || cardSizes[1]
  return size[orientation]
}
