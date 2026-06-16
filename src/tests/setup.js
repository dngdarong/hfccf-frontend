import { afterEach } from 'vitest'

// jsdom does not implement matchMedia; stub it so PrimeVue Select's orientation
// listener doesn't throw during mount.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom persists localStorage/sessionStorage between tests in the same file.
// Clear both after every test to prevent cross-test state contamination.
afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
