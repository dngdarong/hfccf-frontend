import {
  dismissNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  undismissNotification,
} from '@/modules/notifications/services/notificationsApi'
import { resolveUnreadNotificationCount } from '@/modules/notifications/services/notificationMappers'
import {
  archivePreschoolNotification,
  cancelPreschoolAutomationTask,
  completePreschoolAutomationTask,
  fetchPreschoolAutomationTaskSummary,
  fetchPreschoolAutomationTasks,
  fetchPreschoolNotificationSummary,
  fetchPreschoolNotifications,
  markPreschoolNotificationRead,
} from '@/modules/preschool/services/api/preschoolNotificationApi'
import {
  approvePreschoolWorkflowApproval,
  cancelPreschoolWorkflowApproval,
  fetchPreschoolWorkflowApprovals,
  rejectPreschoolWorkflowApproval,
  returnPreschoolWorkflowApproval,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeDate(value) {
  return String(value ?? '').trim()
}

function normalizeRouteParams(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }

  return {}
}

function normalizeUnifiedItem(item = {}, defaults = {}) {
  return {
    id: item.id ?? defaults.id ?? '',
    module: normalizeText(defaults.module || item.module || item.sourceModule || 'global'),
    itemType: normalizeText(defaults.itemType || item.itemType || item.type || 'notification'),
    title: normalizeText(item.title || item.subject || defaults.title),
    summary: normalizeText(
      item.summary ||
        item.message ||
        item.body ||
        item.description ||
        defaults.summary,
    ),
    message: normalizeText(
      item.message ||
        item.body ||
        item.description ||
        item.summary ||
        defaults.summary,
    ),
    severity: normalizeText(defaults.severity || item.severity || 'medium'),
    status: normalizeText(defaults.status || item.status || 'open'),
    priority: normalizeText(defaults.priority || item.priority || 'normal'),
    dueAt: normalizeDate(defaults.dueAt || item.dueAt || item.due_at),
    createdAt: normalizeDate(defaults.createdAt || item.createdAt || item.created_at),
    readAt: normalizeDate(defaults.readAt || item.readAt || item.read_at),
    actionRouteName: normalizeText(
      defaults.actionRouteName ||
        item.actionRouteName ||
        item.action_route_name ||
        item.workflowRoute ||
        item.workflow_route ||
        item.sourceRouteName ||
        item.source_route_name,
    ),
    actionRouteParams: normalizeRouteParams(
      defaults.actionRouteParams ||
        item.actionRouteParams ||
        item.action_route_params ||
        item.workflowActionParams ||
        item.workflow_action_params ||
        item.sourceRouteParams ||
        item.source_route_params,
    ),
    sourceType: normalizeText(defaults.sourceType || item.sourceType || item.source_type),
    sourceId: normalizeText(defaults.sourceId || item.sourceId || item.source_id),
    canAct: Boolean(defaults.canAct),
    raw: item,
  }
}

function normalizePagination(payload = {}) {
  const pagination = payload.pagination || payload.meta || {}

  return {
    currentPage: normalizeNumber(pagination.currentPage || pagination.current_page || payload.page, 1),
    lastPage: normalizeNumber(pagination.lastPage || pagination.last_page || payload.lastPage, 1),
    perPage: normalizeNumber(pagination.perPage || pagination.per_page || payload.perPage, 10),
    total: normalizeNumber(pagination.total || payload.total, 0),
  }
}

function normalizeNotificationResponse(response = {}) {
  return {
    unreadCount: normalizeNumber(response.unreadCount || response.count || 0, 0),
    items: Array.isArray(response.items)
      ? response.items.map((item) => normalizeUnifiedItem(item, {
        module: 'global',
        itemType: 'notification',
        severity: item.severity || 'medium',
        status: item.dismissed ? 'dismissed' : item.read ? 'read' : 'unread',
        summary: item.message,
        readAt: item.readAt || item.read_at || '',
        canAct: true,
      }))
      : [],
    pagination: normalizePagination(response),
  }
}

function normalizeAlertItem(item = {}) {
  return normalizeUnifiedItem(item, {
    module: 'preschool',
    itemType: 'alert',
    summary: item.body,
    status: normalizeText(item.status || 'unread'),
    severity: normalizeText(item.severity || 'medium'),
    readAt: item.readAt || item.read_at || '',
    actionRouteName: normalizeText(item.actionRoute || item.action_route),
    actionRouteParams: normalizeRouteParams(item.actionParams || item.action_params),
    canAct: true,
  })
}

