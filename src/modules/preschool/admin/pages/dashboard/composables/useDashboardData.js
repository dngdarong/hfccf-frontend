import { computed, ref } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchTodayAttendanceSessions } from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'
import { fetchPreschoolDashboard } from '@/modules/preschool/services/preschoolApi'
import { fetchSchedules } from '@/modules/preschool/services/api/preschoolScheduleApi'
import { fetchReportsDashboard } from '@/modules/preschool/services/api/preschoolReportingApi'
import { PreschoolScheduleDay } from '@/modules/preschool/services/scheduleConstants'
import {
  buildScheduleSessionIndex,
  normalizeScheduleSessionStatus,
  resolveScheduleSession,
} from '@/modules/preschool/shared/components/schedule/scheduleSessionOverlay'

const defaultDashboard = {
  summary: {
    students: 0,
    classes: 0,
    teachers: 0,
    attendanceToday: 0,
    pendingPayments: 0,
    overduePayments: 0,
    pendingEnrollments: 0,
    outstandingPayments: 0,
    healthAlerts: 0,
    guardianIssues: 0,
    attendanceExceptions: 0,
  },
  recentAttendance: [],
  upcomingClasses: [],
  paymentSummary: {
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
  },
  attendanceAlerts: {
    total: 0,
    open: 0,
    acknowledged: 0,
    overdue: 0,
    byClass: [],
    bySeverity: [],
  },
  recentAttendanceAlerts: [],
  operationalSessions: {
    schedules: [],
    sessions: [],
  },
}

const defaultReportsDashboard = {
  kpis: {},
  analytics: {},
  executiveHealth: {},
  modules: {},
  cards: [],
  risk: {},
  trend: [],
  performance: [],
  completion: [],
}

function formatCount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number).toLocaleString() : '0'
}

function formatPercent(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `${Math.round(number)}%` : '0%'
}

function formatCurrency(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `$${Math.round(number).toLocaleString()}` : '$0'
}

function joinParts(parts) {
  return parts.filter(Boolean).join(' • ')
}

function formatRelativeTime(value, locale = 'en-US', t = (key => key)) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const absDays = Math.abs(diffDays)
  const absMinutes = Math.abs(diffMinutes)

  const localDate = new Date(date)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfTarget = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())
  const dayDiff = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) return t('preschoolDashboardPage.operations.relative.today')
  if (dayDiff === -1) return t('preschoolDashboardPage.operations.relative.yesterday')
  if (dayDiff === 1) return t('preschoolDashboardPage.operations.relative.tomorrow')

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (absDays >= 1) return rtf.format(diffDays, 'day')
  if (absMinutes >= 1) return rtf.format(diffMinutes, 'minute')
  return rtf.format(0, 'minute')
}

