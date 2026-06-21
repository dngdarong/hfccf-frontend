import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeList(items = []) {
  return Array.isArray(items) ? items.map((item) => ({
    ...item,
    title: normalizeText(item.title || item.module || item.eventType || item.entityType),
    label: normalizeText(item.label || item.severity || item.action || item.name),
  })) : []
}

export function normalizeGovernanceDashboard(payload = {}) {
  const dashboard = payload.dashboard || payload
  const security = dashboard.security || dashboard.security_summary || {}
  const audit = dashboard.audit || dashboard.audit_summary || {}
  const risk = dashboard.risk || dashboard.risk_summary || {}
  const configuration = dashboard.configuration || dashboard.configuration_summary || {}
  return {
    securitySummary: {
      failedLoginsToday: normalizeNumber(security.failed_logins_today ?? dashboard.failed_logins_today),
      passwordResets: normalizeNumber(security.password_resets ?? dashboard.password_resets),
      activeSecurityEvents: normalizeNumber(security.active_security_events ?? dashboard.active_security_events),
      criticalEvents: normalizeNumber(security.critical_events ?? dashboard.critical_events),
      recentEvents: normalizeList(security.recent_events ?? security.recent_security_events ?? dashboard.recent_events),
    },
    auditSummary: {
      auditEventsToday: normalizeNumber(audit.audit_events_today ?? dashboard.audit_events_today),
      auditEventsThisMonth: normalizeNumber(audit.audit_events_this_month ?? dashboard.audit_events_this_month),
      topModules: normalizeList(audit.top_modules ?? dashboard.top_modules),
      recentEvents: normalizeList(audit.recent_events ?? dashboard.recent_audit_events ?? dashboard.recent_events),
    },
    riskSummary: {
      atRiskStudents: normalizeNumber(risk.at_risk_students ?? dashboard.at_risk_students),
      overduePayments: normalizeNumber(risk.overdue_payments ?? dashboard.overdue_payments),
      openHealthAlerts: normalizeNumber(risk.open_health_alerts ?? dashboard.open_health_alerts),
      openGuardianIssues: normalizeNumber(risk.open_guardian_issues ?? dashboard.open_guardian_issues),
    },
    configurationSummary: {
      changesToday: normalizeNumber(configuration.changes_today ?? dashboard.changes_today),
      changesThisMonth: normalizeNumber(configuration.changes_this_month ?? dashboard.changes_this_month),
      lastConfigurationUpdate: normalizeText(configuration.last_configuration_update ?? dashboard.last_configuration_update),
      recentChanges: normalizeList(configuration.recent_changes ?? configuration.recent_configuration_changes ?? dashboard.recent_changes),
      previousConfiguration: configuration.previous_configuration ?? dashboard.previous_configuration ?? null,
      latestConfiguration: configuration.latest_configuration ?? dashboard.latest_configuration ?? null,
    },
    generatedAt: dashboard.generated_at || dashboard.generatedAt || '',
    raw: payload,
  }
}

export function normalizeAuditLog(item = {}) {
  return {
    id: item.id,
    eventType: normalizeText(item.eventType || item.event_type),
    module: normalizeText(item.module),
    entityType: normalizeText(item.entityType || item.entity_type),
    entityId: normalizeText(item.entityId || item.entity_id),
    title: normalizeText(item.title || item.action || item.eventType || item.event_type),
    description: normalizeText(item.description || item.action || ''),
    actorName: normalizeText(item.actorName || item.actor_name),
    actorRole: normalizeText(item.actorRole || item.actor_role),
    action: normalizeText(item.action),
    beforeState: item.beforeState || item.before_state || null,
    afterState: item.afterState || item.after_state || null,
    metadata: item.metadata || null,
    ipAddress: normalizeText(item.ipAddress || item.ip_address),
    userAgent: normalizeText(item.userAgent || item.user_agent),
    createdAt: item.createdAt || item.created_at || '',
    severity: normalizeText(item.severity || 'info'),
    severityLabel: normalizeText(item.severityLabel || item.severity_label || item.severity || 'Info'),
    severityClass: normalizeText(item.severityClass || item.severity_class || 'bg-slate-100 text-slate-700'),
    raw: item,
  }
}

