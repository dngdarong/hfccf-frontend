import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { applyDocumentLocale } from '@/utils/documentLocale'

export function useNavbarLocale() {
  const { t, locale } = useI18n()

  const currentLocale = computed({
    get: () => locale.value,
    set: (value) => {
      const next = value === 'kh' ? 'kh' : 'en'

      locale.value = next
      localStorage.setItem('locale', next)
      applyDocumentLocale(next)
    },
  })

  const isKh = computed(() => locale.value === 'kh')

  const calendarLabel = computed(() => t('common.navigation.calendar'))

  const localeOptions = computed(() => [
    {
      label: t('common.navigation.languages.english'),
      value: 'en',
    },
    {
      label: t('common.navigation.languages.khmer'),
      value: 'kh',
    },
  ])

  return {
    t,
    currentLocale,
    isKh,
    calendarLabel,
    localeOptions,
  }
}
