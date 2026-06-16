import { computed } from 'vue'
import { hasPermission } from '@/services/auth'
import { ROLES, isTeacherRole, normalizeRole } from '@/constants/roles'
import { useUserStore } from '@/store/userStore'
import { useLanguage } from '@/composables/useLanguage'
import { dashboardByRole, dashboardLabels, dashboardSeverities } from '@/modules/dashboard/config/roleDashboardMap'
import { dashboardRegistry } from '@/modules/dashboard/config/dashboardRegistry'

/**
 * Centralized dashboard resolution state.
 * Keep the page lean by exposing only the resolved dashboard view model.
 */
export function useDashboardResolver() {
  const userStore = useUserStore()
  const { t } = useLanguage()

  const currentUser = computed(() => userStore.currentUser || {})
  const normalizedRole = computed(() => normalizeRole(currentUser.value?.role))

  const effectiveRole = computed(() =>
    hasPermission('all:*', currentUser.value)
      ? ROLES.SUPER_ADMIN
      : normalizedRole.value,
  )

  /**
   * Decide whether the current role may use its dedicated dashboard.
   */
  function canUseRoleDashboard(role) {
    if (!dashboardByRole[role]) return false
    if (role === ROLES.SUPER_ADMIN) return true
    if (isTeacherRole(role)) return hasPermission('tasks:write', currentUser.value)
    if (role === ROLES.COACH) return hasPermission('training:write', currentUser.value)

    return true
  }

  const roleDashboardConfig = computed(() => {
    const role = effectiveRole.value

    if (!canUseRoleDashboard(role)) {
      return null
    }

    return {
      component: dashboardByRole[role],
      label: t(dashboardLabels[role] || role),
      severity: dashboardSeverities[role] || 'secondary',
    }
  })

  const fallbackDashboardKey = computed(() => {
    if (hasPermission('users:write', currentUser.value)) return 'operations'
    if (hasPermission('tasks:write', currentUser.value)) return 'delivery'
    if (hasPermission('programs:write', currentUser.value)) return 'programs'

    return 'basic'
  })

  const activeDashboardConfig = computed(() =>
    roleDashboardConfig.value || dashboardRegistry[fallbackDashboardKey.value] || null,
  )

  const activeDashboardComponent = computed(() =>
    activeDashboardConfig.value?.component || null,
  )

  const currentRoleLabel = computed(() =>
    activeDashboardConfig.value?.label || normalizedRole.value || t('common.role.teacher') || 'User',
  )

  const currentSeverity = computed(() =>
    activeDashboardConfig.value?.severity || 'secondary',
  )

  return {
    currentUser,
    normalizedRole,
    effectiveRole,
    activeDashboardConfig,
    activeDashboardComponent,
    currentRoleLabel,
    currentSeverity,
  }
}
