import axios from 'axios'

const AUTH_TOKEN_STORAGE_KEY = 'hfccf-auth-token'
const AUTH_USER_STORAGE_KEY = 'hfccf-auth-user'
const LAST_ACTIVITY_STORAGE_KEY = 'hfccf-last-activity-at'

function isBrowser() {
  return typeof window !== 'undefined'
}

function isLocalHostname(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test')
  )
}

function assertSafeHttpUrl(rawUrl, fallbackOrigin = isBrowser() ? window.location.origin : 'http://localhost') {
  const parsedUrl = new URL(String(rawUrl || '').trim(), fallbackOrigin)

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed.')
  }

  return parsedUrl
}

function getValidatedApiBaseUrl() {
  const rawBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim()

  if (!rawBaseUrl) return ''

  const parsedUrl = assertSafeHttpUrl(rawBaseUrl)
  const isSecureOrigin = parsedUrl.protocol === 'https:' || isLocalHostname(parsedUrl.hostname)

  if (!isSecureOrigin && !import.meta.env.DEV) {
    throw new Error('VITE_API_BASE_URL must use HTTPS outside local development.')
  }

  return parsedUrl.toString().replace(/\/$/, '')
}

function getAuthToken() {
  if (!isBrowser()) return ''

  return (
    window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    ''
  )
}

function clearAuthStorage() {
  if (!isBrowser()) return

  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    storage.removeItem(AUTH_USER_STORAGE_KEY)
    storage.removeItem(LAST_ACTIVITY_STORAGE_KEY)
  }
}

function getDefaultErrorMessage(status) {
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'The requested resource was not found.'
  if (status === 422) return 'The submitted data has validation errors.'
  if (status === 429) return 'Too many requests. Please try again later.'
  if (status >= 500) return 'The server is temporarily unavailable. Please try again later.'
  return 'An unexpected error occurred.'
}

function extractValidationErrors(payload) {
  const errors = payload?.errors

  if (!errors) return null
  if (Array.isArray(errors)) return errors
  if (typeof errors === 'object') return errors

  return null
}

function normalizeHttpError(error) {
  const response = error?.response || null
  const status = Number(response?.status || 0)
  const backendMessage = response?.data?.message || response?.data?.error
  const message = backendMessage || getDefaultErrorMessage(status)
  const normalized = new Error(message, {
    cause: error,
  })

  normalized.name = 'HttpError'
  normalized.code = response
    ? ({
        401: 'UNAUTHENTICATED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        422: 'VALIDATION_ERROR',
        429: 'RATE_LIMITED',
      }[status] || (status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR'))
    : 'NETWORK_ERROR'
  normalized.status = status
  normalized.response = response
  normalized.request = error?.request || null
  normalized.config = error?.config || null
  normalized.isNetworkError = !response
  normalized.validationErrors = status === 422 ? extractValidationErrors(response?.data) : null
  normalized.details = response?.data ?? null

  return normalized
}

const apiBaseUrl = getValidatedApiBaseUrl()
const apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : ''

const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
})

http.interceptors.request.use((config) => {
  const fallbackOrigin = config.baseURL || apiBaseUrl || (isBrowser() ? window.location.origin : 'http://localhost')
  const requestUrl = assertSafeHttpUrl(config.url || '', fallbackOrigin)
  const currentOrigin = isBrowser() ? window.location.origin : ''
  const isSameOrigin = currentOrigin ? requestUrl.origin === currentOrigin : false
  const isTrustedApiOrigin = apiOrigin ? requestUrl.origin === apiOrigin : isSameOrigin

  config.headers = config.headers || {}
  config.headers['X-Requested-With'] = 'XMLHttpRequest'

  if (isSameOrigin || isTrustedApiOrigin) {
    const token = getAuthToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage()
    }

    return Promise.reject(normalizeHttpError(error))
  },
)

export default http
