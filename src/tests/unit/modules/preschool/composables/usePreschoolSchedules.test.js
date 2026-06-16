// Keep the timetable orchestration covered so the admin schedule page cannot
// regress into broken lookup loading, conflict handling, or pagination state.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePreschoolSchedules } from '@/modules/preschool/composables/usePreschoolSchedules'

const mockGetCurrentUser = vi.fn()
const mockFetchPreschoolClasses = vi.fn()
const mockFetchPreschoolTeachers = vi.fn()
const mockFetchSchedules = vi.fn()
const mockCreateSchedule = vi.fn()
const mockUpdateSchedule = vi.fn()
const mockArchiveSchedule = vi.fn()

vi.mock('@/services/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: (...args) => mockFetchPreschoolClasses(...args),
  fetchPreschoolTeachers: (...args) => mockFetchPreschoolTeachers(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolScheduleApi', () => ({
  fetchSchedules: (...args) => mockFetchSchedules(...args),
  createSchedule: (...args) => mockCreateSchedule(...args),
  updateSchedule: (...args) => mockUpdateSchedule(...args),
  archiveSchedule: (...args) => mockArchiveSchedule(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCurrentUser.mockReturnValue({ role_code: 'adminpreschool' })
  mockFetchPreschoolClasses.mockResolvedValue({
    items: [{ id: 3, code: 'PS-3', name: 'Morning Class' }],
  })
  mockFetchPreschoolTeachers.mockResolvedValue({
    items: [{ id: 'usr_teacher', fullName: 'Teacher One', username: 'teacher1' }],
  })
  mockFetchSchedules.mockResolvedValue({
    items: [{ id: 11, classId: 3, teacherUserId: 'usr_teacher', activityLabel: 'Morning Circle' }],
    pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
  })
  mockCreateSchedule.mockResolvedValue({ id: 21 })
  mockUpdateSchedule.mockResolvedValue({ id: 21 })
  mockArchiveSchedule.mockResolvedValue(true)
})

describe('usePreschoolSchedules', () => {
  it('loads lookups, schedules, and archives a selected timetable entry', async () => {
    const schedules = usePreschoolSchedules()

    await schedules.loadLookups()
    await schedules.loadSchedules({ page: 2, search: 'circle' })

    expect(mockFetchPreschoolClasses).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchPreschoolTeachers).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchSchedules).toHaveBeenCalledWith({
      page: 2,
      perPage: 10,
      search: 'circle',
      status: '',
      classId: '',
      teacherUserId: '',
      dayOfWeek: '',
    })
    expect(schedules.classOptions.value).toEqual([
      { label: 'PS-3 - Morning Class', value: 3, raw: { id: 3, code: 'PS-3', name: 'Morning Class' } },
    ])
    expect(schedules.teacherOptions.value[0]).toMatchObject({ value: 'usr_teacher' })

    await schedules.saveSchedule({ class_id: 3, activity_label: 'Music Time' })
    await schedules.archiveSchedule(21)
    await nextTick()

    expect(mockCreateSchedule).toHaveBeenCalledWith({ class_id: 3, activity_label: 'Music Time' })
    expect(mockArchiveSchedule).toHaveBeenCalledWith(21)
    expect(schedules.errorMessage.value).toBe('')
  })

  it('captures backend conflict payloads when a save is rejected', async () => {
    const schedules = usePreschoolSchedules()

    mockCreateSchedule.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Schedule conflict detected.',
          data: {
            conflicts: [{ type: 'teacher', message: 'Same teacher has an overlapping schedule.' }],
          },
        },
      },
    })

    await expect(schedules.saveSchedule({ class_id: 3, activity_label: 'Music Time' })).rejects.toBeTruthy()
    expect(schedules.conflicts.value).toEqual([
      { type: 'teacher', message: 'Same teacher has an overlapping schedule.' },
    ])
    expect(schedules.errorMessage.value).toContain('Schedule conflict detected.')
  })
})
