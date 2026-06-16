export function normalizeLocale(value) {
  return String(value || '').toLowerCase() === 'kh' ? 'kh' : 'en'
}

export function applyDocumentLocale(value) {
  if (typeof document === 'undefined') return

  const next = normalizeLocale(value)
  const root = document.documentElement

  root.lang = next
  root.classList.toggle('locale-kh', next === 'kh')
}
