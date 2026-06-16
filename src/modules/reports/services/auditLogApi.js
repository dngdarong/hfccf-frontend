import http from '@/services/http'
import { buildQueryParams, toPositiveInteger, unwrapApiData } from '@/services/api'

const DEFAULT_PER_PAGE = 20
const MAX_PER_PAGE = 100

function normalizePerPage(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PER_PAGE
  }

  return Math.min(Math.floor(parsed), MAX_PER_PAGE)
}

function normalizeParams(params = {}) {
  return buildQueryParams({
    page: toPositiveInteger(params.page, 1),
    per_page: normalizePerPage(params.perPage ?? params.per_page),
    domain: params.domain,
    action: params.action,
    entity_type: params.entityType ?? params.entity_type,
    actor_user_id: params.actorUserId ?? params.actor_user_id,
    search: params.search,
    date_from: params.dateFrom ?? params.date_from,
    date_to: params.dateTo ?? params.date_to,
  })
}

function normalizeActor(actor = {}) {
  if (!actor || typeof actor !== 'object') {
    return null
  }

  const firstName = String(actor.first_name || actor.firstName || '').trim()
  const lastName = String(actor.last_name || actor.lastName || '').trim()

  return {
    ...actor,
    id: actor.id ?? actor.user_id ?? actor.actor_user_id ?? '',
    name: String(actor.name || `${firstName} ${lastName}`.trim() || actor.email || '').trim(),
    firstName,
    lastName,
  }
}

function normalizeAuditLogItem(item = {}) {
  return {
    ...item,
    id: item.id ?? item.uuid ?? item.key ?? '',
    actorUserId: item.actorUserId ?? item.actor_user_id ?? item.actor?.id ?? '',
    domain: String(item.domain || '').trim().toLowerCase(),
    action: String(item.action || '').trim().toLowerCase(),
    entityType: String(item.entityType || item.entity_type || '').trim(),
    entityId: item.entityId ?? item.entity_id ?? null,
    entityLabel: String(item.entityLabel || item.entity_label || '').trim(),
    oldValues: item.oldValues ?? item.old_values ?? null,
    newValues: item.newValues ?? item.new_values ?? null,
    metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
    ipAddress: String(item.ipAddress || item.ip_address || '').trim(),
    userAgent: String(item.userAgent || item.user_agent || '').trim(),
    createdAt: item.createdAt || item.created_at || '',
    actor: normalizeActor(item.actor),
  }
}

function getPayloadCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.auditLogs)) return payload.auditLogs
  if (Array.isArray(payload.data)) return payload.data

  return []
}

function getPaginationMeta(payload, fallbackPage, fallbackPerPage, totalItems) {
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
  const perPage = toPositiveInteger(meta.per_page || meta.perPage || payload.per_page || payload.perPage, fallbackPerPage)
  const total = toPositiveInteger(meta.total || payload.total, totalItems)
  const lastPage = toPositiveInteger(
    meta.last_page || meta.lastPage || payload.last_page || payload.lastPage,
    Math.max(Math.ceil(total / perPage), 1),
  )

  return {
    page,
    perPage,
    total,
    lastPage,
  }
}

export function normalizeAuditLogResponse(payload, fallbackPage = 1, fallbackPerPage = DEFAULT_PER_PAGE) {
  const items = getPayloadCollection(payload).map(normalizeAuditLogItem)
  const pagination = getPaginationMeta(payload, fallbackPage, fallbackPerPage, items.length)

  return {
    items,
    pagination,
  }
}

export async function fetchAuditLogs(params = {}, options = {}) {
  const response = await http.get('/audit-logs', {
    params: normalizeParams(params),
    signal: options.signal,
  })

  return normalizeAuditLogResponse(unwrapApiData(response), params.page || 1, params.perPage || params.per_page || DEFAULT_PER_PAGE)
}