import http from '@/services/http'
import { mapUser } from '@/services/mappers/userMapper'
import { getApiErrorMessage, unwrapApiData } from '@/services/api'

const AUTH_USER_STORAGE_KEY = 'hfccf-auth-user'
const AUTH_TOKEN_STORAGE_KEY = 'hfccf-auth-token'
const LAST_ACTIVITY_STORAGE_KEY = 'hfccf-last-activity-at'
export const AUTH_STATE_CHANGED_EVENT = 'hfccf-auth-state-changed'

const INACTIVITY_TIMEOUT_MS = 12 * 60 * 60 * 1000
let sessionValidationPerformed = false

function isBrowser() {
  return typeof window !== 'undefined'
}

function getStorage(remember = false) {
  return remember ? window.localStorage : window.sessionStorage
}

function getFallbackStorage(remember = false) {
  return remember ? window.sessionStorage : window.localStorage
}

function clearSessionStorage(storage) {
  storage?.removeItem(AUTH_USER_STORAGE_KEY)
  storage?.removeItem(AUTH_TOKEN_STORAGE_KEY)
  storage?.removeItem(LAST_ACTIVITY_STORAGE_KEY)
}

function dispatchAuthStateChanged(detail = {}) {
  if (!isBrowser() || typeof window.CustomEvent !== 'function') return

  window.dispatchEvent(
    new CustomEvent(AUTH_STATE_CHANGED_EVENT, {
      detail,
    }),
  )
}

function sanitizeUser(user) {
  const safeUser = mapUser(user)

  delete safeUser.password

  return safeUser
}

function persistAuthenticatedUser(user) {
  const safeUser = sanitizeUser(user)
  const storage = getSessionStorage()

  storage?.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser))
  dispatchAuthStateChanged({
    type: 'profile-update',
    user: safeUser,
  })

  return safeUser
}

/**
 * Portal activation reuses the same storage contract as login so guardian
 * accounts can bootstrap a session without duplicating auth persistence.
 */
export function applyAuthenticatedSession({ token, user, remember = false }) {
  if (!token || !user) {
    throw new Error('Login response is missing session data.')
  }

  const storage = getStorage(remember)
  const fallbackStorage = getFallbackStorage(remember)
  const safeUser = sanitizeUser(user)

  clearSessionStorage(fallbackStorage)

  storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(safeUser))
  storage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  storage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(Date.now()))

  dispatchAuthStateChanged({
    type: 'login',
    user: safeUser,
  })

  return safeUser
}

function isHttpClientError(error) {
  return Boolean(error?.response || error?.request)
}

function hasToken(storage) {
  return Boolean(storage?.getItem(AUTH_TOKEN_STORAGE_KEY))
}

function getSessionStorage() {
  if (!isBrowser()) return null

  if (hasToken(window.localStorage)) {
    return window.localStorage
  }

  if (hasToken(window.sessionStorage)) {
    return window.sessionStorage
  }

  return null
}

function getLastActivityRaw() {
  if (!isBrowser()) return ''

  return (
    window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY) ||
    window.sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY) ||
    ''
  )
}

export async function login({ email, password, remember = false }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail || !password) {
    throw new Error('Please enter both email and password.')
  }

  try {
    const response = await http.post('/auth/login', {
      email: normalizedEmail,
      password,
      remember: Boolean(remember),
    })

    const payload = unwrapApiData(response) || {}
    const token = payload.token
    const user = payload.user

    return applyAuthenticatedSession({ token, user, remember })
  } catch (error) {
    if (!isHttpClientError(error)) {
      throw error
    }

    throw new Error(getApiErrorMessage(error, 'Invalid email or password.'), {
      cause: error,
    })
  }
}

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('Please enter your email address.')
  }

  try {
    const response = await http.post('/auth/forgot-password', {
      email: normalizedEmail,
    })

    return unwrapApiData(response)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to send reset code right now.'), {
      cause: error,
    })
  }
}

