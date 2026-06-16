import { toPositiveInteger } from '@/services/api'

const DEFAULT_PER_PAGE = 10

export function normalizePerPage(value, fallback = DEFAULT_PER_PAGE, max = 100) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback
  }

  return Math.min(Math.floor(numeric), max)
}

export function normalizeNotificationItem(item = {}) {
  const status = String(item.status || '').trim().toLowerCase()
  const type = String(item.type || item.level || item.category || 'system')
    .trim()
    .toLowerCase()
  const moduleValue = String(item.module || item.domain || 'global').trim().toLowerCase()

  return {
    ...item,
    id: item.id ?? item.uuid ?? item.key ?? '',
    type,
    module: moduleValue,
    title: String(item.title || item.subject || '').trim(),
    message: String(item.message || item.body || item.content || '').trim(),
    actionUrl: String(item.action_url || item.actionUrl || '').trim(),
    read: Boolean(
      item.read ||
        item.is_read ||
        item.read_at ||
        item.readAt ||
        status === 'read',
    ),
    dismissed: Boolean(
      item.dismissed ||
        item.dismissed_at ||
        item.dismissedAt ||
        status === 'dismissed',
    ),
    createdAt:
      item.created_at ||
      item.createdAt ||
      item.sent_at ||
      item.timestamp ||
      item.created ||
      '',
    metadata: item.metadata || {},
  }
}

export function getNotificationCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.notifications)) return payload.notifications
  if (Array.isArray(payload.data)) return payload.data

  return []
}

export function normalizeNotificationPagination(payload, fallbackPage, fallbackPerPage, totalItems) {
  if (!payload || typeof payload !== 'object') {
    const total = totalItems

    return {
      page: fallbackPage,
      perPage: fallbackPerPage,
      total,
      lastPage: Math.max(Math.ceil(total / fallbackPerPage), 1),
    }
  }

  const meta = payload.meta || payload.pagination || payload
  const page = toPositiveInteger(meta.current_page || meta.page || payload.page, fallbackPage)
  const perPage = normalizePerPage(
    meta.per_page || meta.perPage || payload.per_page || payload.perPage,
    fallbackPerPage,
  )
  const total = toPositiveInteger(meta.total || payload.total, totalItems)
  const lastPage = toPositiveInteger(
    meta.last_page ||
      meta.lastPage ||
      payload.last_page ||
      payload.lastPage,
    Math.max(Math.ceil(total / perPage), 1),
  )

  return {
    page,
    perPage,
    total,
    lastPage,
  }
}

export function normalizeNotificationResponse(payload, fallbackPage, fallbackPerPage) {
  const items = getNotificationCollection(payload).map(normalizeNotificationItem)
  const pagination = normalizeNotificationPagination(payload, fallbackPage, fallbackPerPage, items.length)

  return {
    items,
    pagination,
  }
}

export function resolveUnreadNotificationCount(payload) {
  if (typeof payload === 'number') return payload
  if (typeof payload === 'string' && payload.trim()) return Number(payload)

  if (!payload || typeof payload !== 'object') return 0

  const candidate =
    payload.count ??
    payload.unreadCount ??
    payload.unread_count ??
    payload.total ??
    payload.data?.count ??
    payload.data?.unreadCount ??
    payload.data?.unread_count ??
    0

  return Number(candidate) || 0
}
