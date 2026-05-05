import { createRouter, createWebHistory } from 'vue-router'
import { ensureSessionIsValid, getCurrentUser, touchActivity } from '@/services/auth'
import { canAccessRoute } from '@/services/accessControl'
import { authRoutes } from '@/modules/auth/routes'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { superAdminRoutes } from '@/modules/super-admin/routes'
import { englishRoutes } from '@/modules/english/routes'
import { preschoolRoutes } from '@/modules/preschool/routes'
import { scholarshipRoutes } from '@/modules/scholarship/routes'
import { sportRoutes } from '@/modules/sport/routes'
import { settingsRoutes } from '@/modules/settings/routes'

const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...superAdminRoutes,
  ...englishRoutes,
  ...preschoolRoutes,
  ...scholarshipRoutes,
  ...sportRoutes,
  ...settingsRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/module/dashboard',
  },
]

function routeMetaMatches(to, key) {
  return to.matched.some((record) => record.meta[key])
}

function requiresAuth(to) {
  return routeMetaMatches(to, 'requiresAuth')
}

function isGuestOnly(to) {
  return routeMetaMatches(to, 'guestOnly')
}

function hasValidSession() {
  return ensureSessionIsValid()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const sessionValid = hasValidSession()
  const currentUser = getCurrentUser()

  if (requiresAuth(to) && !sessionValid) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (isGuestOnly(to) && sessionValid) {
    return { name: 'dashboard' }
  }

  if (sessionValid && !canAccessRoute(currentUser, to)) {
    return { name: 'dashboard' }
  }

  if (sessionValid) {
    touchActivity()
  }

  return true
})

export default router
