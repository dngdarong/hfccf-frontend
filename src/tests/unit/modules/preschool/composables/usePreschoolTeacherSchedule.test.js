import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { usePreschoolTeacherSchedule } from '@/modules/preschool/composables/usePreschoolTeacherSchedule'

const mockFetchMySchedule = vi.fn()
const mockFetchTeacherSchedule = vi.fn()
const mockFetchPreschoolTeachers = vi.fn()
const mockFetchAcademicLifecycle = vi.fn()

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolScheduleApi', () => ({
  fetchMySchedule: (...args) => mockFetchMySchedule(...args),
  fetchTeacherSchedule: (...args) => mockFetchTeacherSchedule(...args),
}))

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolTeachers: (...args) => mockFetchPreschoolTeachers(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: (...args) => mockFetchAcademicLifecycle(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchMySchedule.mockResolvedValue({
    teacher: { name: 'Teacher Sarah', username: 'teacher.sarah' },
    items: [{ id: 'schedule-1', dayOfWeek: 1, activityLabel: 'Circle Time' }],
    raw: {
      currentContext: { academic_year_id: 9, term_id: 3 },
    },
  })

  mockFetchTeacherSchedule.mockResolvedValue({
    teacher: { name: 'Teacher Sarah', username: 'teacher.sarah' },
    items: [{ id: 'schedule-1', dayOfWeek: 1, activityLabel: 'Circle Time' }],
  })

  mockFetchPreschoolTeachers.mockResolvedValue({
    items: [
      { id: 'teacher-1', fullName: 'Teacher Sarah', username: 'teacher.sarah' },
    ],
  })
})

describe('usePreschoolTeacherSchedule', () => {
  it('loads my schedule without calling academic lifecycle settings endpoints', async () => {
    const schedule = usePreschoolTeacherSchedule()

    const bundle = await schedule.loadMySchedule()
    await nextTick()

    expect(mockFetchMySchedule).toHaveBeenCalledTimes(1)
    expect(mockFetchAcademicLifecycle).not.toHaveBeenCalled()
    expect(bundle).toMatchObject({
      teacher: { name: 'Teacher Sarah' },
      items: [{ id: 'schedule-1', dayOfWeek: 1, activityLabel: 'Circle Time' }],
    })
    expect(schedule.lifecycleContext.value).toMatchObject({
      academic_year_id: 9,
      term_id: 3,
    })
  })

  it('keeps teacher schedule lookup read-only and avoids lifecycle settings calls', async () => {
    const schedule = usePreschoolTeacherSchedule()

    await schedule.loadTeacherOptions()
    await schedule.loadTeacherSchedule('teacher-1')

    expect(mockFetchPreschoolTeachers).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(mockFetchTeacherSchedule).toHaveBeenCalledWith('teacher-1')
    expect(mockFetchAcademicLifecycle).not.toHaveBeenCalled()
  })
})
