import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  AUTH_STATE_CHANGED_EVENT,
  getAuthenticatedUser,
  getCurrentPermissions,
  getCurrentUser,
  isAuthenticated,
  login as authLogin,
  logout as authLogout,
  logoutFromApi,
} from '@/services/auth'

let authStateListenerBound = false

function isBrowser() {
  return typeof window !== 'undefined'
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(getCurrentUser())
  const loading = ref(false)

  const authenticated = computed(() => isAuthenticated())
  const permissions = computed(() => getCurrentPermissions(currentUser.value))

  function syncFromStorage() {
    currentUser.value = getCurrentUser()
  }

  function bindAuthStateListener() {
    if (!isBrowser() || authStateListenerBound) return

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncFromStorage)
    authStateListenerBound = true
  }

  bindAuthStateListener()

  function refresh() {
    syncFromStorage()
  }

  async function login(credentials) {
    loading.value = true

    try {
      const user = await authLogin(credentials)
      currentUser.value = user
      return user
    } finally {
      loading.value = false
    }
  }

  async function fetchAuthenticatedUser() {
    loading.value = true

    try {
      const user = await getAuthenticatedUser()
      currentUser.value = user
      return user
    } catch (error) {
      syncFromStorage()
      throw error
    } finally {
      loading.value = false
    }
  }

  async function refreshSession() {
    if (!authenticated.value) {
      syncFromStorage()
      return null
    }

    return await fetchAuthenticatedUser()
  }

  async function logout({ callApi = true, clearRemembered = true } = {}) {
    loading.value = true

    try {
      if (callApi) {
        await logoutFromApi()
      } else {
        authLogout({ clearRemembered })
      }
    } finally {
      currentUser.value = null
      loading.value = false
    }
  }

  function clear() {
    authLogout()
    currentUser.value = null
  }

  return {
    authenticated,
    isAuthenticated: authenticated,
    currentUser,
    fetchAuthenticatedUser,
    clear,
    login,
    loading,
    logout,
    permissions,
    refresh,
    refreshSession,
  }
})

export const useAuthStore = useUserStore
