import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import AttendanceAlerts from '@/modules/preschool/admin/pages/attendance/AttendanceAlerts.vue'

const mockFetchPreschoolClasses = vi.fn()
const mockFetchAttendanceSettings = vi.fn()
const mockFetchPreschoolAttendanceAlerts = vi.fn()
const mockGetAbsenceAlertDays = vi.fn()
const mockSetAttendanceConfigurationSnapshot = vi.fn()
const mockFetchPreschoolAttendance = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: (...args) => mockFetchPreschoolClasses(...args),
  fetchPreschoolAttendance: (...args) => mockFetchPreschoolAttendance(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceConfigurationApi', () => ({
  fetchAttendanceSettings: (...args) => mockFetchAttendanceSettings(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceAlertApi', () => ({
  fetchPreschoolAttendanceAlerts: (...args) => mockFetchPreschoolAttendanceAlerts(...args),
}))

vi.mock('@/modules/preschool/services/preschoolAttendanceConfigurationService', () => ({
  getAbsenceAlertDays: (...args) => mockGetAbsenceAlertDays(...args),
  setAttendanceConfigurationSnapshot: (...args) => mockSetAttendanceConfigurationSnapshot(...args),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/attendance-alerts',
    name: 'dashboard-preschool-admin-attendance-alerts',
    component: { template: '<div />' },
  }
}

async function mountPage() {
  const wrapper = mountWithPlugins(AttendanceAlerts, {
    messages: {
      en: enPreschool,
      kh: khPreschool,
    },
    routes: [createRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Button: {
          props: ['type', 'variant', 'size', 'loading'],
          emits: ['click'],
          template: '<button :type="type" :disabled="loading" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })

  await wrapper.vm.$router.push({
    name: 'dashboard-preschool-admin-attendance-alerts',
  })
  await flushPromises()
  await flushPromises()

  return wrapper
}

function mockResolvedData() {
  mockGetAbsenceAlertDays.mockReturnValue(3)
  mockFetchPreschoolClasses.mockResolvedValue({
    items: [
      { id: 'class-1', name: 'Morning Stars' },
    ],
  })
  mockFetchAttendanceSettings.mockResolvedValue({
    absenceAlertDays: 3,
  })
  mockFetchPreschoolAttendanceAlerts.mockResolvedValue({
    items: [
      {
        id: 'alert-1',
        studentId: 'student-1',
        studentName: 'Alice Student',
        classId: 'class-1',
        className: 'Morning Stars',
        guardianId: 'guardian-1',
        guardianName: 'Sokha Guardian',
        guardianPhone: '+855 12 111 111',
        alertType: 'repeated_absence',
        alertLabel: 'Repeated Absence',
        status: 'queued',
        severity: 'high',
        absenceCount: 3,
        threshold: 3,
        sourceType: 'attendance',
        sourceId: 'absence-streak-student-1',
        message: 'Repeated absence follow-up',
        createdAt: '2026-05-13T08:00:00Z',
        followUpStatus: 'open',
      },
      {
        id: 'alert-2',
        studentId: 'student-2',
        studentName: 'Bopha Student',
        classId: 'class-1',
        className: 'Morning Stars',
        guardianId: 'guardian-2',
        guardianName: 'Dara Guardian',
        guardianPhone: '+855 12 222 222',
        alertType: 'repeated_absence',
        alertLabel: 'Repeated Absence',
        status: 'acknowledged',
        severity: 'medium',
        absenceCount: 5,
        threshold: 3,
        sourceType: 'attendance',
        sourceId: 'absence-streak-student-2',
        message: 'Repeated absence follow-up',
        createdAt: '2026-05-12T08:00:00Z',
        followUpStatus: 'acknowledged',
      },
    ],
    summary: {
      total: 2,
      open: 1,
      acknowledged: 1,
      overdue: 0,
      byClass: [
        {
          classId: 'class-1',
          className: 'Morning Stars',
          total: 2,
          open: 1,
          acknowledged: 1,
          overdue: 0,
        },
      ],
      bySeverity: [
        { severity: 'high', total: 1 },
        { severity: 'medium', total: 1 },
      ],
    },
  })

  mockFetchPreschoolAttendance.mockResolvedValue({ items: [] })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockResolvedData()
})

describe('AttendanceAlerts', () => {
  it('fetches canonical attendance alerts and renders backend summary cards', async () => {
    const wrapper = await mountPage()

    expect(mockFetchPreschoolAttendanceAlerts).toHaveBeenCalledWith(
      expect.objectContaining({
        threshold: 3,
        page: 1,
        perPage: 100,
      }),
    )
    expect(mockFetchPreschoolAttendance).not.toHaveBeenCalled()

    expect(wrapper.text()).toContain('Attendance Alerts')
    expect(wrapper.text()).toContain('Alert created from attendance record')
    expect(wrapper.text()).toContain('Repeated Absence')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).toContain('Sokha Guardian')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.findAll('[data-testid="attendance-alert-row"]').length).toBe(2)
  })

  it('sends the selected backend filters and keeps the page on canonical alert records', async () => {
    const wrapper = await mountPage()

    await wrapper.get('select').setValue('class-1')
    await wrapper.findAll('select')[1].setValue('acknowledged')
    await wrapper.findAll('select')[2].setValue(5)
    await wrapper.findAll('input[type="date"]')[0].setValue('2026-05-11')
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-05-13')
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()

    expect(mockFetchPreschoolAttendanceAlerts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        classId: 'class-1',
        status: 'acknowledged',
        threshold: 5,
        dateFrom: '2026-05-11',
        dateTo: '2026-05-13',
      }),
    )
  })

  it('renders the empty state when no alerts are returned', async () => {
    mockFetchPreschoolAttendanceAlerts.mockResolvedValue({
      items: [],
      summary: {
        total: 0,
        open: 0,
        acknowledged: 0,
        overdue: 0,
        byClass: [],
        bySeverity: [],
      },
    })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('No attendance alerts')
  })

  it('exposes the translated attendance alert labels', () => {
    expect(enPreschool.preschoolAttendanceAlertsPage.labels.repeatedAbsence).toBe('Repeated Absence')
    expect(khPreschool.preschoolAttendanceAlertsPage.labels.repeatedAbsence).toBe('អវត្តមានជាប់គ្នា')
  })
})
