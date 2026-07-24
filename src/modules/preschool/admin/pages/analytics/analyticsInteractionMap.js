const ANALYTICS_FILTER_KEYS = [
  'academicYearId',
  'classId',
  'teacherUserId',
  'dateFrom',
  'dateTo',
  'status',
]

const ANALYTICS_DETAIL_ROUTE_NAMES = {
  attendance: 'dashboard-preschool-admin-analytics-attendance',
  sessions: 'dashboard-preschool-admin-analytics-sessions',
  alerts: 'dashboard-preschool-admin-analytics-alerts',
  students: 'dashboard-preschool-admin-analytics-students',
  teachers: 'dashboard-preschool-admin-analytics-teachers',
  guardianContacts: 'dashboard-preschool-admin-analytics-guardian-contacts',
}

const DEFAULT_QUERY_KEYS = {
  academicYearId: 'academic_year_id',
  classId: 'class_id',
  teacherUserId: 'teacher_user_id',
  dateFrom: 'date_from',
  dateTo: 'date_to',
  status: 'status',
}

const PRESET_KEYS = ['today', 'thisWeek', 'thisMonth', 'currentAcademicYear']

function normalizeText(value) {
  return String(value ?? '').trim()
}

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

export function createAnalyticsFilters(query = {}) {
  return {
    academicYearId: normalizeText(query.academicYearId || query.academic_year_id || ''),
    classId: normalizeText(query.classId || query.class_id || ''),
    teacherUserId: normalizeText(query.teacherUserId || query.teacher_user_id || ''),
    dateFrom: normalizeText(query.dateFrom || query.date_from || ''),
    dateTo: normalizeText(query.dateTo || query.date_to || ''),
    status: normalizeText(query.status || ''),
  }
}

