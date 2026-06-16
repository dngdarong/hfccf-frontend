function getOriginFromValue(value) {
  const rawValue = String(value || '').trim()

  if (!rawValue) return ''

  try {
    return new URL(rawValue, 'http://localhost').origin
  } catch {
    return ''
  }
}

export function getApiBaseOrigin(env = {}) {
  return getOriginFromValue(env.VITE_API_BASE_URL)
}

export function getImagePublicOrigin(env = {}) {
  return getOriginFromValue(env.VITE_IMAGE_PUBLIC_ORIGIN || env.VITE_IMAGE_PUBLIC_URL)
}

function pushUnique(list, value) {
  if (value && !list.includes(value)) {
    list.push(value)
  }
}

export function createContentSecurityPolicy({
  isDev,
  apiBaseOrigin,
  imagePublicOrigin,
} = {}) {
  const connectSources = ["'self'"]
  const imgSources = ["'self'", 'data:', 'blob:']

  if (isDev) {
    connectSources.push('ws:', 'wss:', 'http:', 'https:')
    pushUnique(imgSources, 'http://hfccf-backend.test')
    pushUnique(imgSources, 'http://localhost')
    pushUnique(imgSources, 'http://127.0.0.1')
  } else {
    connectSources.push('https:')
  }

  if (apiBaseOrigin && (isDev || apiBaseOrigin.startsWith('https://'))) {
    pushUnique(imgSources, apiBaseOrigin)
  }

  if (imagePublicOrigin) {
    pushUnique(imgSources, imagePublicOrigin)
  }

  const scriptSources = ["'self'"]

  if (isDev) {
    scriptSources.push("'unsafe-eval'")
  }

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `img-src ${imgSources.join(' ')}`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `script-src ${scriptSources.join(' ')}`,
    `connect-src ${connectSources.join(' ')}`,
  ]

  if (!isDev) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

export function createSecurityHeaders({
  isDev,
  apiBaseOrigin,
  imagePublicOrigin,
} = {}) {
  return {
    'Content-Security-Policy': createContentSecurityPolicy({
      isDev,
      apiBaseOrigin,
      imagePublicOrigin,
    }),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  }
}
