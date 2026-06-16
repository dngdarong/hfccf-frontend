import { createI18n } from 'vue-i18n'
import { watch } from 'vue'

import enMessages from './en'
import khMessages from './kh'
import { applyDocumentLocale, normalizeLocale } from '@/utils/documentLocale'

const savedLocale = localStorage.getItem('locale')
const locale = normalizeLocale(savedLocale)

const messages = {
  en: enMessages,
  kh: khMessages,
}

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages,
})

applyDocumentLocale(locale)

watch(
  () => i18n.global.locale.value,
  (next) => applyDocumentLocale(next),
  { immediate: true },
)

export default i18n