export function createAnalyticsQuery(filters = {}, overrides = {}) {
  const query = {}

  for (const key of ANALYTICS_FILTER_KEYS) {
    const queryKey = DEFAULT_QUERY_KEYS[key]
    const value = overrides[key] ?? filters[key]
    if (normalizeText(value)) {
      query[queryKey] = String(value)
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (!ANALYTICS_FILTER_KEYS.includes(key) && normalizeText(value)) {
      query[key] = String(value)
    }
  }

  return query
}

export function createAnalyticsRoute(name, filters = {}, overrides = {}) {
  return {
    name,
    query: createAnalyticsQuery(filters, overrides),
  }
}

export function createAnalyticsPresetFilters(presetKey, baseFilters = {}, date = new Date()) {
  const today = formatDate(date)

  switch (presetKey) {
    case 'today':
      return {
        ...baseFilters,
        dateFrom: today,
        dateTo: today,
      }
    case 'thisWeek': {
      const start = new Date(date)
      const day = start.getDay() || 7
      start.setDate(start.getDate() - day + 1)
      return {
        ...baseFilters,
        dateFrom: formatDate(start),
        dateTo: today,
      }
    }
    case 'thisMonth': {
      const start = new Date(date)
      start.setDate(1)
      return {
        ...baseFilters,
        dateFrom: formatDate(start),
        dateTo: today,
      }
    }
    case 'currentAcademicYear':
      return {
        ...baseFilters,
      }
    default:
      return {
        ...baseFilters,
      }
  }
}

export function getAnalyticsDetailRouteName(domain) {
  return ANALYTICS_DETAIL_ROUTE_NAMES[domain] || null
}

export function resolveAnalyticsMetricTo(domain, metricKey, filters = {}) {
  const routeName = getAnalyticsDetailRouteName(domain)
  if (!routeName) {
    return null
  }

  const metricRouteMap = {
    attendanceRate: { name: routeName },
    sessionsGenerated: { name: routeName },
    sessionsCompleted: domain === 'sessions' ? { name: routeName, query: { status: 'completed' } } : null,
    missingSessions: domain === 'sessions' ? { name: routeName, query: { status: 'missing' } } : null,
    openAlerts: { name: ANALYTICS_DETAIL_ROUTE_NAMES.alerts },
    guardianContacts: { name: ANALYTICS_DETAIL_ROUTE_NAMES.guardianContacts },
    activeStudents: { name: ANALYTICS_DETAIL_ROUTE_NAMES.students },
    teacherUtilization: { name: ANALYTICS_DETAIL_ROUTE_NAMES.teachers },
    assignedClasses: { name: ANALYTICS_DETAIL_ROUTE_NAMES.teachers },
  }

  const targetName = metricRouteMap[metricKey]
  if (!targetName) {
    return null
  }

  return createAnalyticsRoute(targetName.name, filters, targetName.query || {})
}

function resolveDateRangeFromItem(item) {
  const date = item?.date || item?.day || item?.label || item?.name
  if (!normalizeText(date)) {
    return null
  }

  return {
    dateFrom: date,
    dateTo: date,
  }
}

export function resolveAnalyticsBreakdownTo(domain, item = {}, filters = {}) {
  const routeName = getAnalyticsDetailRouteName(domain)
  if (!routeName) {
    return null
  }

  if (normalizeText(item.classId || item.class_id)) {
    return createAnalyticsRoute(routeName, filters, { classId: item.classId || item.class_id })
  }

  if (normalizeText(item.teacherUserId || item.teacher_user_id)) {
    return createAnalyticsRoute(routeName, filters, { teacherUserId: item.teacherUserId || item.teacher_user_id })
  }

  if (normalizeText(item.status)) {
    return createAnalyticsRoute(routeName, filters, { status: item.status })
  }

  const dateRange = resolveDateRangeFromItem(item)
  if (dateRange) {
    return createAnalyticsRoute(routeName, filters, dateRange)
  }

  return null
}

export function resolveAnalyticsChartItemTo(domain, item = {}, filters = {}) {
  const routeName = getAnalyticsDetailRouteName(domain)
  if (!routeName) {
    return null
  }

  const dateRange = resolveDateRangeFromItem(item)
  if (dateRange) {
    return createAnalyticsRoute(routeName, filters, dateRange)
  }

  return resolveAnalyticsBreakdownTo(domain, item, filters)
}

export function resolveAnalyticsDatasetRowTo(domain, sectionKey, row = {}, filters = {}) {
  const routeBySection = {
    attendance: {
      topClasses: 'dashboard-preschool-admin-class-details',
      topStudents: 'dashboard-preschool-admin-student-profile',
    },
    sessions: {
      recentSessions: 'dashboard-preschool-admin-attendance-session-details',
      missingSessions: 'dashboard-preschool-admin-attendance-session-details',
    },
    alerts: {
      recentAlerts: 'dashboard-preschool-admin-attendance-alerts',
    },
    students: {
      topStudents: 'dashboard-preschool-admin-student-profile',
    },
    teachers: {
      teachers: 'dashboard-preschool-admin-teacher-view',
    },
    guardianContacts: {
      recentCommunications: 'dashboard-preschool-admin-guardian-communications',
    },
  }

  const routeName = routeBySection?.[domain]?.[sectionKey]
  if (!routeName) {
    return null
  }

  const rowId =
    row.studentId
    || row.student_id
    || row.classId
    || row.class_id
    || row.teacherUserId
    || row.teacher_user_id
    || row.sessionId
    || row.session_id
    || row.alertId
    || row.alert_id
    || row.id

  if (!normalizeText(rowId)) {
    return null
  }

  const queryKeyByRoute = {
    'dashboard-preschool-admin-student-profile': { studentId: row.studentId || row.student_id || row.id },
    'dashboard-preschool-admin-class-details': { id: row.classId || row.class_id || row.id },
    'dashboard-preschool-admin-teacher-view': { id: row.teacherUserId || row.teacher_user_id || row.id },
    'dashboard-preschool-admin-attendance-session-details': { id: row.sessionId || row.session_id || row.id },
    'dashboard-preschool-admin-attendance-alerts': { id: row.alertId || row.alert_id || row.id },
    'dashboard-preschool-admin-guardian-communications': { sourceId: row.id },
  }

  return createAnalyticsRoute(routeName, filters, queryKeyByRoute[routeName] || {})
}

export function createAnalyticsDetailBreadcrumbLabels(t) {
  return {
    filteredBy: t('preschoolAnalyticsPage.filteredBy'),
    appliedFilters: t('preschoolAnalyticsPage.appliedFilters'),
    clearFilters: t('preschoolAnalyticsPage.clearFilters'),
    compareMode: t('preschoolAnalyticsPage.compareMode'),
    comparisonUnavailable: t('preschoolAnalyticsPage.comparisonUnavailable'),
    savedFilters: t('preschoolAnalyticsPage.savedFilters'),
    drillDown: t('preschoolAnalyticsPage.drillDown'),
    noDrillDownAvailable: t('preschoolAnalyticsPage.noDrillDownAvailable'),
    openDetail: t('preschoolAnalyticsPage.openDetail'),
  }
}

export function createAnalyticsPresetLabels(t) {
  return PRESET_KEYS.map((key) => ({
    key,
    label: t(`preschoolAnalyticsPage.${key}`),
  }))
}
