import { createApp, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import PrimeVue from 'primevue/config'

/**
 * Creates a minimal i18n instance for tests.
 *
 * Accepts either:
 *   createTestI18n({ common: { ... } })         → treats as English messages
 *   createTestI18n({ en: { ... }, kh: { ... } }) → uses both locales
 */
export function createTestI18n(messages) {
  const hasLocaleKeys =
    messages && typeof messages === 'object' && ('en' in messages || 'kh' in messages)

  const en = hasLocaleKeys ? (messages.en ?? {}) : (messages ?? {})
  const kh = hasLocaleKeys ? (messages.kh ?? {}) : {}

  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en, kh },
    missingWarn: false,
    fallbackWarn: false,
  })
}

/**
 * Creates a minimal router for component tests.
 * Accepts an array of route definitions to register alongside a catch-all root.
 */
export function createTestRouter(routes = []) {
  return createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }, ...routes],
  })
}

/**
 * Stubs for PrimeVue components used in unit tests.
 * The Tag stub exposes :data-status-label so tests can assert on the resolved label.
 */
const defaultStubs = {
  Tag: {
    name: 'Tag',
    inheritAttrs: false,
    props: ['value', 'pt'],
    template:
      '<span v-bind="$attrs" :data-status-label="value"><slot name="icon" /><slot /></span>',
  },
  Select: { name: 'Select', props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'disabled', 'loading'], template: '<select v-bind="$attrs"><slot /></select>' },
  DatePicker: { name: 'DatePicker', props: ['modelValue', 'placeholder', 'disabled', 'showTime', 'showIcon'], template: '<input v-bind="$attrs" type="text" />' },
  ToggleSwitch: { name: 'ToggleSwitch', props: ['modelValue', 'disabled'], template: '<input v-bind="$attrs" type="checkbox" />' },
}

/**
 * Mount a component with i18n, Pinia, and Vue Router pre-installed.
 *
 * Options:
 *   messages    - i18n message object (passed to createTestI18n)
 *   routes      - extra router routes
 *   piniaSetup  - fn(pinia) called after pinia is created (use to pre-populate stores)
 *   global      - extra global mount options (stubs, etc.)
 *   ...rest     - forwarded to @vue/test-utils mount()
 */
export function mountWithPlugins(component, options = {}) {
  const { messages, routes, piniaSetup, global: globalOptions = {}, ...mountOptions } = options
  const { stubs: extraStubs = {}, ...restGlobal } = globalOptions

  const i18n = createTestI18n(messages)
  const pinia = createPinia()
  const router = createTestRouter(routes)

  if (typeof piniaSetup === 'function') {
    piniaSetup(pinia)
  }

  return mount(component, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: { ...defaultStubs, ...extraStubs },
      ...restGlobal,
    },
    ...mountOptions,
  })
}

/**
 * Run a composable that requires Vue plugin context (e.g. useI18n, useRouter).
 * Returns whatever the composable returns.
 *
 * Usage:
 *   const { language } = withI18nSetup(() => useLanguage(), { en: { ... } })
 */
export function withI18nSetup(composable, messages) {
  let result
  const i18n = createTestI18n(messages)
  const app = createApp({
    setup() {
      result = composable()
      return () => h('div')
    },
  })
  app.use(i18n)
  app.mount(document.createElement('div'))
  return result
}
