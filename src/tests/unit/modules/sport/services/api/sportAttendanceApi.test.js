import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as sportAttendanceApi from '@/modules/sport/services/api/sportAttendanceApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
const mockHttpPut = vi.fn()
const mockBuildQueryParams = vi.fn()
const mockNormalizePerPage = vi.fn()
const mockUnwrapApiData = vi.fn()
const mockUnwrapApiItems = vi.fn()
const mockUnwrapApiPagination = vi.fn()
const mockNormalizeText = vi.fn()
const mockResolveId = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
    put: (...args) => mockHttpPut(...args),
  },
}))

vi.mock('@/services/api', () => ({
  buildQueryParams: (...args) => mockBuildQueryParams(...args),
  normalizePerPage: (...args) => mockNormalizePerPage(...args),
  unwrapApiData: (...args) => mockUnwrapApiData(...args),
  unwrapApiItems: (...args) => mockUnwrapApiItems(...args),
  unwrapApiPagination: (...args) => mockUnwrapApiPagination(...args),
}))

vi.mock('@/modules/sport/services/api/sportApiUtils', () => ({
  normalizeText: (...args) => mockNormalizeText(...args),
  resolveId: (...args) => mockResolveId(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockBuildQueryParams.mockReturnValue({})
  mockNormalizePerPage.mockReturnValue(10)
  mockUnwrapApiItems.mockReturnValue([])
  mockUnwrapApiPagination.mockReturnValue({ page: 1, perPage: 10 })
  mockUnwrapApiData.mockReturnValue(null)
  mockNormalizeText.mockImplementation((val) => val || '')
  mockResolveId.mockReturnValue(null)
})

describe('sportAttendanceApi', () => {
  describe('fetchSportAttendance', () => {
    it('fetches attendance with default pagination', async () => {
      mockHttpGet.mockResolvedValueOnce({})
      mockUnwrapApiItems.mockReturnValueOnce([])

      await sportAttendanceApi.fetchSportAttendance()

      expect(mockHttpGet).toHaveBeenCalledWith('/sport/attendance', expect.any(Object))
      expect(mockNormalizePerPage).toHaveBeenCalledWith(10, 25, 100)
    })

    it('includes search and filters in params', async () => {
      mockHttpGet.mockResolvedValueOnce({})
      mockUnwrapApiItems.mockReturnValueOnce([])

      await sportAttendanceApi.fetchSportAttendance({
        search: 'john',
        attendanceType: 'coach',
        status: 'present',
      })

      expect(mockBuildQueryParams).toHaveBeenCalledWith(expect.objectContaining({
        search: 'john',
        attendance_type: 'coach',
        status: 'present',
      }))
    })

    it('includes date range filters', async () => {
      mockHttpGet.mockResolvedValueOnce({})
      mockUnwrapApiItems.mockReturnValueOnce([])

      await sportAttendanceApi.fetchSportAttendance({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      })

      expect(mockBuildQueryParams).toHaveBeenCalledWith(expect.objectContaining({
        date_from: '2026-01-01',
        date_to: '2026-01-31',
      }))
    })

    it('passes abort signal for cancellation', async () => {
      const signal = new AbortController().signal
      mockHttpGet.mockResolvedValueOnce({})
      mockUnwrapApiItems.mockReturnValueOnce([])

      await sportAttendanceApi.fetchSportAttendance({}, { signal })

      expect(mockHttpGet).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal }))
    })
  })

  describe('fetchSportPlayerAttendance', () => {
    it('sets attendanceType to player', async () => {
      mockHttpGet.mockResolvedValueOnce({})
      mockUnwrapApiItems.mockReturnValueOnce([])

      await sportAttendanceApi.fetchSportPlayerAttendance()

      expect(mockBuildQueryParams).toHaveBeenCalledWith(expect.objectContaining({
        attendance_type: 'player',
      }))
    })
  })

  describe('saveSportAttendance', () => {
    it('creates new attendance when no id', async () => {
      mockResolveId.mockReturnValueOnce(null)
      mockHttpPost.mockResolvedValueOnce({})
      mockUnwrapApiData.mockReturnValueOnce({})

      await sportAttendanceApi.saveSportAttendance({ status: 'present' })

      expect(mockHttpPost).toHaveBeenCalledWith('/sport/attendance', expect.any(Object))
    })

    it('updates attendance when id exists', async () => {
      mockResolveId.mockReturnValueOnce('att-123')
      mockHttpPut.mockResolvedValueOnce({})
      mockUnwrapApiData.mockReturnValueOnce({})

      await sportAttendanceApi.saveSportAttendance({ id: 'att-123' })

      expect(mockHttpPut).toHaveBeenCalledWith('/sport/attendance/att-123', expect.any(Object))
    })

    it('normalizes payload field names', async () => {
      mockResolveId.mockReturnValueOnce(null)
      mockHttpPost.mockResolvedValueOnce({})
      mockUnwrapApiData.mockReturnValueOnce({})

      await sportAttendanceApi.saveSportAttendance({
        attendanceType: 'player',
        teamId: 'team-1',
        playerId: 'player-1',
      })

      expect(mockHttpPost).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        attendance_type: 'player',
        team_id: 'team-1',
        player_id: 'player-1',
      }))
    })
  })

  describe('saveSportPlayerAttendance', () => {
    it('sets attendanceType to player', async () => {
      mockResolveId.mockReturnValueOnce(null)
      mockHttpPost.mockResolvedValueOnce({})
      mockUnwrapApiData.mockReturnValueOnce({})

      await sportAttendanceApi.saveSportPlayerAttendance({ status: 'present' })

      expect(mockHttpPost).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        attendance_type: 'player',
      }))
    })
  })
})
