// Keep the timetable API contract covered so schedule pages cannot drift into
// wrong endpoints or malformed query params as the Preschool module grows.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveSchedule,
  createSchedule,
  fetchClassSchedule,
  fetchMySchedule,
  fetchSchedule,
  fetchSchedules,
  fetchTeacherSchedule,
  updateSchedule,
} from '@/modules/preschool/services/api/preschoolScheduleApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool schedule api', () => {
  it('fetches schedule lists and normalizes the expected endpoints', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 11,
            class_id: 3,
            teacher_user_id: 'usr_teacher',
            day_of_week: 1,
            start_time: '08:00',
            end_time: '09:00',
            activity_label: 'Morning Circle',
            status: 'active',
          },
        ],
        pagination: { page: 2, perPage: 10, total: 1, totalPages: 1 },
      }),
    )

    await expect(
      fetchSchedules({ page: 2, perPage: 10, search: 'circle', classId: 3, teacherUserId: 'usr_teacher' }),
    ).resolves.toMatchObject({
      items: [
        {
          id: 11,
          classId: 3,
          teacherUserId: 'usr_teacher',
          activityLabel: 'Morning Circle',
        },
      ],
      pagination: {
        page: 2,
        perPage: 10,
        total: 1,
      },
    })

    expect(http.get).toHaveBeenCalledWith('/preschool/schedules', {
      params: {
        page: 2,
        per_page: 10,
        search: 'circle',
        class_id: 3,
        teacher_user_id: 'usr_teacher',
      },
      signal: undefined,
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        schedule: {
          id: 21,
          class_id: 4,
          teacher_user_id: 'usr_teacher',
          day_of_week: 2,
          start_time: '10:00',
          end_time: '11:00',
          activity_label: 'Music Time',
          status: 'active',
        },
      }),
    )

    await expect(createSchedule({ class_id: 4, teacher_user_id: 'usr_teacher' })).resolves.toMatchObject({
      id: 21,
      classId: 4,
      teacherUserId: 'usr_teacher',
      activityLabel: 'Music Time',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/schedules', { class_id: 4, teacher_user_id: 'usr_teacher' })

    http.get.mockResolvedValueOnce(stubResponse({ schedule: { id: 21 } }))
    await expect(fetchSchedule(21)).resolves.toMatchObject({ id: 21 })
    expect(http.get).toHaveBeenCalledWith('/preschool/schedules/21', { signal: undefined })

    http.patch.mockResolvedValueOnce(stubResponse({ schedule: { id: 21 } }))
    await expect(updateSchedule(21, { notes: 'Updated note' })).resolves.toMatchObject({ id: 21 })
    expect(http.patch).toHaveBeenCalledWith('/preschool/schedules/21', { notes: 'Updated note' })

    http.delete.mockResolvedValueOnce({})
    await expect(archiveSchedule(21)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/preschool/schedules/21')

    http.get.mockResolvedValueOnce(
      stubResponse({
        class: { id: 3, code: 'PS-3', name: 'Morning Class' },
        items: [{ id: 41, class_id: 3, activity_label: 'Circle Time', status: 'active' }],
      }),
    )
    await expect(fetchClassSchedule(3)).resolves.toMatchObject({
      class: { id: 3, code: 'PS-3', name: 'Morning Class' },
      items: [{ id: 41, classId: 3, activityLabel: 'Circle Time' }],
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        teacher: { id: 'usr_teacher', name: 'Teacher One', username: 'teacher1' },
        items: [{ id: 51, teacher_user_id: 'usr_teacher', activity_label: 'Reading' }],
      }),
    )
    await expect(fetchTeacherSchedule('usr_teacher')).resolves.toMatchObject({
      teacher: { id: 'usr_teacher', name: 'Teacher One', username: 'teacher1' },
      items: [{ id: 51, teacherUserId: 'usr_teacher', activityLabel: 'Reading' }],
    })

    http.get.mockResolvedValueOnce(
      stubResponse({
        teacher: { id: 'usr_teacher', name: 'Teacher One' },
        items: [{ id: 61, teacher_user_id: 'usr_teacher', activity_label: 'Daily Routine' }],
      }),
    )
    await expect(fetchMySchedule()).resolves.toMatchObject({
      teacher: { id: 'usr_teacher', name: 'Teacher One' },
      items: [{ id: 61, teacherUserId: 'usr_teacher', activityLabel: 'Daily Routine' }],
    })
  })
})