export async function verifyPasswordResetOtp({ email, code }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedCode = String(code || '').replace(/\D/g, '').slice(0, 6)

  if (!normalizedEmail || normalizedCode.length !== 6) {
    throw new Error('Please enter a valid verification code.')
  }

  try {
    const response = await http.post('/auth/verify-otp', {
      email: normalizedEmail,
      code: normalizedCode,
    })

    return unwrapApiData(response)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Invalid or expired verification code.'), {
      cause: error,
    })
  }
}

export async function resetPassword({
  email,
  code,
  password,
  password_confirmation,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedCode = String(code || '').replace(/\D/g, '').slice(0, 6)

  if (!normalizedEmail || normalizedCode.length !== 6 || !password) {
    throw new Error('Please complete the password reset form.')
  }

  try {
    const response = await http.post('/auth/reset-password', {
      email: normalizedEmail,
      code: normalizedCode,
      password,
      password_confirmation: password_confirmation || password,
    })

    return unwrapApiData(response)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to reset password right now.'), {
      cause: error,
    })
  }
}

export async function changePassword({
  current_password,
  password,
  password_confirmation,
}) {
  if (!current_password || !password || !password_confirmation) {
    throw new Error('Please complete the password change form.')
  }

  try {
    const response = await http.patch('/auth/change-password', {
      current_password,
      password,
      password_confirmation,
    })

    return unwrapApiData(response)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update your password right now.'), {
      cause: error,
    })
  }
}

export async function updateAuthenticatedUserProfile({
  first_name,
  last_name,
  username,
  email,
  phone,
  department_code,
  department,
  bio,
  avatar,
  remove_avatar = false,
}) {
  try {
    const formData = new FormData()

    if (first_name !== undefined) formData.append('first_name', first_name || '')
    if (last_name !== undefined) formData.append('last_name', last_name || '')
    if (username !== undefined) formData.append('username', username || '')
    if (email !== undefined) formData.append('email', email || '')
    if (phone !== undefined) formData.append('phone', phone || '')

    const resolvedDepartmentCode = String(department_code || department || '').trim()
    if (department_code !== undefined || department !== undefined) {
      formData.append('department_code', resolvedDepartmentCode)
    }

    if (bio !== undefined) formData.append('bio', bio || '')
    if (avatar) formData.append('avatar', avatar)
    if (remove_avatar) formData.append('remove_avatar', '1')

    // POST with method spoofing keeps multipart avatar uploads compatible with Laravel.
    formData.append('_method', 'PATCH')

    const response = await http.post('/auth/me', formData)

    const payload = unwrapApiData(response) || {}
    const user = payload.user || payload

    return persistAuthenticatedUser(user)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update your profile right now.'), {
      cause: error,
    })
  }
}

export async function getAuthenticatedUser() {
  try {
    const response = await http.get('/auth/me')
    const payload = unwrapApiData(response) || {}
    const user = payload.user || payload
    const safeUser = persistAuthenticatedUser(user)

    touchActivity()
    dispatchAuthStateChanged({
      type: 'refresh',
      user: safeUser,
    })

    return safeUser
  } catch (error) {
    if (error?.response?.status === 401) {
      logout()
    }

    throw new Error(getApiErrorMessage(error, 'Unable to load authenticated user.'), {
      cause: error,
    })
  }
}

export function logout({ clearRemembered = true } = {}) {
  if (!isBrowser()) return

  sessionValidationPerformed = false
  clearSessionStorage(window.sessionStorage)

  if (clearRemembered) {
    clearSessionStorage(window.localStorage)
  }

  dispatchAuthStateChanged({
    type: 'logout',
    clearRemembered,
  })
}

export async function logoutFromApi() {
  try {
    if (getAuthToken()) {
      await http.post('/auth/logout')
    }
  } finally {
    logout()
  }
}