function getFirstValue(source, paths = []) {
  for (const path of paths) {
    const value = path.split('.').reduce((carry, key) => carry?.[key], source)
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return ''
}

function getFirstNumber(source, paths = []) {
  for (const path of paths) {
    const value = path.split('.').reduce((carry, key) => carry?.[key], source)
    const number = Number(value)
    if (Number.isFinite(number)) {
      return number
    }
  }

  return null
}

function buildSparkline(series = [], comparison = null) {
  const values = (Array.isArray(series) ? series : [])
    .map(item => Number(item?.value))
    .filter(value => Number.isFinite(value))
    .slice(-5)

  if (values.length === 0) {
    const current = Number(comparison?.current)
    const previous = Number(comparison?.previous)

    if (Number.isFinite(current) && Number.isFinite(previous)) {
      return [
        { id: 'previous', value: previous },
        { id: 'current', value: current },
      ]
    }

    return []
  }

  return values.map((value, index) => ({
    id: `${index}-${value}`,
    value,
  }))
}

function resolveSparklineFallbackLabel(t, comparison = null) {
  const current = Number(comparison?.current)
  const previous = Number(comparison?.previous)

  if (Number.isFinite(current) && Number.isFinite(previous)) {
    return ''
  }

  if (Number.isFinite(current) && !Number.isFinite(previous)) {
    return t('preschoolDashboardPage.insights.sparklineStates.newPeriod')
  }

  if (!Number.isFinite(current) && Number.isFinite(previous)) {
    return t('preschoolDashboardPage.insights.sparklineStates.baseline')
  }

  return t('preschoolDashboardPage.insights.sparklineStates.noComparison')
}

function resolvePriorityTone(priority) {
  const normalized = String(priority || '').trim().toLowerCase()
  if (normalized === 'critical') return 'error'
  if (normalized === 'high') return 'warning'
  if (normalized === 'medium') return 'info'
  return 'info'
}

function translateExecutiveStatus(t, status) {
  const normalized = String(status || 'neutral').trim().toLowerCase()
  const key = normalized === 'warning' ? 'watch' : normalized

  return t(`preschoolDashboardPage.executiveHealth.statuses.${key}`)
}

function translateExecutiveBadgeStatus(t, status) {
  const normalized = String(status || 'neutral').trim().toLowerCase()
  const key = normalized === 'warning' ? 'watch' : normalized

  return t(`preschoolDashboardPage.executiveHealth.statusesShort.${key}`)
}

function resolveExecutiveHealthIcon(statusKey) {
  switch (String(statusKey || '').trim().toLowerCase()) {
    case 'enrollment':
      return 'pi pi-user-plus'
    case 'attendance':
      return 'pi pi-calendar-clock'
    case 'billing':
      return 'pi pi-credit-card'
    case 'assessment':
      return 'pi pi-chart-line'
    case 'health':
      return 'pi pi-heart'
    case 'guardians':
      return 'pi pi-users'
    default:
      return 'pi pi-info-circle'
  }
}

function formatAnalyticsComparison(t, metric, valueFormatter) {
  const delta = Number(metric?.delta)
  const direction = ['up', 'down', 'neutral'].includes(metric?.trend) ? metric.trend : 'neutral'
  const comparison = String(metric?.comparison || '').trim()

  if (!Number.isFinite(delta) || !comparison) {
    return {
      direction: 'neutral',
      label: t('preschoolDashboardPage.summary.noComparisonYet'),
    }
  }

  const sign = delta > 0 ? '+' : delta < 0 ? '-' : ''
  const comparisonKey = ['previous_day', 'start_of_month'].includes(comparison)
    ? comparison
    : 'previous_period'

  return {
    direction,
    label: t(`preschoolDashboardPage.summary.comparison.${comparisonKey}`, {
      value: `${sign}${valueFormatter(Math.abs(delta))}`,
    }),
  }
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayDayOfWeek() {
  const day = new Date().getDay()
  return day === 0 ? PreschoolScheduleDay.SUNDAY : day
}

function resolveSessionActionLabel(t, status) {
  const key = normalizeScheduleSessionStatus(status)

  if (key === 'scheduled') {
    return t('preschoolAttendanceSessionsPage.openSession')
  }

  if (key === 'open') {
    return t('preschoolAttendanceSessionsPage.actions.continueAttendance')
  }

  return t('preschoolAttendanceSessionsPage.actions.viewSession')
}

export function useDashboardData() {
  const { t, language } = useLanguage()
  const dashboard = ref(defaultDashboard)
  const reportsDashboard = ref(defaultReportsDashboard)
  const todayOperationalSchedules = ref([])
  const todayOperationalSessions = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  async function loadDashboard() {
    loading.value = true
    errorMessage.value = ''

    const [dashboardResult, reportsResult, schedulesResult, sessionsResult] = await Promise.allSettled([
      fetchPreschoolDashboard(),
      fetchReportsDashboard(),
      fetchSchedules({
        page: 1,
        perPage: 200,
        dayOfWeek: todayDayOfWeek(),
      }),
      fetchTodayAttendanceSessions(),
    ])

    const errors = []

    if (dashboardResult.status === 'fulfilled') {
      dashboard.value = {
        ...defaultDashboard,
        ...dashboardResult.value,
        summary: {
          ...defaultDashboard.summary,
          ...dashboardResult.value?.summary,
        },
        paymentSummary: {
          ...defaultDashboard.paymentSummary,
          ...dashboardResult.value?.paymentSummary,
        },
        attendanceAlerts: {
          ...defaultDashboard.attendanceAlerts,
          ...dashboardResult.value?.attendanceAlerts,
        },
        recentAttendanceAlerts: Array.isArray(dashboardResult.value?.recentAttendanceAlerts)
          ? dashboardResult.value.recentAttendanceAlerts
          : [],
      }
    } else {
      errors.push(dashboardResult.reason?.message || t('preschoolDashboardPage.errors.coreLoadFailed'))
    }

    if (reportsResult.status === 'fulfilled') {
      reportsDashboard.value = {
        ...defaultReportsDashboard,
        ...(reportsResult.value?.dashboard || defaultReportsDashboard),
      }
    } else {
      errors.push(reportsResult.reason?.message || t('preschoolDashboardPage.errors.reportsLoadFailed'))
    }

    todayOperationalSchedules.value = schedulesResult.status === 'fulfilled' && Array.isArray(schedulesResult.value?.items)
      ? schedulesResult.value.items
      : []

    todayOperationalSessions.value = sessionsResult.status === 'fulfilled' && Array.isArray(sessionsResult.value?.items)
      ? sessionsResult.value.items
      : []

    errorMessage.value = errors.join(' • ')
    loading.value = false
  }

  const academicYear = computed(() => String(getFirstValue(dashboard.value, [
    'academicYear.currentAcademicYear',
    'academicYearLabel',
    'currentAcademicYear',
    'summary.academicYear',
    'academicYear',
  ]) || '').trim())

  const academicTerm = computed(() => String(getFirstValue(dashboard.value, [
    'term.currentTerm',
    'termLabel',
    'currentTerm',
    'summary.term',
    'term',
  ]) || '').trim())

  const lastUpdated = computed(() => {
    const rawValue = reportsDashboard.value.generatedAt || dashboard.value.generatedAt
    if (!rawValue) return ''

    const date = new Date(rawValue)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(language.value === 'KH' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  })

  const todayScheduleSessionIndex = computed(() => buildScheduleSessionIndex(todayOperationalSessions.value))

  const todayScheduleItems = computed(() => {
    const currentDate = todayIso()

    return (todayOperationalSchedules.value || []).map((schedule) => {
      const session = resolveScheduleSession(schedule, todayScheduleSessionIndex.value, currentDate)
      const status = normalizeScheduleSessionStatus(session?.status || '')

      return {
        ...schedule,
        session: session
          ? {
              ...session,
              statusKey: status,
              statusLabel: t(`preschoolAttendanceSessionsPage.statuses.${status}`) || status,
              actionLabel: resolveSessionActionLabel(t, status),
            }
          : null,
      }
    })
  })

  const todaySessionCounts = computed(() => {
    const counts = {
      scheduled: 0,
      open: 0,
      completed: 0,
      locked: 0,
      cancelled: 0,
    }

    for (const item of todayScheduleItems.value) {
      const status = normalizeScheduleSessionStatus(item.session?.status || '')
      if (status === 'scheduled') counts.scheduled += 1
      else if (status === 'open') counts.open += 1
      else if (status === 'completed') counts.completed += 1
      else if (status === 'locked') counts.locked += 1
      else if (status === 'cancelled') counts.cancelled += 1
    }

    return counts
  })

  const todayMissingSessionCount = computed(() =>
    todayScheduleItems.value.filter((item) => !item.session).length,
  )


  const todayScheduleItemsForView = computed(() =>
    todayScheduleItems.value.map((item) => ({
      id: item.id,
      title: item.className || t('preschoolDashboardPage.operations.classFallback'),
      text: joinParts([
        [item.startTime, item.endTime].filter(Boolean).join(' - '),
        item.teacherName || '',
        item.room || '',
      ]),
      status: item.session?.statusKey || 'missing',
      statusLabel: item.session?.statusLabel || t('preschoolDashboardPage.operationalSummary.missing.label'),
      actionLabel: item.session?.actionLabel || t('preschoolSchedulesPage.actions.view'),
      hasSession: Boolean(item.session),
    })),
  )


  const attendanceProgressCards = computed(() => {
    const total = todayScheduleItems.value.length || todayOperationalSessions.value.length
    const completed = todaySessionCounts.value.completed
    const open = todaySessionCounts.value.open
    const late = getFirstNumber(reportsDashboard.value, ['kpis.lateRate']) ?? 0
    const excused = getFirstNumber(dashboard.value, ['summary.guardianIssues']) ?? 0
    const present = total > 0 ? Math.max(total - todaySessionCounts.value.open - todayMissingSessionCount.value, 0) : 0
    const absent = getFirstNumber(dashboard.value, ['summary.attendanceToday']) ?? 0

    return [
      { label: t('preschoolAttendanceDashboardPage.cards.present'), value: `${present}` },
      { label: t('preschoolAttendanceDashboardPage.cards.absent'), value: `${absent}` },
      { label: t('preschoolAttendanceDashboardPage.cards.late'), value: `${late}%` },
      { label: t('preschoolAttendanceDashboardPage.cards.excused'), value: `${excused}` },
      { label: t('preschoolDashboardPage.operationalSummary.open.label'), value: `${open}` },
      { label: t('preschoolDashboardPage.operationalSummary.completed.label'), value: `${completed}` },
    ]
  })

  const spotlightTitle = computed(() => {
    const nextClass = dashboard.value.upcomingClasses?.[0]
    if (!nextClass) {
      return t('preschoolDashboardPage.spotlight.noUpcomingClasses')
    }

    return `${nextClass.name || t('preschoolDashboardPage.spotlight.nextClassFallback')} ${t('preschoolDashboardPage.spotlight.nextClassSuffix')}`
  })

  const spotlightText = computed(() => {
    const nextClass = dashboard.value.upcomingClasses?.[0]
    if (!nextClass) {
      return t('preschoolDashboardPage.spotlight.fallback')
    }

    const teacher = nextClass.teacherDisplayName || nextClass.teacherName || t('preschoolDashboardPage.spotlight.assignedTeacher')
    const students = formatCount(nextClass.studentsCount ?? nextClass.studentCount ?? 0)
    const time = nextClass.scheduledTime || nextClass.schedule || ''

    return joinParts([
      t('preschoolDashboardPage.spotlight.nextClassText', { teacher, students }),
      time,
    ])
  })

  const summaryCards = computed(() => {
    const analytics = reportsDashboard.value.analytics || {}
    const hasAttendanceAnalytics = analytics.attendanceToday?.current !== null
      && analytics.attendanceToday?.current !== undefined
    const activeStudents = analytics.activeStudents?.current ?? getFirstNumber(dashboard.value, [
      'summary.students',
      'summary.activeStudents',
      'summary.active_student_count',
      'summary.totalStudents',
      'summary.total_students',
      'kpis.activeStudents',
      'kpis.totalStudents',
    ]) ?? 0
    const attendanceToday = analytics.attendanceToday?.current ?? getFirstNumber(dashboard.value, [
      'summary.attendanceToday',
      'summary.attendance_today',
      'kpis.attendanceToday',
      'kpis.presentStudents',
      'kpis.present_students',
    ]) ?? 0
    const openHealthAlerts = analytics.openHealthAlerts?.current ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, [
      'kpis.openHealthAlerts',
      'summary.healthAlerts',
      'summary.openHealthAlerts',
    ]) ?? 0
    const pendingEnrollments = analytics.pendingEnrollments?.current ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, [
      'summary.pendingEnrollments',
      'kpis.newEnrollments',
    ]) ?? 0
    const outstandingPayments = analytics.outstandingPayments?.current ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, [
      'kpis.outstandingBalances',
      'summary.outstandingPayments',
    ]) ?? 0

    const activeStudentsTrend = formatAnalyticsComparison(t, analytics.activeStudents, formatCount)
    const attendanceTrend = formatAnalyticsComparison(t, analytics.attendanceToday, formatPercent)
    const healthTrend = formatAnalyticsComparison(t, analytics.openHealthAlerts, formatCount)
    const enrollmentTrend = formatAnalyticsComparison(t, analytics.pendingEnrollments, formatCount)
    const paymentTrend = formatAnalyticsComparison(t, analytics.outstandingPayments, formatCurrency)

    return [
      {
        title: t('preschoolDashboardPage.summary.activeStudents.title'),
        icon: 'pi pi-users',
        value: formatCount(activeStudents),
        label: t('preschoolDashboardPage.summary.activeStudents.label'),
        comparison: activeStudentsTrend.label,
        trend: activeStudentsTrend,
        status: 'success',
      },
      {
        title: t('preschoolDashboardPage.summary.attendanceToday.title'),
        icon: 'pi pi-calendar-clock',
        value: hasAttendanceAnalytics ? formatPercent(attendanceToday) : formatCount(attendanceToday),
        label: t(`preschoolDashboardPage.summary.attendanceToday.${hasAttendanceAnalytics ? 'rateLabel' : 'label'}`),
        comparison: attendanceTrend.label,
        trend: attendanceTrend,
        status: 'info',
      },
      {
        title: t('preschoolDashboardPage.summary.healthAlerts.title'),
        icon: 'pi pi-heart',
        value: formatCount(openHealthAlerts),
        label: t('preschoolDashboardPage.summary.healthAlerts.label'),
        comparison: healthTrend.label,
        trend: healthTrend,
        status: 'error',
      },
      {
        title: t('preschoolDashboardPage.summary.pendingEnrollments.title'),
        icon: 'pi pi-user-plus',
        value: formatCount(pendingEnrollments),
        label: t('preschoolDashboardPage.summary.pendingEnrollments.label'),
        comparison: enrollmentTrend.label,
        trend: enrollmentTrend,
        status: 'warning',
      },
      {
        title: t('preschoolDashboardPage.summary.outstandingPayments.title'),
        icon: 'pi pi-wallet',
        value: formatCurrency(outstandingPayments),
        label: t('preschoolDashboardPage.summary.outstandingPayments.label'),
        comparison: paymentTrend.label,
        trend: paymentTrend,
        status: 'info',
      },
    ]
  })

  const attendanceAlertSummary = computed(() => dashboard.value.attendanceAlerts || defaultDashboard.attendanceAlerts)



  const systemHealthItems = computed(() => {
    const health = reportsDashboard.value.executiveHealth || {}
    const attendanceAlerts = attendanceAlertSummary.value
    const openHealthAlerts = health.health?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.openHealthAlerts', 'summary.healthAlerts']) ?? null
    const pendingEnrollments = health.enrollment?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.pendingEnrollments', 'kpis.newEnrollments']) ?? null
    const attendanceExceptions = health.attendance?.exceptions ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.attendanceExceptions', 'kpis.lateRate']) ?? null
    const attendanceRate = health.attendance?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.attendanceRate']) ?? null
    const outstandingPayments = health.billing?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.outstandingBalances', 'summary.outstandingPayments', 'kpis.overdueInvoices']) ?? null
    const assessmentCompletion = health.assessment?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.assessmentCompletion']) ?? null
    const guardianIssues = health.guardians?.value ?? getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.guardianIssues', 'kpis.openGuardianIssues', 'kpis.escalatedCases']) ?? null

    const enrollmentStatus = health.enrollment?.status || 'neutral'
    const attendanceStatus = health.attendance?.status || 'neutral'
    const billingStatus = health.billing?.status || 'neutral'
    const assessmentStatus = health.assessment?.status || 'neutral'
    const healthStatus = health.health?.status || 'neutral'
    const guardianStatus = health.guardians?.status || 'neutral'

    return [
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.enrollment'),
        iconClass: resolveExecutiveHealthIcon('enrollment'),
        status: enrollmentStatus,
        statusLabel: translateExecutiveStatus(t, enrollmentStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, enrollmentStatus),
        detail: pendingEnrollments === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : pendingEnrollments > 0
            ? t('preschoolDashboardPage.executiveHealth.details.pendingEnrollments', { count: formatCount(pendingEnrollments) })
            : t('preschoolDashboardPage.executiveHealth.details.healthy'),
      },
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.attendance'),
        iconClass: resolveExecutiveHealthIcon('attendance'),
        status: attendanceStatus,
        statusLabel: translateExecutiveStatus(t, attendanceStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, attendanceStatus),
        detail: attendanceAlerts.total > 0
          ? attendanceAlerts.overdue > 0
            ? t('preschoolAttendanceDashboardPage.alertSummary.detail.overdue', { count: formatCount(attendanceAlerts.overdue) })
            : t('preschoolAttendanceDashboardPage.alertSummary.detail.open', { count: formatCount(attendanceAlerts.open) })
          : attendanceExceptions === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : Number(attendanceExceptions) > 0
            ? t('preschoolDashboardPage.executiveHealth.details.attendanceExceptions', { count: formatCount(attendanceExceptions) })
            : attendanceRate === null
              ? t('preschoolDashboardPage.executiveHealth.noData')
              : t('preschoolDashboardPage.executiveHealth.details.attendanceRate', { rate: formatPercent(attendanceRate) }),
      },
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.billing'),
        iconClass: resolveExecutiveHealthIcon('billing'),
        status: billingStatus,
        statusLabel: translateExecutiveStatus(t, billingStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, billingStatus),
        detail: outstandingPayments === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : Number(outstandingPayments) > 0
            ? t('preschoolDashboardPage.executiveHealth.details.outstandingPayments', { amount: formatCurrency(outstandingPayments) })
            : t('preschoolDashboardPage.executiveHealth.details.healthy'),
      },
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.assessment'),
        iconClass: resolveExecutiveHealthIcon('assessment'),
        status: assessmentStatus,
        statusLabel: translateExecutiveStatus(t, assessmentStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, assessmentStatus),
        detail: assessmentCompletion === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : t('preschoolDashboardPage.executiveHealth.details.assessmentCompletion', { rate: formatPercent(assessmentCompletion) }),
      },
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.health'),
        iconClass: resolveExecutiveHealthIcon('health'),
        status: healthStatus,
        statusLabel: translateExecutiveStatus(t, healthStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, healthStatus),
        detail: openHealthAlerts === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : Number(openHealthAlerts) > 0
            ? t('preschoolDashboardPage.executiveHealth.details.openHealthAlerts', { count: formatCount(openHealthAlerts) })
            : t('preschoolDashboardPage.executiveHealth.details.healthy'),
      },
      {
        label: t('preschoolDashboardPage.executiveHealth.modules.guardians'),
        iconClass: resolveExecutiveHealthIcon('guardians'),
        status: guardianStatus,
        statusLabel: translateExecutiveStatus(t, guardianStatus),
        statusBadgeLabel: translateExecutiveBadgeStatus(t, guardianStatus),
        detail: guardianIssues === null
          ? t('preschoolDashboardPage.executiveHealth.noData')
          : Number(guardianIssues) > 0
            ? t('preschoolDashboardPage.executiveHealth.details.guardianIssues', { count: formatCount(guardianIssues) })
            : t('preschoolDashboardPage.executiveHealth.details.healthy'),
      },
    ]
  })

  const priorityItems = computed(() => {
    const items = []

    const healthAlerts = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.openHealthAlerts', 'summary.healthAlerts']) ?? 0
    const criticalHealthAlerts = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.criticalHealthAlerts']) ?? 0
    const guardianIssues = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.guardianIssues', 'kpis.openGuardianIssues', 'kpis.escalatedCases']) ?? 0
    const pendingEnrollments = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.pendingEnrollments', 'kpis.newEnrollments']) ?? 0
    const overduePayments = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['summary.overduePayments', 'kpis.overdueInvoices']) ?? 0
    const attendanceAlerts = attendanceAlertSummary.value
    const atRiskStudents = getFirstNumber({
      ...dashboard.value,
      kpis: reportsDashboard.value.kpis,
    }, ['kpis.atRiskStudents']) ?? 0
    const upcomingClass = dashboard.value.upcomingClasses?.[0]

    if (criticalHealthAlerts > 0 || healthAlerts > 0) {
      items.push({
        title: t('preschoolDashboardPage.priority.health.title'),
        detail: t('preschoolDashboardPage.priority.health.detail', { count: formatCount(Math.max(healthAlerts, criticalHealthAlerts)) }),
        value: formatCount(Math.max(healthAlerts, criticalHealthAlerts)),
        priority: criticalHealthAlerts > 0 ? 'critical' : 'high',
        priorityLabel: t(`preschoolDashboardPage.priority.levels.${criticalHealthAlerts > 0 ? 'critical' : 'high'}`),
        tone: resolvePriorityTone(criticalHealthAlerts > 0 ? 'critical' : 'high'),
        actionLabel: t('preschoolDashboardPage.priority.review'),
        actionTo: { name: 'dashboard-preschool-admin-health' },
      })
    }

    if (guardianIssues > 0) {
      items.push({
        title: t('preschoolDashboardPage.priority.guardians.title'),
        detail: t('preschoolDashboardPage.priority.guardians.detail', { count: formatCount(guardianIssues) }),
        value: formatCount(guardianIssues),
        priority: guardianIssues > 2 ? 'critical' : 'high',
        priorityLabel: t(`preschoolDashboardPage.priority.levels.${guardianIssues > 2 ? 'critical' : 'high'}`),
        tone: resolvePriorityTone(guardianIssues > 2 ? 'critical' : 'high'),
        actionLabel: t('preschoolDashboardPage.priority.review'),
        actionTo: { name: 'dashboard-preschool-admin-guardian-communications' },
      })
    }

    if (pendingEnrollments > 0) {
      items.push({
        title: t('preschoolDashboardPage.priority.enrollment.title'),
        detail: t('preschoolDashboardPage.priority.enrollment.detail', { count: formatCount(pendingEnrollments) }),
        value: formatCount(pendingEnrollments),
        priority: 'high',
        priorityLabel: t('preschoolDashboardPage.priority.levels.high'),
        tone: resolvePriorityTone('high'),
      })
    }

    if (overduePayments > 0) {
      const paymentAmount = getFirstNumber({
        ...dashboard.value,
        kpis: reportsDashboard.value.kpis,
      }, ['kpis.outstandingBalances', 'summary.outstandingPayments']) ?? overduePayments

      items.push({
        title: t('preschoolDashboardPage.priority.payments.title'),
        detail: t('preschoolDashboardPage.priority.payments.detail', { amount: formatCurrency(paymentAmount) }),
        value: formatCurrency(paymentAmount),
        priority: 'high',
        priorityLabel: t('preschoolDashboardPage.priority.levels.high'),
        tone: resolvePriorityTone('high'),
        actionLabel: t('preschoolDashboardPage.priority.review'),
        actionTo: { name: 'dashboard-preschool-admin-payment' },
      })
    }

    if ((attendanceAlerts.total ?? 0) > 0) {
      items.push({
        title: t('preschoolAttendanceDashboardPage.alertSummary.title'),
        detail: attendanceAlerts.overdue > 0
          ? t('preschoolAttendanceDashboardPage.alertSummary.detail.overdue', { count: formatCount(attendanceAlerts.overdue) })
          : t('preschoolAttendanceDashboardPage.alertSummary.detail.open', { count: formatCount(attendanceAlerts.open) }),
        value: formatCount(attendanceAlerts.open),
        priority: attendanceAlerts.overdue > 0 ? 'high' : 'medium',
        priorityLabel: t(`preschoolDashboardPage.priority.levels.${attendanceAlerts.overdue > 0 ? 'high' : 'medium'}`),
        tone: resolvePriorityTone(attendanceAlerts.overdue > 0 ? 'high' : 'medium'),
        actionLabel: t('preschoolAttendanceDashboardPage.alertSummary.viewAllAttendanceAlerts'),
        actionTo: { name: 'dashboard-preschool-admin-attendance-alerts' },
      })
    }

    if (atRiskStudents > 0) {
      items.push({
        title: t('preschoolDashboardPage.priority.assessment.title'),
        detail: t('preschoolDashboardPage.priority.assessment.detail', { count: formatCount(atRiskStudents) }),
        value: formatCount(atRiskStudents),
        priority: 'medium',
        priorityLabel: t('preschoolDashboardPage.priority.levels.medium'),
        tone: resolvePriorityTone('medium'),
        actionLabel: t('preschoolDashboardPage.priority.review'),
      })
    }

    if (items.length === 0 && upcomingClass) {
      items.push({
        title: t('preschoolDashboardPage.priority.upcoming.title'),
        detail: joinParts([
          upcomingClass.name || t('preschoolDashboardPage.operations.classFallback'),
          upcomingClass.scheduledTime || upcomingClass.schedule || '',
        ]),
        value: formatCount(upcomingClass.studentsCount ?? upcomingClass.studentCount ?? 0),
        priority: 'info',
        priorityLabel: t('preschoolDashboardPage.priority.levels.info'),
        tone: resolvePriorityTone('info'),
        actionLabel: t('preschoolDashboardPage.priority.openSchedule'),
        actionTo: { name: 'dashboard-preschool-admin-schedules' },
      })
    }

    return items
      .sort((left, right) => {
        const order = { critical: 0, high: 1, medium: 2, info: 3 }
        return (order[left.priority] ?? 99) - (order[right.priority] ?? 99)
      })
      .slice(0, 6)
  })

  const insightCards = computed(() => {
    const attendanceSeries = buildSparkline(reportsDashboard.value.trend, reportsDashboard.value.analytics?.attendanceToday)
    const enrollmentSeries = buildSparkline(reportsDashboard.value.performance, reportsDashboard.value.analytics?.pendingEnrollments)
    const assessmentSeries = buildSparkline(reportsDashboard.value.completion)
    const paymentSeries = buildSparkline([], reportsDashboard.value.analytics?.outstandingPayments)

    const attendanceRate = getFirstNumber(reportsDashboard.value, ['kpis.attendanceRate']) ?? 0
    const absenceRate = getFirstNumber(reportsDashboard.value, ['kpis.absenceRate']) ?? 0
    const lateRate = getFirstNumber(reportsDashboard.value, ['kpis.lateRate']) ?? 0
    const newEnrollments = getFirstNumber(reportsDashboard.value, ['kpis.newEnrollments']) ?? 0
    const activeStudents = getFirstNumber(reportsDashboard.value, ['kpis.activeStudents']) ?? getFirstNumber(dashboard.value, ['summary.students']) ?? 0
    const totalStudents = getFirstNumber(reportsDashboard.value, ['kpis.totalStudents']) ?? getFirstNumber(dashboard.value, ['summary.students']) ?? 0
    const assessmentCompletion = getFirstNumber(reportsDashboard.value, ['kpis.assessmentCompletion']) ?? 0
    const atRiskStudents = getFirstNumber(reportsDashboard.value, ['kpis.atRiskStudents']) ?? 0
    const revenue = getFirstNumber(reportsDashboard.value, ['kpis.revenue']) ?? 0
    const outstandingBalances = getFirstNumber(reportsDashboard.value, ['kpis.outstandingBalances']) ?? 0
    const overdueInvoices = getFirstNumber(reportsDashboard.value, ['kpis.overdueInvoices']) ?? 0

    return [
      {
        title: t('preschoolDashboardPage.insights.attendance.title'),
        value: formatPercent(attendanceRate),
        label: t('preschoolDashboardPage.insights.attendance.label'),
        note: t('preschoolDashboardPage.insights.attendance.note', {
          absence: formatPercent(absenceRate),
          late: formatPercent(lateRate),
        }),
        metrics: [
          { label: t('preschoolDashboardPage.insights.attendance.metrics.present'), value: formatCount(dashboard.value.summary.attendanceToday) },
          { label: t('preschoolDashboardPage.insights.attendance.metrics.absent'), value: formatPercent(absenceRate) },
        ],
        sparkline: attendanceSeries,
        sparklineFallback: resolveSparklineFallbackLabel(t, reportsDashboard.value.analytics?.attendanceToday),
      },
      {
        title: t('preschoolDashboardPage.insights.enrollment.title'),
        value: formatCount(newEnrollments),
        label: t('preschoolDashboardPage.insights.enrollment.label'),
        note: t('preschoolDashboardPage.insights.enrollment.note', {
          active: formatCount(activeStudents),
        }),
        metrics: [
          { label: t('preschoolDashboardPage.insights.enrollment.metrics.active'), value: formatCount(activeStudents) },
          { label: t('preschoolDashboardPage.insights.enrollment.metrics.students'), value: formatCount(totalStudents) },
        ],
        sparkline: enrollmentSeries,
        sparklineFallback: resolveSparklineFallbackLabel(t, reportsDashboard.value.analytics?.pendingEnrollments),
      },
      {
        title: t('preschoolDashboardPage.insights.assessment.title'),
        value: formatPercent(assessmentCompletion),
        label: t('preschoolDashboardPage.insights.assessment.label'),
        note: t('preschoolDashboardPage.insights.assessment.note', {
          risk: formatCount(atRiskStudents),
        }),
        metrics: [
          { label: t('preschoolDashboardPage.insights.assessment.metrics.risk'), value: formatCount(atRiskStudents) },
          { label: t('preschoolDashboardPage.insights.assessment.metrics.score'), value: reportsDashboard.value.kpis?.averageScore ?? 0 },
        ],
        sparkline: assessmentSeries,
        sparklineFallback: resolveSparklineFallbackLabel(t, null),
      },
      {
        title: t('preschoolDashboardPage.insights.payments.title'),
        value: formatCurrency(revenue),
        label: t('preschoolDashboardPage.insights.payments.label'),
        note: t('preschoolDashboardPage.insights.payments.note', {
          overdue: formatCount(overdueInvoices || dashboard.value.summary.overduePayments),
        }),
        metrics: [
          { label: t('preschoolDashboardPage.insights.payments.metrics.outstanding'), value: formatCurrency(outstandingBalances) },
          { label: t('preschoolDashboardPage.insights.payments.metrics.overdue'), value: formatCount(overdueInvoices || dashboard.value.summary.overduePayments) },
        ],
        sparkline: paymentSeries,
        sparklineFallback: resolveSparklineFallbackLabel(t, reportsDashboard.value.analytics?.outstandingPayments),
      },
    ]
  })

  const recentActivityItems = computed(() =>
    (dashboard.value.recentAttendance || []).slice(0, 3).map((item) => ({
      title: item.studentName || t('preschoolDashboardPage.operations.recentActivityFallback'),
      text: formatRelativeTime(
        item.attendanceDate || item.updatedAt || item.createdAt || '',
        language.value === 'KH' ? 'km-KH' : 'en-US',
        t,
      ) || (item.className || ''),
    })),
  )

  const upcomingClasses = computed(() =>
    (dashboard.value.upcomingClasses || []).slice(0, 2).map((item) => ({
      title: item.name || t('preschoolDashboardPage.operations.classFallback'),
      text: joinParts([
        item.schedule || item.scheduledTime || '',
        item.teacherDisplayName || item.teacherName || '',
      ]),
    })),
  )

  const classroomSummaryItems = computed(() => [
    { label: t('preschoolDashboardPage.operations.classroomSummary.students'), value: formatCount(dashboard.value.summary.students) },
    { label: t('preschoolDashboardPage.operations.classroomSummary.classes'), value: formatCount(dashboard.value.summary.classes) },
    { label: t('preschoolDashboardPage.operations.classroomSummary.teachers'), value: formatCount(dashboard.value.summary.teachers) },
    { label: t('preschoolDashboardPage.operations.classroomSummary.attendance'), value: formatCount(dashboard.value.summary.attendanceToday) },
  ])

  return {
    dashboard,
    reportsDashboard,
    loading,
    errorMessage,
    academicYear,
    academicTerm,
    lastUpdated,
    spotlightTitle,
    spotlightText,
    summaryCards,
    systemHealthItems,
    priorityItems,
    todayScheduleItemsForView,
    attendanceProgressCards,
    todayMissingSessionCount,
    insightCards,
    recentActivityItems,
    upcomingClasses,
    classroomSummaryItems,
    loadDashboard,
  }
}
