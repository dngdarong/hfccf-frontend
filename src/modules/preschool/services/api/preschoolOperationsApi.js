import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function toCamelCase(key) {
  return String(key).replace(/[-_](\w)/g, (_, letter) => letter.toUpperCase())
}

function normalizePrimitive(value) {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizePrimitive(item))
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [toCamelCase(key), normalizePrimitive(entry)]),
  )
}

const QUICK_ACTION_LABEL_KEYS = {
  'dashboard-preschool-admin-attendance': 'takeAttendance',
  'dashboard-preschool-admin-attendance-history': 'viewSession',
  'dashboard-preschool-admin-attendance-alerts': 'openAlerts',
  'dashboard-preschool-admin-students': 'viewDetails',
  'dashboard-preschool-admin-guardian-communications': 'viewDetails',
  'dashboard-preschool-admin-health': 'viewDetails',
  'dashboard-preschool-admin-reports-assessments': 'reviewAssessment',
  'dashboard-preschool-admin-payment': 'viewInvoice',
  'dashboard-preschool-admin-reports': 'viewReports',
}

function resolveQuickActionLabelKey(routeName, fallback = 'viewDetails') {
  return QUICK_ACTION_LABEL_KEYS[normalizeText(routeName)] || fallback
}

function normalizeQuickAction(action = {}) {
  const routeName = normalizeText(action.routeName || action.route_name)

  return {
    ...normalizePrimitive(action),
    label: normalizeText(action.label || action.title),
    routeName,
    labelKey: normalizeText(action.labelKey || resolveQuickActionLabelKey(routeName)),
  }
}

function normalizeOperationsBundle(payload = {}) {
  const operationsPayload = isPlainObject(payload.operations) ? payload.operations : payload
  const normalizedPayload = normalizePrimitive(operationsPayload)
  const workflowsPayload = isPlainObject(normalizedPayload.workflows) ? normalizedPayload.workflows : {}

  return {
    scope: normalizeText(payload.scope || operationsPayload.scope),
    summary: normalizedPayload.summary || {},
    today: normalizedPayload.today || {},
    attendance: normalizedPayload.attendance || {},
    sessions: normalizedPayload.sessions || {},
    alerts: normalizedPayload.alerts || {},
    guardianCommunications: normalizedPayload.guardianCommunications || {},
    health: normalizedPayload.health || {},
    payments: normalizedPayload.payments || {},
    assessments: normalizedPayload.assessments || {},
    teachers: normalizedPayload.teachers || {},
    students: normalizedPayload.students || {},
    risks: normalizedPayload.risks || {},
    workflows: {
      summary: workflowsPayload.summary || {},
      items: Array.isArray(workflowsPayload.items) ? workflowsPayload.items : [],
      recentActivity: Array.isArray(workflowsPayload.recentActivity) ? workflowsPayload.recentActivity : [],
    },
    timeline: Array.isArray(normalizedPayload.timeline) ? normalizedPayload.timeline : [],
    quickActions: Array.isArray(normalizedPayload.quickActions)
      ? normalizedPayload.quickActions.map(normalizeQuickAction)
      : [],
    generatedAt: normalizeText(
      payload.generatedAt
      || payload.generated_at
      || normalizedPayload.generatedAt
      || '',
    ),
  }
}

function pickFilterValue(filters = {}, snakeKey, camelKey) {
  return filters[snakeKey] ?? filters[camelKey] ?? filters[toCamelCase(snakeKey)] ?? undefined
}

function buildOperationsQuery(filters = {}) {
  return buildQueryParams({
    academic_year_id: pickFilterValue(filters, 'academic_year_id', 'academicYearId'),
    class_id: pickFilterValue(filters, 'class_id', 'classId'),
    teacher_user_id: pickFilterValue(filters, 'teacher_user_id', 'teacherUserId'),
    date_from: pickFilterValue(filters, 'date_from', 'dateFrom'),
    date_to: pickFilterValue(filters, 'date_to', 'dateTo'),
    status: pickFilterValue(filters, 'status', 'status'),
  })
}

async function fetchOperations(path, filters = {}, options = {}) {
  const response = await http.get(path, {
    params: buildOperationsQuery(filters),
    signal: options.signal,
  })

  return normalizeOperationsBundle(unwrapApiData(response) || {})
}

export async function fetchPreschoolOperationsDashboard(filters = {}, options = {}) {
  return fetchOperations('/preschool/operations/dashboard', filters, options)
}

export { buildOperationsQuery, normalizeOperationsBundle }
