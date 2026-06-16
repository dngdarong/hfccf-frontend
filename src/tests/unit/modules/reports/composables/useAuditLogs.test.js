import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuditLogs } from '@/modules/reports/composables/useAuditLogs'
import * as auditApi from '@/modules/reports/services/auditLogApi'

vi.mock('@/modules/reports/services/auditLogApi', () => ({
  fetchAuditLogs: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAuditLogs', () => {
  it('loads audit logs and clamps pagination requests', async () => {
    auditApi.fetchAuditLogs.mockResolvedValueOnce({
      items: [{ id: 'audit-1', action: 'player_approved' }],
      pagination: { page: 2, perPage: 100, total: 1, lastPage: 1 },
    })

    const logs = useAuditLogs()

    await expect(logs.loadAuditLogs({ page: 2, perPage: 500, domain: 'sport' })).resolves.toMatchObject({
      items: [{ id: 'audit-1', action: 'player_approved' }],
    })
    expect(auditApi.fetchAuditLogs).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      perPage: 500,
      domain: 'sport',
    }), expect.any(Object))
    expect(logs.items.value).toHaveLength(1)
    expect(logs.pagination.lastPage).toBe(1)
  })

  it('resets audit filters safely', () => {
    const logs = useAuditLogs()
    logs.filters.domain = 'sport'
    logs.filters.action = 'player_approved'
    logs.resetFilters()

    expect(logs.filters).toMatchObject({
      domain: '',
      action: '',
      actorUserId: '',
      search: '',
      dateFrom: '',
      dateTo: '',
    })
  })
})