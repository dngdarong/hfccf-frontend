import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createSportTrainingSession,
  deleteSportTrainingSession,
  fetchSportTrainingSession,
  fetchSportTrainingSessions,
  normalizeTrainingSessionRow,
  updateSportTrainingSession,
} from '@/modules/sport/services/api/sportTrainingSessionsApi'

const mockHttpGet = vi.fn()
const mockHttpPost = vi.fn()
const mockHttpPut = vi.fn()
const mockHttpDelete = vi.fn()

vi.mock('@/services/http', () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
    post: (...args) => mockHttpPost(...args),
    put: (...args) => mockHttpPut(...args),
    delete: (...args) => mockHttpDelete(...args),
  },
}))

describe('sportTrainingSessionsApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('normalizes backend session fields for the schedule table', () => {
    const session = normalizeTrainingSessionRow({
      id: 7,
      sessionCode: 'TRN-7',
      team: { id: 3, name: 'Lions FC', division: 'U12' },
      coach: { id: 'coach-1', first_name: 'Sok', last_name: 'Dara' },
      title: 'Technical training',
      trainingType: 'technical',
      startsAt: '2026-08-01T08:00:00.000Z',
      endsAt: '2026-08-01T10:00:00.000Z',
      status: 'scheduled',
      intensity: 'medium',
    })

    expect(session).toMatchObject({
      id: 7,
      sessionCode: 'TRN-7',
      teamId: 3,
      team: 'Lions FC',
      division: 'U12',
      trainingType: 'technical',
      startsAt: '2026-08-01T08:00:00.000Z',
      endsAt: '2026-08-01T10:00:00.000Z',
    })
    expect(session.coach.firstName).toBe('Sok')
    expect(session.date).not.toBe('')
  })

  it('loads paginated sessions with backend filters', async () => {
    mockHttpGet.mockResolvedValueOnce({
      data: {
        items: [{ id: 1, title: 'Training', team: { id: 3, name: 'Lions FC' } }],
        pagination: { page: 2, perPage: 8, total: 9, totalPages: 2 },
      },
    })

    const result = await fetchSportTrainingSessions({
      page: 2,
      search: 'training',
      teamId: 3,
      status: 'scheduled',
      intensity: 'high',
    })

    expect(mockHttpGet).toHaveBeenCalledWith('/sport/training-sessions', expect.objectContaining({
      params: expect.objectContaining({
        page: 2,
        per_page: 8,
        search: 'training',
        team_id: '3',
        status: 'scheduled',
        intensity: 'high',
      }),
    }))
    expect(result.pagination.totalPages).toBe(2)
    expect(result.items[0].team).toBe('Lions FC')
  })

  it('supports detail and CRUD requests with backend payload names', async () => {
    mockHttpGet.mockResolvedValueOnce({ data: { id: 1, title: 'Existing' } })
    mockHttpPost.mockResolvedValueOnce({ data: { id: 2, title: 'Created' } })
    mockHttpPut.mockResolvedValueOnce({ data: { id: 1, title: 'Updated' } })
    mockHttpDelete.mockResolvedValueOnce({})

    await expect(fetchSportTrainingSession(1)).resolves.toMatchObject({ id: 1, title: 'Existing' })
    await expect(createSportTrainingSession({
      teamId: 3,
      title: 'Created',
      trainingType: 'technical',
      startsAt: '2026-08-01 08:00:00',
      endsAt: '2026-08-01 10:00:00',
    })).resolves.toMatchObject({ id: 2, title: 'Created' })
    await expect(updateSportTrainingSession(1, {
      teamId: 3,
      title: 'Updated',
      trainingType: 'tactical',
      startsAt: '2026-08-01 08:00:00',
      endsAt: '2026-08-01 10:00:00',
    })).resolves.toMatchObject({ id: 1, title: 'Updated' })
    await expect(deleteSportTrainingSession(1)).resolves.toBe(true)

    expect(mockHttpPost.mock.calls[0][1]).toMatchObject({
      team_id: '3',
      training_type: 'technical',
      starts_at: '2026-08-01 08:00:00',
      ends_at: '2026-08-01 10:00:00',
    })
    expect(mockHttpPut.mock.calls[0][0]).toBe('/sport/training-sessions/1')
    expect(mockHttpDelete).toHaveBeenCalledWith('/sport/training-sessions/1')
  })
})
