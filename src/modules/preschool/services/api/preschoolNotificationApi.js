import http from '@/services/http'
import { buildQueryParams, normalizePerPage, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeNotification(item = {}) {
  return {
    id: item.id ?? '',
    notificationType: normalizeText(item.notificationType || item.notification_type),
    title: normalizeText(item.title),
    body: normalizeText(item.body),
    severity: normalizeText(item.severity || 'medium'),
    status: normalizeText(item.status || 'unread'),
    targetUserId: normalizeText(item.targetUserId || item.target_user_id),
    targetRole: normalizeText(item.targetRole || item.target_role),
    sourceType: normalizeText(item.sourceType || item.source_type),
    sourceId: normalizeText(item.sourceId || item.source_id),
    preschoolStudentId: normalizeNumber(item.preschoolStudentId ?? item.preschool_student_id, null),
    preschoolClassId: normalizeNumber(item.preschoolClassId ?? item.preschool_class_id, null),
    studentName: normalizeText(item.studentName),
    className: normalizeText(item.className),
    actionRoute: normalizeText(item.actionRoute || item.action_route),
    actionParams: item.actionParams || item.action_params || {},
    workflowInstanceId: item.workflowInstanceId ?? item.workflow_instance_id ?? null,
    workflowStatus: normalizeText(item.workflowStatus || item.workflow_status),
    workflowRoute: normalizeText(item.workflowRoute || item.workflow_route),
    workflowActionParams: item.workflowActionParams || item.workflow_action_params || {},
    readAt: item.readAt || item.read_at || '',
    archivedAt: item.archivedAt || item.archived_at || '',
    createdBy: normalizeText(item.createdBy || item.created_by),
    createdAt: item.createdAt || item.created_at || '',
  }
}

function normalizeTask(item = {}) {
  return {
    id: item.id ?? '',
    taskType: normalizeText(item.taskType || item.task_type),
    title: normalizeText(item.title),
    description: normalizeText(item.description),
    priority: normalizeText(item.priority || 'normal'),
    status: normalizeText(item.status || 'open'),
    assignedToUserId: normalizeText(item.assignedToUserId || item.assigned_to_user_id),
    assignedRole: normalizeText(item.assignedRole || item.assigned_role),
    dueAt: item.dueAt || item.due_at || '',
    sourceType: normalizeText(item.sourceType || item.source_type),
    sourceId: normalizeText(item.sourceId || item.source_id),
    preschoolStudentId: normalizeNumber(item.preschoolStudentId ?? item.preschool_student_id, null),
    preschoolClassId: normalizeNumber(item.preschoolClassId ?? item.preschool_class_id, null),
    studentName: normalizeText(item.studentName),
    className: normalizeText(item.className),
    actionRoute: normalizeText(item.actionRoute || item.action_route),
    actionParams: item.actionParams || item.action_params || {},
    workflowInstanceId: item.workflowInstanceId ?? item.workflow_instance_id ?? null,
    workflowStatus: normalizeText(item.workflowStatus || item.workflow_status),
    workflowRoute: normalizeText(item.workflowRoute || item.workflow_route),
    workflowActionParams: item.workflowActionParams || item.workflow_action_params || {},
    createdBy: normalizeText(item.createdBy || item.created_by),
    completedBy: normalizeText(item.completedBy || item.completed_by),
    completedAt: item.completedAt || item.completed_at || '',
    cancelledBy: normalizeText(item.cancelledBy || item.cancelled_by),
    cancelledAt: item.cancelledAt || item.cancelled_at || '',
    createdAt: item.createdAt || item.created_at || '',
  }
}

function normalizeNotificationSummary(summary = {}) {
  return {
    total: normalizeNumber(summary.total, 0) || 0,
    unread: normalizeNumber(summary.unread, 0) || 0,
    read: normalizeNumber(summary.read, 0) || 0,
    archived: normalizeNumber(summary.archived, 0) || 0,
    critical: normalizeNumber(summary.critical, 0) || 0,
    byType: Array.isArray(summary.byType) ? summary.byType.map((item = {}) => ({
      notificationType: normalizeText(item.notificationType || item.notification_type),
      total: normalizeNumber(item.total, 0) || 0,
    })) : [],
    bySeverity: Array.isArray(summary.bySeverity) ? summary.bySeverity.map((item = {}) => ({
      severity: normalizeText(item.severity),
      total: normalizeNumber(item.total, 0) || 0,
    })) : [],
  }
}

function normalizeTaskSummary(summary = {}) {
  return {
    total: normalizeNumber(summary.total, 0) || 0,
    open: normalizeNumber(summary.open, 0) || 0,
    inProgress: normalizeNumber(summary.inProgress, 0) || 0,
    completed: normalizeNumber(summary.completed, 0) || 0,
    cancelled: normalizeNumber(summary.cancelled, 0) || 0,
    overdue: normalizeNumber(summary.overdue, 0) || 0,
    today: normalizeNumber(summary.today, 0) || 0,
    byType: Array.isArray(summary.byType) ? summary.byType.map((item = {}) => ({
      taskType: normalizeText(item.taskType || item.task_type),
      total: normalizeNumber(item.total, 0) || 0,
    })) : [],
    byPriority: Array.isArray(summary.byPriority) ? summary.byPriority.map((item = {}) => ({
      priority: normalizeText(item.priority),
      total: normalizeNumber(item.total, 0) || 0,
    })) : [],
  }
}

function buildNotificationQuery(filters = {}) {
  return buildQueryParams({
    page: filters.page ?? 1,
    per_page: normalizePerPage(filters.perPage ?? filters.per_page, 10, 100),
    status: filters.status || undefined,
    type: filters.type || filters.notificationType || undefined,
    severity: filters.severity || undefined,
    search: filters.search || undefined,
    student_id: filters.studentId || filters.student_id || undefined,
    class_id: filters.classId || filters.class_id || undefined,
  })
}

function buildNotificationSummaryQuery(filters = {}) {
  return buildQueryParams({
    status: filters.status || undefined,
    type: filters.type || filters.notificationType || undefined,
    severity: filters.severity || undefined,
    search: filters.search || undefined,
    student_id: filters.studentId || filters.student_id || undefined,
    class_id: filters.classId || filters.class_id || undefined,
  })
}

function buildTaskQuery(filters = {}) {
  return buildQueryParams({
    page: filters.page ?? 1,
    per_page: normalizePerPage(filters.perPage ?? filters.per_page, 10, 100),
    status: filters.status || undefined,
    type: filters.type || filters.taskType || undefined,
    priority: filters.priority || undefined,
    search: filters.search || undefined,
    student_id: filters.studentId || filters.student_id || undefined,
    class_id: filters.classId || filters.class_id || undefined,
  })
}

function buildTaskSummaryQuery(filters = {}) {
  return buildQueryParams({
    status: filters.status || undefined,
    type: filters.type || filters.taskType || undefined,
    priority: filters.priority || undefined,
    search: filters.search || undefined,
    student_id: filters.studentId || filters.student_id || undefined,
    class_id: filters.classId || filters.class_id || undefined,
  })
}

function unwrapListResponse(response, itemNormalizer, summaryNormalizer) {
  const payload = unwrapApiData(response) || {}

  return {
    items: Array.isArray(payload.items) ? payload.items.map(itemNormalizer) : [],
    summary: summaryNormalizer(payload.summary || {}),
    pagination: payload.pagination || null,
  }
}

export async function fetchPreschoolNotifications(filters = {}, options = {}) {
  const response = await http.get('/preschool/notifications', {
    params: buildNotificationQuery(filters),
    signal: options.signal,
  })

  return unwrapListResponse(response, normalizeNotification, normalizeNotificationSummary)
}

export async function fetchPreschoolNotificationSummary(filters = {}, options = {}) {
  const response = await http.get('/preschool/notifications/summary', {
    params: buildNotificationSummaryQuery(filters),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}

  return normalizeNotificationSummary(payload)
}

export async function markPreschoolNotificationRead(id) {
  const response = await http.patch(`/preschool/notifications/${id}/read`)

  return unwrapApiData(response)
}

export async function archivePreschoolNotification(id) {
  const response = await http.patch(`/preschool/notifications/${id}/archive`)

  return unwrapApiData(response)
}

export async function fetchPreschoolAutomationTasks(filters = {}, options = {}) {
  const response = await http.get('/preschool/automation-tasks', {
    params: buildTaskQuery(filters),
    signal: options.signal,
  })

  return unwrapListResponse(response, normalizeTask, normalizeTaskSummary)
}

export async function fetchPreschoolAutomationTaskSummary(filters = {}, options = {}) {
  const response = await http.get('/preschool/automation-tasks/summary', {
    params: buildTaskSummaryQuery(filters),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}

  return normalizeTaskSummary(payload)
}

export async function completePreschoolAutomationTask(id) {
  const response = await http.patch(`/preschool/automation-tasks/${id}/complete`)

  return unwrapApiData(response)
}

export async function cancelPreschoolAutomationTask(id) {
  const response = await http.patch(`/preschool/automation-tasks/${id}/cancel`)

  return unwrapApiData(response)
}

export async function assignPreschoolAutomationTask(id, payload = {}) {
  const response = await http.patch(`/preschool/automation-tasks/${id}/assign`, {
    assigned_to_user_id: payload.assignedToUserId || payload.assigned_to_user_id || null,
    assigned_role: payload.assignedRole || payload.assigned_role || null,
  })

  return unwrapApiData(response)
}

export async function runPreschoolDailyAutomationChecks() {
  const response = await http.post('/preschool/automation/run-daily-checks')

  return unwrapApiData(response)
}
