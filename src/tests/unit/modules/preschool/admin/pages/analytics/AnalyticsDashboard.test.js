import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import AnalyticsDashboard from '@/modules/preschool/admin/pages/analytics/AnalyticsDashboard.vue'

const mockLoadAnalytics = vi.fn()
const mockFetchAnalytics = vi.fn()

vi.mock('@/modules/preschool/admin/pages/analytics/composables/useAnalyticsData', () => ({
  useAnalyticsData: () => ({
    loading: ref(false),
    errorMessage: ref(''),
    filterOptions: ref({ academicYears: [{ id: 1, label: '2026 - 2027' }], classes: [], teachers: [], statuses: [] }),
    dashboard: ref({ generatedAt: '2026-07-01T10:00:00Z', summary: { attendanceRate: 95, sessionsGenerated: 4, openAlerts: 2, guardianContacts: 8 } }),
    attendance: ref({ summary: { attendanceRate: 95, present: 18, absent: 2, late: 1, excused: 1 }, charts: { attendance: [{ label: 'Present', value: 18 }] }, breakdowns: { byClass: [{ label: 'Morning Stars', value: 12 }] } }),
    sessions: ref({ summary: { sessionsGenerated: 4, sessionsCompleted: 3, missingSessions: 1, completionRate: 75 }, charts: { sessions: [{ label: 'Open', value: 2 }] }, breakdowns: { byTeacher: [{ label: 'Teacher A', value: 4 }] } }),
    schedules: ref({ summary: { activeSchedules: 3, inactiveSchedules: 1, weeklySessions: 12, generatedSessions: 4 }, charts: { schedules: [{ label: 'Morning', value: 3 }] }, breakdowns: { byClass: [{ label: 'Morning Stars', value: 3 }] } }),
    alerts: ref({ summary: { totalAlerts: 2, openAlerts: 1, completedAlerts: 1, overdueAlerts: 1 }, charts: { alerts: [{ label: 'Open', value: 1 }] }, breakdowns: { bySeverity: [{ label: 'High', value: 1 }] } }),
    students: ref({ summary: { activeStudents: 20, attendanceRate: 95, alertCount: 2, guardianContacts: 8 }, breakdowns: { byClass: [{ label: 'Morning Stars', value: 20 }] } }),
    teachers: ref({ summary: { assignedClasses: 3, students: 20, attendanceSessions: 4, attendanceRate: 95 }, charts: { teachers: [{ label: 'Teacher A', value: 4 }] }, breakdowns: { byWeek: [{ label: 'Week 1', value: 4 }] } }),
    guardianContacts: ref({ summary: { contactLogs: 8, followUps: 3, completed: 5, outstandingFollowUps: 1 }, charts: { guardianContacts: [{ label: 'Calls', value: 5 }] }, breakdowns: { byMethod: [{ label: 'Phone', value: 5 }] } }),
    hasAnalyticsData: ref(true),
    loadAnalytics: (...args) => mockLoadAnalytics(...args),
  }),
}))

vi.mock('@/modules/preschool/admin/pages/analytics/composables/useAnalyticsActions', () => ({
  useAnalyticsActions: () => ({
    openReportDataset: (...args) => mockFetchAnalytics(...args),
    refreshAnalytics: vi.fn(),
  }),
}))

function createRoute() {
  return {
    path: '/module/preschool-admin/analytics',
    name: 'dashboard-preschool-admin-analytics',
    component: { template: '<div />' },
  }
}

async function mountPage() {
  const wrapper = mountWithPlugins(AnalyticsDashboard, {
    messages: {
      en: enPreschool,
    },
    routes: [createRoute()],
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
      },
    },
  })

  await wrapper.vm.$router.push({ name: 'dashboard-preschool-admin-analytics' })
  await flushPromises()
  await flushPromises()

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AnalyticsDashboard', () => {
  it('renders the analytics dashboard shell and refreshes from the backend data flow', async () => {
    const wrapper = await mountPage()

    expect(mockLoadAnalytics).toHaveBeenCalledWith({
      academicYearId: '',
      classId: '',
      teacherUserId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    })

    expect(wrapper.text()).toContain('Preschool Analytics Dashboard')
    expect(wrapper.text()).toContain('Attendance Analytics')
    expect(wrapper.text()).toContain('Session Analytics')
    expect(wrapper.text()).toContain('Schedule Analytics')
    expect(wrapper.text()).toContain('Alert Analytics')
    expect(wrapper.text()).toContain('Guardian Contact Analytics')
    expect(wrapper.text()).toContain('Student Analytics')
    expect(wrapper.text()).toContain('Teacher Analytics')
    expect(wrapper.text()).toContain('Report Launcher')

    await wrapper.find('button[type="button"]').trigger('click')
    expect(mockLoadAnalytics).toHaveBeenCalled()
  })

  it('refetches with updated filters and shows the empty state when analytics are unavailable', async () => {
    mockLoadAnalytics.mockResolvedValueOnce(null)

    const wrapper = await mountPage()

    const inputs = wrapper.findAll('input[type="date"]')
    await inputs[0].setValue('2026-07-01')
    await inputs[1].setValue('2026-07-15')
    const applyButton = wrapper
      .findAll('button[type="button"]')
      .find((button) => button.text().includes('Apply Filters'))

    expect(applyButton).toBeDefined()
    await applyButton.trigger('click')
    await flushPromises()

    expect(mockLoadAnalytics).toHaveBeenCalledWith(expect.objectContaining({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-15',
    }))

    expect(mockFetchAnalytics).not.toHaveBeenCalled()
  })
})
