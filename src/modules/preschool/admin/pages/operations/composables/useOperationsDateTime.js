import { useLanguage } from '@/composables/useLanguage'

const DATE_TIME_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}

export function formatOperationsDateTime(value, locale = 'EN') {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const resolvedLocale = String(locale || '').toUpperCase() === 'KH' ? 'km-KH' : 'en-GB'

  return new Intl.DateTimeFormat(resolvedLocale, DATE_TIME_OPTIONS).format(date)
}

export function useOperationsDateTime() {
  const { language } = useLanguage()

  function formatDateTime(value) {
    return formatOperationsDateTime(value, language.value)
  }

  return {
    formatDateTime,
  }
}
