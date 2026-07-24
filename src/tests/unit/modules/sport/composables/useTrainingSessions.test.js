import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTrainingSessions } from '@/modules/sport/composables/useTrainingSessions'

const mockFetchList = vi.fn()
const mockFetchDetail = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/modules/sport/services/api/sportTrainingSessionsApi', () => ({
  fetchSportTrainingSessions: (...args) => mockFetchList(...args),
  fetchSportTrainingSession: (...args) => mockFetchDetail(...args),
  createSportTrainingSession: (...args) => mockCreate(...args),
  updateSportTrainingSession: (...args) => mockUpdate(...args),
  deleteSportTrainingSession: (...args) => mockDelete(...args),
}))

const response = (items = [], pagination = {}) => ({
  items,
  pagination: {
    page: 1,
    perPage: 8,
    total: items.length,
    totalPages: 1,
    ...pagination,
  },
})

describe('useTrainingSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchList.mockResolvedValue(response([{ id: 1, title: 'Training' }]))
    mockFetchDetail.mockResolvedValue({ id: 1 })
    mockCreate.mockResolvedValue({ id: 2 })
    mockUpdate.mockResolvedValue({ id: 1 })
    mockDelete.mockResolvedValue(true)
  })

  it('loads data and resets to page one when a filter changes', async () => {
    const state = useTrainingSessions()

    await state.load()
    expect(state.items.value).toHaveLength(1)
    expect(mockFetchList).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }), expect.any(Object))

    state.currentPage.value = 3
    state.searchQuery.value = 'coach'
    await nextTick()
    await Promise.resolve()

    expect(mockFetchList).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, search: 'coach' }),
      expect.any(Object),
    )
  })

  it('exposes API failures as page state', async () => {
    mockFetchList.mockRejectedValueOnce(new Error('Backend unavailable'))
    const state = useTrainingSessions()

    const result = await state.load()

    expect(result.items).toEqual([])
    expect(state.error.value).toBe('Backend unavailable')
    expect(state.loading.value).toBe(false)
  })

  it('supports admin CRUD and prevents duplicate submissions', async () => {
    const state = useTrainingSessions()
    await state.load()

    const created = await state.create({ title: 'New training' })
    const updated = await state.update(1, { title: 'Updated training' })
    const deleted = await state.remove(1)

    expect(created).toEqual({ id: 2 })
    expect(updated).toEqual({ id: 1 })
    expect(deleted).toBe(true)
    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockDelete).toHaveBeenCalledOnce()
  })

  it('does not expose mutating operations for Coach state', async () => {
    const state = useTrainingSessions({ readOnly: true })

    expect(await state.create({ title: 'Blocked' })).toBeNull()
    expect(await state.update(1, { title: 'Blocked' })).toBeNull()
    expect(await state.remove(1)).toBe(false)
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('passes the training type filter to the backend and resets pagination', async () => {
    const state = useTrainingSessions()
    await state.load()

    state.currentPage.value = 2
    state.trainingTypeFilter.value = 'fitness'
    await nextTick()
    await Promise.resolve()

    expect(mockFetchList).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, trainingType: 'fitness' }),
      expect.any(Object),
    )
  })
})
