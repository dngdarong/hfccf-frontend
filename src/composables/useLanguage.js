import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { t, te, tm, locale } = useI18n()

  const language = computed({
    get: () => (locale.value === 'kh' ? 'KH' : 'EN'),
    set: (value) => {
      const next = String(value || '').toUpperCase() === 'KH' ? 'kh' : 'en'
      locale.value = next
      localStorage.setItem('locale', next)
    },
  })

  return {
    t,
    te,
    tm,
    language,
  }
}
