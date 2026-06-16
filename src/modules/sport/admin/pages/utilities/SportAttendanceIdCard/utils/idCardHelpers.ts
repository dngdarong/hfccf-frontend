export function getInitials(player: any): string {
  return (player.fullName || player.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'
}

export function getSeasonYear(): string {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

export async function loadStudentPhoto(avatarUrl: string): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  if (!avatarUrl) throw new Error('no url')
  const res = await fetch(avatarUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('hfccf-auth-token') || sessionStorage.getItem('hfccf-auth-token') || ''}`,
    },
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
  return c.toDataURL('image/jpeg', 0.85)
}

export function getCardDimensions(cardSizes: any[], selectedSize: string, orientation: string) {
  const sizeConfig = cardSizes.find((s) => s.value === selectedSize) || cardSizes[1]
  return sizeConfig[orientation]
}

export function calculatePixelDimensions(cardWidthMm: number, cardHeightMm: number, gapMm: number) {
  const exportWidthPx = Math.round(cardWidthMm * (300 / 25.4))
  const gapPx = Math.round(Math.max(0, gapMm) * (300 / 25.4))
  return { exportWidthPx, gapPx }
}

export function logGenerationProgress(chosen: any[], format: string, orientation: string, size: string) {
  console.log('ID card generation:', {
    players: chosen.length,
    format,
    orientation,
    size,
  })
}

export function logCacheStatus(photoDataUrlCache: Map<string, string>, qrDataCache: Map<string, string>) {
  console.log('Photo cache:', photoDataUrlCache.size, 'QR cache:', qrDataCache.size)
}