function getStoredUser() {
  const storage = getSessionStorage()
  const raw = storage?.getItem(AUTH_USER_STORAGE_KEY)

  if (!raw) return null

  try {
    const user = JSON.parse(raw)

    return user && typeof user === 'object' ? user : null
  } catch {
    return null
  }
}

export function getCurrentUser() {
  if (!isBrowser()) return null

  return getStoredUser()
}

export function getAuthToken() {
  if (!isBrowser()) return ''

  return (
    window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    ''
  )
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

export function getCurrentPermissions(user = getCurrentUser()) {
  if (!user || typeof user !== 'object') {
    return []
  }

  if (Array.isArray(user.permissions)) {
    return user.permissions
  }

  if (Array.isArray(user.role_permission)) {
    return user.role_permission
  }

  if (Array.isArray(user.role_permissions)) {
    return user.role_permissions
  }

  return []
}

export function requiresPasswordChange(user = getCurrentUser()) {
  return Boolean(user?.mustChangePassword)
}

export function hasPermission(permission, user = getCurrentUser()) {
  const permissions = getCurrentPermissions(user)

  return permissions.includes('all:*') || permissions.includes(permission)
}

export function isSuperAdmin(user = getCurrentUser()) {
  return hasPermission('all:*', user)
}

export function touchActivity(timestamp = Date.now()) {
  const storage = getSessionStorage()

  if (!storage) return

  storage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp))
}

export function hasSessionExpired(now = Date.now()) {
  if (!isAuthenticated()) {
    return false
  }

  const lastActivity = Number(getLastActivityRaw())

  if (!lastActivity) {
    touchActivity(now)
    return false
  }

  return now - lastActivity >= INACTIVITY_TIMEOUT_MS
}

export async function ensureSessionIsValid() {
  if (!isAuthenticated()) {
    return false
  }

  const user = getCurrentUser()

  if (!user) {
    return false
  }

  if (hasSessionExpired()) {
    logout({
      clearRemembered: false,
    })

    return false
  }

  if (sessionValidationPerformed) {
    return true
  }

  try {
    await getAuthenticatedUser()
    sessionValidationPerformed = true
    return true
  } catch {
    return false
  }
}

export function startAutoLogoutWatcher({
  onExpire,
  checkEveryMs = 60000,
} = {}) {
  if (!isBrowser()) {
    return () => {}
  }

  const activityEvents = [
    'click',
    'keydown',
    'mousedown',
    'touchstart',
    'scroll',
  ]

  const sessionKeys = [
    AUTH_USER_STORAGE_KEY,
    AUTH_TOKEN_STORAGE_KEY,
  ]

  let lastTrackedAt = 0

  function trackActivity() {
    if (!isAuthenticated()) return

    const now = Date.now()

    if (now - lastTrackedAt < 15000) {
      return
    }

    lastTrackedAt = now
    touchActivity(now)
  }

  function checkExpiry() {
    if (!isAuthenticated()) return

    if (hasSessionExpired()) {
      logout({
        clearRemembered: false,
      })

      if (typeof onExpire === 'function') {
        onExpire()
      }
    }
  }

  function handleStorageChange(event) {
    const sessionWasCleared = event.key === null

    const authValueWasRemoved =
      sessionKeys.includes(event.key) &&
      event.oldValue !== null &&
      event.newValue === null

    if (!authValueWasRemoved && !(sessionWasCleared && isAuthenticated())) {
      return
    }

    logout({
      clearRemembered: false,
    })

    if (typeof onExpire === 'function') {
      onExpire()
    }
  }

  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, trackActivity, {
      passive: true,
    })
  })

  window.addEventListener('storage', handleStorageChange)

  const timer = window.setInterval(checkExpiry, checkEveryMs)

  checkExpiry()

  return () => {
    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, trackActivity)
    })

    window.clearInterval(timer)
    window.removeEventListener('storage', handleStorageChange)
  }
}