export function normalizeSecurityEvent(item = {}) {
  return {
    id: item.id,
    eventType: normalizeText(item.eventType || item.event_type),
    severity: normalizeText(item.severity),
    userId: item.userId || item.user_id || null,
    userName: normalizeText(item.userName || item.user_name || ''),
    ipAddress: normalizeText(item.ipAddress || item.ip_address),
    description: normalizeText(item.description),
    metadata: item.metadata || null,
    resolvedAt: item.resolvedAt || item.resolved_at || null,
    resolvedBy: item.resolvedBy || item.resolved_by || null,
    severityLabel: normalizeText(item.severityLabel || item.severity_label || item.severity),
    severityClass: normalizeText(item.severityClass || item.severity_class || 'bg-slate-100 text-slate-700'),
    createdAt: item.createdAt || item.created_at || '',
    updatedAt: item.updatedAt || item.updated_at || '',
    raw: item,
  }
}

function normalizeItemsPayload(payload = {}, normalizer) {
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.records)
        ? payload.records
        : []

  return {
    items: items.map(normalizer),
  }
}

async function request(path, params = {}, options = {}) {
  const response = await http.get(path, {
    params: buildQueryParams(params),
    signal: options.signal,
  })

  return unwrapApiData(response) || {}
}

export async function fetchGovernanceDashboard(params = {}, options = {}) {
  return normalizeGovernanceDashboard(await request('/governance/dashboard', params, options))
}

export async function fetchAuditLogs(params = {}, options = {}) {
  return normalizeItemsPayload(await request('/governance/audit-logs', params, options), normalizeAuditLog)
}

export async function fetchAuditLog(id, options = {}) {
  const payload = await request(`/governance/audit-logs/${encodeURIComponent(String(id))}`, {}, options)
  return normalizeAuditLog(payload.auditLog || payload)
}

export async function fetchSecurityEvents(params = {}, options = {}) {
  return normalizeItemsPayload(await request('/governance/security-events', params, options), normalizeSecurityEvent)
}

export async function fetchSecurityEvent(id, options = {}) {
  const payload = await request(`/governance/security-events/${encodeURIComponent(String(id))}`, {}, options)
  return normalizeSecurityEvent(payload.securityEvent || payload)
}

export async function resolveSecurityEvent(id) {
  const response = await http.post(`/governance/security-events/${encodeURIComponent(String(id))}/resolve`)
  const payload = unwrapApiData(response) || {}
  return normalizeSecurityEvent(payload.securityEvent || payload)
}

export async function fetchConfigurationHistory(params = {}, options = {}) {
  return normalizeItemsPayload(await request('/governance/configuration-history', params, options), (item) => ({
    ...item,
    id: item.id,
    module: normalizeText(item.module),
    actorName: normalizeText(item.actorName || item.actor_name),
    beforeState: item.beforeState || item.before_state || null,
    afterState: item.afterState || item.after_state || null,
    createdAt: item.createdAt || item.created_at || '',
  }))
}

export async function fetchRiskDashboard(params = {}, options = {}) {
  const payload = await request('/governance/risk-dashboard', params, options)
  return {
    atRiskStudents: normalizeNumber(payload.riskDashboard?.at_risk_students ?? payload.at_risk_students),
    overduePayments: normalizeNumber(payload.riskDashboard?.overdue_payments ?? payload.overdue_payments),
    openHealthAlerts: normalizeNumber(payload.riskDashboard?.open_health_alerts ?? payload.open_health_alerts),
    openGuardianIssues: normalizeNumber(payload.riskDashboard?.open_guardian_issues ?? payload.open_guardian_issues),
    raw: payload,
  }
}

export async function fetchAtRiskStudents(params = {}, options = {}) {
  const payload = await request('/governance/at-risk-students', params, options)
  return normalizeItemsPayload(payload, (item) => ({ ...item, label: normalizeText(item.label || item.name) }))
}

export async function fetchInvestigations(params = {}, options = {}) {
  const payload = await request('/governance/investigations', params, options)
  return {
    auditLogs: Array.isArray(payload.auditLogs) ? payload.auditLogs.map(normalizeAuditLog) : Array.isArray(payload.audit_logs) ? payload.audit_logs.map(normalizeAuditLog) : [],
    securityEvents: Array.isArray(payload.securityEvents) ? payload.securityEvents.map(normalizeSecurityEvent) : Array.isArray(payload.security_events) ? payload.security_events.map(normalizeSecurityEvent) : [],
    risk: payload.risk || payload.risk_summary || {},
  }
}
