import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCoachEquipmentAssignment,
  fetchCoachEquipmentAssignments,
  fetchEquipmentAssignment,
  fetchEquipmentAssignments,
  fetchEquipmentItemAssignments,
  fetchTeamEquipmentAssignments,
} from '@/modules/sport/services/api/sportEquipmentApi'

const httpGet = vi.hoisted(() => vi.fn())

vi.mock('@/services/http', () => ({
  default: { get: httpGet },
}))

describe('sport equipment assignment API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads admin assignments with supported query parameters only', async () => {
    httpGet.mockResolvedValueOnce({
      data: { data: { items: [{
        id: 'assignment-1',
        assigned_quantity: '5',
        returned_quantity: '2',
        damaged_quantity: 1,
        missing_quantity: 0,
        item: { id: 'item-1', name: 'Training Cones', equipment_code: 'EQ-001' },
        team: 'Assigned FC',
        coach: null,
      }], pagination: { page: 2, perPage: 10, total: 1, totalPages: 1 } } },
    })

    const result = await fetchEquipmentAssignments({
      page: 2,
      perPage: 10,
      search: 'cones',
      equipmentItemId: 'item-1',
      teamId: 'team-1',
      coachUserId: 'coach-1',
      status: 'assigned',
      assignedFrom: '2026-07-01',
      overdue: true,
    })

    expect(httpGet).toHaveBeenCalledWith('/sport/admin/equipment-assignments', expect.objectContaining({
      params: {
        page: 2,
        per_page: 10,
        search: 'cones',
        equipment_item_id: 'item-1',
        team_id: 'team-1',
        coach_user_id: 'coach-1',
        status: 'assigned',
      },
    }))
    expect(result.items[0].id).toBe('assignment-1')
    expect(result.items[0].assignedQuantity).toBe(5)
    expect(result.items[0].remainingQuantity).toBe(2)
    expect(result.items[0].equipmentName).toBe('Training Cones')
    expect(result.items[0].teamName).toBe('Assigned FC')
    expect(result.items[0].coach).toBeNull()
    expect(result.pagination.total).toBe(1)
  })

  it('uses admin detail and history endpoints', async () => {
    httpGet
      .mockResolvedValueOnce({ data: { data: { assignment: { id: 'assignment-1' } } } })
      .mockResolvedValueOnce({ data: { data: { items: [], pagination: {} } } })
      .mockResolvedValueOnce({ data: { data: { items: [], pagination: {} } } })

    await fetchEquipmentAssignment('assignment-1')
    await fetchEquipmentItemAssignments('item-1', { equipmentItemId: 'ignored', page: 2 })
    await fetchTeamEquipmentAssignments('team-1', { teamId: 'ignored', status: 'returned' })

    expect(httpGet).toHaveBeenNthCalledWith(1, '/sport/admin/equipment-assignments/assignment-1', expect.any(Object))
    expect(httpGet).toHaveBeenNthCalledWith(2, '/sport/admin/equipment/item-1/assignments', expect.objectContaining({
      params: { page: 2, per_page: 10 },
    }))
    expect(httpGet).toHaveBeenNthCalledWith(3, '/sport/admin/teams/team-1/equipment-assignments', expect.objectContaining({
      params: { page: 1, per_page: 10, status: 'returned' },
    }))
  })

  it('uses coach list and detail endpoints', async () => {
    httpGet
      .mockResolvedValueOnce({ data: { data: { items: [], pagination: {} } } })
      .mockResolvedValueOnce({ data: { data: { assignment: { id: 'assignment-2' } } } })

    await fetchCoachEquipmentAssignments({ teamId: 'team-1', status: 'assigned' })
    await fetchCoachEquipmentAssignment('assignment-2')

    expect(httpGet).toHaveBeenNthCalledWith(1, '/sport/coach/equipment/assignments', expect.any(Object))
    expect(httpGet).toHaveBeenNthCalledWith(2, '/sport/coach/equipment/assignments/assignment-2', expect.any(Object))
  })
})
