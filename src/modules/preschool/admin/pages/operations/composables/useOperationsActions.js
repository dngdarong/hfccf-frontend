import { useRouter } from 'vue-router'

const QUICK_ACTION_LABEL_KEYS = {
  'dashboard-preschool-admin-attendance': 'takeAttendance',
  'dashboard-preschool-admin-attendance-history': 'viewSession',
  'dashboard-preschool-admin-attendance-alerts': 'openAlerts',
  'dashboard-preschool-admin-students': 'viewDetails',
  'dashboard-preschool-admin-guardian-communications': 'viewDetails',
  'dashboard-preschool-admin-health': 'viewDetails',
  'dashboard-preschool-admin-payment': 'viewInvoice',
  'dashboard-preschool-admin-reports': 'viewReports',
}

const SESSION_ACTIONS = {
  scheduled: { routeName: 'dashboard-preschool-admin-attendance', labelKey: 'takeAttendance' },
  open: { routeName: 'dashboard-preschool-admin-attendance', labelKey: 'takeAttendance' },
  in_progress: { routeName: 'dashboard-preschool-admin-attendance-session-details', labelKey: 'continueAttendance' },
  completed: { routeName: 'dashboard-preschool-admin-attendance-session-details', labelKey: 'viewSession' },
  locked: { routeName: 'dashboard-preschool-admin-attendance-session-details', labelKey: 'viewSession' },
  cancelled: { routeName: 'dashboard-preschool-admin-attendance-session-details', labelKey: 'viewSession' },
}

export function resolveOperationsRoute(router, routeName, params = {}, query = {}) {
  if (!routeName || !router.hasRoute(routeName)) {
    return null
  }

  return {
    name: routeName,
    params,
    query,
  }
}

export function resolveOperationsQuickAction(router, action = {}) {
  const routeName = String(action.routeName || '').trim()
  const to = resolveOperationsRoute(router, routeName, action.params || {}, action.query || {})

  return {
    ...action,
    labelKey: action.labelKey || QUICK_ACTION_LABEL_KEYS[routeName] || 'viewDetails',
    to,
    canNavigate: Boolean(to),
  }
}

export function resolveOperationsSessionAction(router, session = {}) {
  const status = String(session.status || '').trim().toLowerCase()
  const action = SESSION_ACTIONS[status] || { routeName: 'dashboard-preschool-admin-attendance-session-details', labelKey: 'viewSession' }
  const to = resolveOperationsRoute(
    router,
    action.routeName,
    action.routeName === 'dashboard-preschool-admin-attendance-session-details' ? { id: session.id } : {},
  )

  return {
    ...action,
    to,
    canNavigate: Boolean(to),
  }
}

export function useOperationsActions() {
  const router = useRouter()

  function goToRoute(target) {
    if (!target || !target.name || !router.hasRoute(target.name)) {
      return
    }

    router.push(target)
  }

  function goToDashboard() {
    goToRoute({ name: 'dashboard-preschool-admin' })
  }

  function resolveQuickAction(action) {
    return resolveOperationsQuickAction(router, action)
  }

  function resolveSessionAction(session) {
    return resolveOperationsSessionAction(router, session)
  }

  return {
    router,
    goToDashboard,
    goToRoute,
    resolveQuickAction,
    resolveSessionAction,
  }
}
