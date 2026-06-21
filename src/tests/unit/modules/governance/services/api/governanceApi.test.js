import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchAuditLog,
  fetchGovernanceDashboard,
  fetchSecurityEvent,
  normalizeAuditLog,
  normalizeGovernanceDashboard,
  normalizeSecurityEvent,
} from '@/modules/governance/services/api/governanceApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/services/api', () => ({
  buildQueryParams: (params) => params,
  unwrapApiData: (response) => response?.data?.data ?? response?.data ?? null,
}))

const http = (await import('@/services/http')).default

beforeEach(() => {
  vi.clearAllMocks()
})

describe('governance api client', () => {
  it('normalizes dashboard payloads', () => {
    const dashboard = normalizeGovernanceDashboard({
      dashboard: {
        security: { failed_logins_today: 3, active_security_events: 4, recent_events: [{ id: 1, event_type: 'failed_login' }] },
        audit: { audit_events_today: 12, audit_events_this_month: 48, recent_events: [{ id: 2, action: 'settings_updated' }] },
        risk: { at_risk_students: 7, overdue_payments: 5, open_health_alerts: 2, open_guardian_issues: 1 },
        configuration: { changes_today: 2, changes_this_month: 9, last_configuration_update: '2026-06-21 09:15' },
      },
    })

    expect(dashboard.securitySummary.failedLoginsToday).toBe(3)
    expect(dashboard.auditSummary.auditEventsToday).toBe(12)
    expect(dashboard.riskSummary.atRiskStudents).toBe(7)
    expect(dashboard.configurationSummary.changesToday).toBe(2)
  })

  it('normalizes audit and security records', () => {
    expect(normalizeAuditLog({ event_type: 'SETTINGS_UPDATED', action: 'updated' }).title).toBe('updated')
    expect(normalizeSecurityEvent({ event_type: 'failed_login', severity: 'high' }).severity).toBe('high')
  })

  it('fetches audit and security records from the API contract', async () => {
    http.get
      .mockResolvedValueOnce({ data: { data: { dashboard: {} } } })
      .mockResolvedValueOnce({ data: { data: { id: 1, action: 'updated', event_type: 'SETTINGS_UPDATED' } } })
      .mockResolvedValueOnce({ data: { data: { event_type: 'failed_login', severity: 'high' } } })

    await fetchGovernanceDashboard()
    const auditLog = await fetchAuditLog(1)
    const securityEvent = await fetchSecurityEvent(1)

    expect(auditLog.title).toBe('updated')
    expect(securityEvent.severity).toBe('high')
    expect(http.get).toHaveBeenCalled()
  })
})