function normalizeTaskItem(item = {}) {
  return normalizeUnifiedItem(item, {
    module: 'preschool',
    itemType: 'task',
    summary: item.description,
    status: normalizeText(item.status || 'open'),
    priority: normalizeText(item.priority || 'normal'),
    dueAt: item.dueAt || item.due_at || '',
    actionRouteName: normalizeText(item.actionRoute || item.action_route),
    actionRouteParams: normalizeRouteParams(item.actionParams || item.action_params),
    sourceType: item.sourceType || item.source_type,
    sourceId: item.sourceId || item.source_id,
    canAct: true,
  })
}

function normalizeApprovalItem(item = {}) {
  const instance = item.instance || {}

  return normalizeUnifiedItem(item, {
    module: 'preschool',
    itemType: 'approval',
    summary: item.decisionNotes || item.step?.name || instance.workflowDefinitionName || instance.sourceLabel || '',
    status: normalizeText(item.status || 'pending'),
    priority: normalizeText(instance.priority || item.priority || 'normal'),
    dueAt: item.dueAt || item.due_at || '',
    actionRouteName: normalizeText(instance.sourceRouteName || instance.source_route_name || 'dashboard-preschool-admin-workflow-details'),
    actionRouteParams: normalizeRouteParams(instance.sourceRouteParams || instance.source_route_params || { id: item.workflowInstanceId || instance.id }),
    sourceType: item.sourceType || instance.sourceType || instance.source_type,
    sourceId: item.sourceId || instance.sourceId || instance.source_id || item.workflowInstanceId || instance.id,
    canAct: Boolean(item.status === 'pending'),
  })
}

function normalizeListResponse(payload = {}, itemNormalizer) {
  const items = Array.isArray(payload.items) ? payload.items : []

  return {
    items: items.map((item) => itemNormalizer(item)),
    summary: payload.summary || {},
    pagination: normalizePagination(payload),
  }
}

export async function loadUnifiedNotifications(filters = {}, options = {}) {
  const [notificationsResponse, unreadCountResponse] = await Promise.all([
    fetchNotifications(filters, options),
    fetchUnreadCount(),
  ])

  return normalizeNotificationResponse({
    ...notificationsResponse,
    unreadCount: resolveUnreadNotificationCount(unreadCountResponse),
  })
}

export async function loadUnifiedAlerts(filters = {}, options = {}) {
  const [summaryResponse, listResponse] = await Promise.all([
    fetchPreschoolNotificationSummary(filters, options),
    fetchPreschoolNotifications(filters, options),
  ])

  return normalizeListResponse({
    ...listResponse,
    summary: summaryResponse,
  }, normalizeAlertItem)
}

export async function loadUnifiedTasks(filters = {}, options = {}) {
  const [summaryResponse, listResponse] = await Promise.all([
    fetchPreschoolAutomationTaskSummary(filters, options),
    fetchPreschoolAutomationTasks(filters, options),
  ])

  return normalizeListResponse({
    ...listResponse,
    summary: summaryResponse,
  }, normalizeTaskItem)
}

export async function loadUnifiedApprovals(filters = {}, options = {}) {
  const response = await fetchPreschoolWorkflowApprovals(filters, options)

  return normalizeListResponse(response, normalizeApprovalItem)
}

export async function markUnifiedNotificationRead(id) {
  return markNotificationAsRead(id)
}

export async function markAllUnifiedNotificationsRead() {
  return markAllNotificationsAsRead()
}

export async function dismissUnifiedNotification(id) {
  return dismissNotification(id)
}

export async function undismissUnifiedNotification(id) {
  return undismissNotification(id)
}

export async function markUnifiedAlertRead(id) {
  return markPreschoolNotificationRead(id)
}

export async function archiveUnifiedAlert(id) {
  return archivePreschoolNotification(id)
}

export async function completeUnifiedTask(id) {
  return completePreschoolAutomationTask(id)
}

export async function cancelUnifiedTask(id) {
  return cancelPreschoolAutomationTask(id)
}

export async function approveUnifiedWorkflowApproval(id, payload = {}) {
  return approvePreschoolWorkflowApproval(id, payload)
}

export async function rejectUnifiedWorkflowApproval(id, payload = {}) {
  return rejectPreschoolWorkflowApproval(id, payload)
}

export async function returnUnifiedWorkflowApproval(id, payload = {}) {
  return returnPreschoolWorkflowApproval(id, payload)
}

export async function cancelUnifiedWorkflowApproval(id, payload = {}) {
  return cancelPreschoolWorkflowApproval(id, payload)
}

export {
  normalizeAlertItem,
  normalizeApprovalItem,
  normalizeNotificationResponse,
  normalizeTaskItem,
  normalizeUnifiedItem,
}
