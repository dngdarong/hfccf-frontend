import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchAuditLogs,
  normalizeAuditLogResponse,
} from '@/modules/reports/services/auditLogApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('audit log api', () => {
  it('loads audit logs with normalized query params', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [{ id: 'audit-1', action: 'player_approved', domain: 'sport' }],
        pagination: { page: 2, perPage: 100, total: 1, lastPage: 1 },
      }),
    )

    const result = await fetchAuditLogs({
      page: 2,
      perPage: 200,
      domain: 'sport',
      action: 'player_approved',
      actorUserId: 'usr-1',
      search: '  audit  ',
      dateFrom: '2026-05-01',
      dateTo: '2026-05-19',
    })

    expect(http.get).toHaveBeenCalledWith('/audit-logs', expect.objectContaining({
      params: expect.objectContaining({
        page: 2,
        per_page: 100,
        domain: 'sport',
        action: 'player_approved',
        actor_user_id: 'usr-1',
        search: 'audit',
        date_from: '2026-05-01',
        date_to: '2026-05-19',
      }),
    }))
    expect(result.items[0]).toMatchObject({
      id: 'audit-1',
      action: 'player_approved',
      domain: 'sport',
    })
  })

  it('normalizes actor metadata and pagination', () => {
    const result = normalizeAuditLogResponse({
      items: [{
        id: 'audit-2',
        action: 'match_squad_locked',
        domain: 'sport',
        actor: { id: 'usr-9', first_name: 'Audit', last_name: 'User' },
      }],
      pagination: { page: 1, perPage: 20, total: 1, lastPage: 1 },
    })

    expect(result.items[0].actor).toMatchObject({
      id: 'usr-9',
      name: 'Audit User',
    })
    expect(result.pagination).toMatchObject({
      page: 1,
      perPage: 20,
      total: 1,
      lastPage: 1,
    })
  })
})