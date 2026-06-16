import './assets/css/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import { startAutoLogoutWatcher } from './services/auth'
import HopePreset from './theme/primevuePreset'

function enforceSecureOrigin() {
  if (typeof window === 'undefined') return
  if (import.meta.env.DEV) return
  if (window.location.protocol === 'https:') return

  const hostname = window.location.hostname
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local')

  if (isLocal) return

  const secureUrl = `https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`
  window.location.replace(secureUrl)
}

enforceSecureOrigin()

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: HopePreset,
    options: {
      // This app only defines a light token set. Disabling PrimeVue dark-mode
      // switching prevents components from falling back to dark surfaces/text.
      darkModeSelector: false,
      // Keep PrimeVue theme styles inside a dedicated cascade layer so
      // Tailwind utilities and local component styles can override them predictably.
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue, components, utilities',
      },
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)
app.use(i18n)
app.use(router)

app.mount('#app')

const stopAutoLogoutWatcher = startAutoLogoutWatcher({
  onExpire: () => {
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  },
})

window.addEventListener(
  'beforeunload',
  () => {
    stopAutoLogoutWatcher()
  },
  { once: true },
)
