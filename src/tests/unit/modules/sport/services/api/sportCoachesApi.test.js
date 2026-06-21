import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSportCoaches,
  fetchSportCoach,
  createSportCoach,
  updateSportCoach,
  deleteSportCoach,
  resetSportCoachPassword,
} from '@/modules/sport/services/api/sportCoachesApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
const mockHttpDelete = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
    delete: (...args) => mockHttpDelete(...args),
  },
}))

describe('sportCoachesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchSportCoaches', () => {
    it('fetches coaches list with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: {
          items: [{ id: '1', name: 'Coach One', status: 'active' }],
          pagination: { page: 1, per_page: 10, total: 1, total_pages: 1 },
        },
      })

      const result = await fetchSportCoaches()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/coaches', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          per_page: 10,
          sort_by: 'created_at',
          sort_direction: 'desc',
        }),
      }))
      expect(result.items).toHaveLength(1)
    })

    it('applies search and status filters', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      await fetchSportCoaches({ search: 'john', status: 'inactive' })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/coaches', expect.objectContaining({
        params: expect.objectContaining({
          search: 'john',
          status: 'inactive',
        }),
      }))
    })

    it('supports pagination and sorting', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 2, per_page: 20, total: 0, total_pages: 0 } },
      })

      await fetchSportCoaches({ page: 2, perPage: 20, sortBy: 'name', sortDirection: 'asc' })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/coaches', expect.objectContaining({
        params: expect.objectContaining({
          page: 2,
          per_page: 20,
          sort_by: 'name',
          sort_direction: 'asc',
        }),
      }))
    })

    it('passes abort signal if provided', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { items: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 } },
      })

      const signal = new AbortController().signal
      await fetchSportCoaches({}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/coaches', expect.objectContaining({
        signal,
      }))
    })
  })

  describe('fetchSportCoach', () => {
    it('fetches single coach by ID', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { coach: { id: 'coach-1', name: 'John Coach', email: 'john@example.com' } },
      })

      const result = await fetchSportCoach('coach-1')

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/coaches/coach-1', expect.any(Object))
      expect(result.id).toBe('coach-1')
      expect(result.name).toBe('John Coach')
    })

    it('URL-encodes coach ID', async () => {
      mockHttpGet.mockResolvedValueOnce({ data: { coach: {} } })

      await fetchSportCoach('coach with spaces')

      expect(mockHttpGet).toHaveBeenCalledWith(
        expect.stringContaining('coach'),
        expect.any(Object),
      )
    })

    it('returns null when ID is empty', async () => {
      const result = await fetchSportCoach('')

      expect(result).toBeNull()
      expect(mockHttpGet).not.toHaveBeenCalled()
    })

    it('unwraps nested coach or user response', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { user: { id: 'u1', name: 'User Coach' } },
      })

      const result = await fetchSportCoach('coach-1')

      expect(result.name).toBe('User Coach')
    })

    it('falls back to top-level response if no coach/user key', async () => {
      mockHttpGet.mockResolvedValueOnce({
        data: { id: 'c1', name: 'Direct Coach' },
      })

      const result = await fetchSportCoach('coach-1')

      expect(result.id).toBe('c1')
    })
  })

  describe('createSportCoach', () => {
    it('creates coach with payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { coach: { id: 'new-coach', name: 'New Coach', status: 'active' } },
      })

      const payload = { name: 'New Coach', email: 'new@example.com' }
      const result = await createSportCoach(payload)

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/coaches', expect.any(Object))
      expect(result.id).toBe('new-coach')
    })

    it('returns normalized coach from response', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { user: { id: 'u2', name: 'New User Coach' } },
      })

      const result = await createSportCoach({})

      expect(result.name).toBe('New User Coach')
    })
  })

  describe('updateSportCoach', () => {
    it('updates coach by ID', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { coach: { id: 'coach-1', name: 'Updated Coach' } },
      })

      const result = await updateSportCoach('coach-1', { name: 'Updated Coach' })

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('coach-1'),
        expect.any(Object),
      )
      expect(result.name).toBe('Updated Coach')
    })

    it('throws error when ID is missing', async () => {
      await expect(updateSportCoach('', {})).rejects.toThrow('Coach id is required')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })

    it('URL-encodes coach ID in path', async () => {
      mockHttpPost.mockResolvedValueOnce({ data: { coach: {} } })

      await updateSportCoach('coach with spaces', {})

      expect(mockHttpPost).toHaveBeenCalledWith(
        expect.stringContaining('coach'),
        expect.any(Object),
      )
    })
  })

  describe('deleteSportCoach', () => {
    it('deletes coach by ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      const result = await deleteSportCoach('coach-1')

      expect(mockHttpDelete).toHaveBeenCalledWith('/sport/coaches/coach-1')
      expect(result).toBe(true)
    })

    it('returns false when ID is empty', async () => {
      const result = await deleteSportCoach('')

      expect(result).toBe(false)
      expect(mockHttpDelete).not.toHaveBeenCalled()
    })

    it('URL-encodes coach ID', async () => {
      mockHttpDelete.mockResolvedValueOnce({})

      await deleteSportCoach('coach with spaces')

      expect(mockHttpDelete).toHaveBeenCalled()
    })
  })

  describe('resetSportCoachPassword', () => {
    it('posts the dedicated password reset payload', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { user: { id: 'coach-1', name: 'Coach One' } },
      })

      const result = await resetSportCoachPassword('coach-1', {
        password: 'coach-pass',
        password_confirmation: 'coach-pass',
        reason: 'Audit rotation',
      })

      expect(mockHttpPost).toHaveBeenCalledWith(
        '/users/coach-1/reset-password',
        {
          password: 'coach-pass',
          password_confirmation: 'coach-pass',
          reason: 'Audit rotation',
        },
      )
      expect(result.id).toBe('coach-1')
    })

    it('throws when coach id is missing', async () => {
      await expect(resetSportCoachPassword('', {})).rejects.toThrow('Coach id is required.')
      expect(mockHttpPost).not.toHaveBeenCalled()
    })
  })
})
