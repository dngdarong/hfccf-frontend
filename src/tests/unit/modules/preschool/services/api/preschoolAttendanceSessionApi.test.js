import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  fetchAttendanceSessions,
  fetchMissingAttendanceSessions,
  fetchTodayAttendanceSessions,
} from '@/modules/preschool/services/api/preschoolAttendanceSessionApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool attendance session api', () => {
  it('normalizes supported list filters and today-session responses', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'session-1',
            schedule_id: 11,
            class_id: 3,
            teacher_user_id: 'usr_teacher',
            attendance_date: '2026-07-01',
            status: 'open',
          },
        ],
        pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
        summary: { open: 1, closed: 0, cancelled: 0, missing: 0 },
      }),
    )

    await expect(
      fetchAttendanceSessions({
        date: '2026-07-01',
        classId: 3,
        teacherId: 'usr_teacher',
        status: 'open',
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 'session-1',
          scheduleId: 11,
          classId: 3,
          attendanceDate: '2026-07-01',
          status: 'open',
        },
      ],
      pagination: { page: 1, perPage: 10, total: 1 },
      summary: { open: 1, closed: 0, cancelled: 0, missing: 0 },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/attendance-sessions', {
      params: {
        date: '2026-07-01',
        class_id: 3,
        teacher_id: 'usr_teacher',
        status: 'open',
      },
      signal: undefined,
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'today-1',
            schedule_id: 12,
            class_id: 4,
            teacher_user_id: 'usr_teacher',
            attendance_date: '2026-07-02',
            status: 'scheduled',
          },
        ],
        summary: { scheduled: 1, open: 0, completed: 0, locked: 0, cancelled: 0, missing: 0 },
      }),
    )

    await expect(fetchTodayAttendanceSessions()).resolves.toMatchObject({
      items: [
        {
          id: 'today-1',
          scheduleId: 12,
          classId: 4,
          attendanceDate: '2026-07-02',
          status: 'scheduled',
        },
      ],
      summary: { scheduled: 1, open: 0, completed: 0, locked: 0, cancelled: 0, missing: 0 },
    })
    expect(http.get).toHaveBeenCalledWith('/preschool/attendance-sessions/today', {
      signal: undefined,
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'today-2',
            schedule_id: 13,
            class_id: 5,
            teacher_user_id: 'usr_teacher',
            attendance_date: '2026-07-02',
            status: 'open',
          },
        ],
        summary: { scheduled: 0, open: 1, completed: 0, locked: 0, cancelled: 0, missing: 0 },
      }),
    )

    await expect(fetchTodayAttendanceSessions({ classId: 5 })).resolves.toMatchObject({
      items: [
        {
          id: 'today-2',
          scheduleId: 13,
          classId: 5,
          attendanceDate: '2026-07-02',
          status: 'open',
        },
      ],
    })
    expect(http.get).toHaveBeenLastCalledWith('/preschool/attendance-sessions', {
      params: expect.objectContaining({
        date: expect.any(String),
        class_id: 5,
      }),
      signal: undefined,
    })
  })

  it('normalizes the missing session endpoint payload', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 'missing-1',
            schedule_id: 21,
            class_id: 7,
            teacher_user_id: 'usr_teacher',
            attendance_date: '2026-07-01',
            status: 'scheduled',
          },
        ],
        count: 1,
      }),
    )

    await expect(
      fetchMissingAttendanceSessions({
        startDate: '2026-07-01',
        endDate: '2026-07-02',
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 'missing-1',
          scheduleId: 21,
          classId: 7,
          attendanceDate: '2026-07-01',
          status: 'scheduled',
        },
      ],
      count: 1,
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/attendance-sessions/missing', {
      params: {
        start_date: '2026-07-01',
        end_date: '2026-07-02',
      },
      signal: undefined,
    })
  })
})
