import { computed } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSportEquipmentAssignments } from '@/modules/sport/composables/useSportEquipmentAssignments'

const api = vi.hoisted(() => ({
  fetchCoachEquipmentAssignment: vi.fn(),
  fetchCoachEquipmentAssignments: vi.fn(),
  fetchEquipmentAssignment: vi.fn(),
  fetchEquipmentAssignments: vi.fn(),
  fetchEquipmentItemAssignments: vi.fn(),
  fetchTeamEquipmentAssignments: vi.fn(),
}))

vi.mock('@/modules/sport/services/api/sportEquipmentApi', () => api)

describe('useSportEquipmentAssignments', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads admin lists, details, and pagination', async () => {
    api.fetchEquipmentAssignments.mockResolvedValueOnce({
      items: [{ id: 'assignment-1' }],
      pagination: { page: 2, perPage: 10, total: 1, totalPages: 1 },
    })
    api.fetchEquipmentAssignment.mockResolvedValueOnce({ id: 'assignment-1' })

    const state = useSportEquipmentAssignments({ role: 'admin' })
    await state.fetchAssignments({ page: 2, status: 'assigned' })
    await state.fetchAssignment('assignment-1')

    expect(api.fetchEquipmentAssignments).toHaveBeenCalledWith({ page: 2, status: 'assigned' })
    expect(api.fetchEquipmentAssignment).toHaveBeenCalledWith('assignment-1')
    expect(state.assignments.value).toHaveLength(1)
    expect(state.pagination.value.page).toBe(2)
    expect(state.selectedAssignment.value.id).toBe('assignment-1')
  })

  it('selects Coach endpoints from a reactive role and exposes read-only state', async () => {
    const role = computed(() => 'coach')
    api.fetchCoachEquipmentAssignments.mockResolvedValueOnce({ items: [], pagination: { total: 0 } })
    api.fetchCoachEquipmentAssignment.mockResolvedValueOnce({ id: 'assignment-2' })

    const state = useSportEquipmentAssignments({ role })
    await state.fetchAssignments({ teamId: 'team-1' })
    await state.fetchAssignment('assignment-2')

    expect(api.fetchCoachEquipmentAssignments).toHaveBeenCalledWith({ teamId: 'team-1' })
    expect(api.fetchCoachEquipmentAssignment).toHaveBeenCalledWith('assignment-2')
    expect(state.fetchAssignments).toBeTypeOf('function')
    expect(state.fetchEquipmentItemAssignments).toBeTypeOf('function')
  })

  it('clears selection, resets filters, and exposes API errors', async () => {
    const failure = new Error('Request failed')
    api.fetchEquipmentAssignments.mockRejectedValueOnce(failure)
    const state = useSportEquipmentAssignments()

    await expect(state.fetchAssignments({ search: 'cones' })).rejects.toBe(failure)
    expect(state.error.value).toBe(failure)

    state.selectedAssignment.value = { id: 'assignment-3' }
    state.clearSelectedAssignment()
    state.resetFilters()

    expect(state.selectedAssignment.value).toBeNull()
    expect(state.filters.value).toEqual({})
    expect(state.pagination.value.page).toBe(1)
  })
})
