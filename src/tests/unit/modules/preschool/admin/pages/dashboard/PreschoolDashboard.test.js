import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolDashboard from '@/modules/preschool/admin/pages/dashboard/PreschoolDashboard.vue'

const mockDashboard = vi.fn(() =>
  Promise.resolve({
    academicYear: { currentAcademicYear: '2026 - 2027' },
    term: { currentTerm: 'Term 1' },
    summary: {
      students: 20,
      classes: 4,
      teachers: 3,
      attendanceToday: 18,
      pendingPayments: 2,
      overduePayments: 1,
      pendingEnrollments: 3,
      outstandingPayments: 1,
      healthAlerts: 2,
      guardianIssues: 1,
      attendanceExceptions: 1,
    },
    recentAttendance: [],
    upcomingClasses: [],
    paymentSummary: { paid: 15, pending: 2, overdue: 1, cancelled: 0 },
    attendanceAlerts: {
      total: 2,
      open: 1,
      acknowledged: 1,
      overdue: 1,
      byClass: [],
      bySeverity: [],
    },
    recentAttendanceAlerts: [
      {
        id: 'alert-1',
        studentName: 'Alice Student',
        className: 'Morning Nursery',
        guardianName: 'Guardian One',
        followUpStatus: 'open',
        alertLabel: 'Repeated Absence',
      },
    ],
  }),
)

const mockSchedules = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 'schedule-1',
        classId: 'class-1',
        className: 'Morning Nursery',
        teacherName: 'Teacher Sarah',
        room: 'Room A',
        startTime: '08:00',
        endTime: '10:00',
        dayOfWeek: 1,
      },
    ],
  }),
)

const mockTodaySessions = vi.fn(() =>
  Promise.resolve({
    items: [
      {
        id: 'session-1',
        scheduleId: 'schedule-1',
        classId: 'class-1',
        className: 'Morning Nursery',
        teacherName: 'Teacher Sarah',
        roomName: 'Room A',
        startTime: '08:00',
        endTime: '10:00',
        attendanceDate: '2026-06-27',
        status: 'open',
      },
    ],
  }),
)

const mockReportsDashboard = vi.fn(() =>
  Promise.resolve({
    dashboard: {
      generatedAt: '2026-06-27T09:30:00+07:00',
      kpis: {
        attendanceRate: 96,
        absenceRate: 4,
        lateRate: 1,
        newEnrollments: 5,
        activeStudents: 20,
        totalStudents: 20,
        assessmentCompletion: 88,
        atRiskStudents: 2,
        openHealthAlerts: 2,
        openGuardianIssues: 1,
        revenue: 1825,
        outstandingBalances: 250,
        overdueInvoices: 1,
        averageScore: 82,
      },
      modules: {},
      executiveHealth: {
        enrollment: { status: 'warning', value: 3 },
        attendance: { status: 'warning', value: 96, exceptions: 1 },
        billing: { status: 'warning', value: 250 },
        assessment: { status: 'healthy', value: 88 },
        health: { status: 'warning', value: 2, critical: 0 },
        guardians: { status: 'warning', value: 1 },
      },
      cards: [],
      risk: {},
    },
  }),
)

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolDashboard: (...args) => mockDashboard(...args),
  fetchPreschoolClasses: vi.fn(() => Promise.resolve({ items: [] })),
  fetchPreschoolTeachers: vi.fn(() => Promise.resolve({ items: [] })),
  fetchPreschoolStudents: vi.fn(() => Promise.resolve({ items: [] })),
  fetchPreschoolAttendance: vi.fn(() => Promise.resolve({ items: [] })),
}))

vi.mock('@/modules/preschool/services/api/preschoolScheduleApi', () => ({
  fetchSchedules: (...args) => mockSchedules(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolAttendanceSessionApi', () => ({
  fetchTodayAttendanceSessions: (...args) => mockTodaySessions(...args),
}))

vi.mock('@/modules/preschool/services/api/preschoolReportingApi', () => ({
  fetchReportsDashboard: (...args) => mockReportsDashboard(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

async function mountPage() {
  const wrapper = mountWithPlugins(PreschoolDashboard, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1></header>' },
        RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        DashboardHeroSection: { props: ['title'], template: '<section>{{ title }}</section>' },
        DashboardSummarySection: { props: ['cards'], template: '<div class="summary">{{ cards?.[0]?.title }}</div>' },
        DashboardPrioritySection: { props: ['title'], template: '<div class="priority">{{ title }}</div>' },
        DashboardHealthSection: { props: ['title'], template: '<div class="health">{{ title }}</div>' },
        DashboardInsightsSection: { props: ['title'], template: '<div class="insights">{{ title }}</div>' },
        DashboardOperationsSection: { props: ['title'], template: '<div class="ops">{{ title }}</div>' },
        AppStatusChip: { props: ['label'], template: '<span class="chip">{{ label }}</span>' },
      },
    },
  })

  await flushPromises()
  return wrapper
}

describe('PreschoolDashboard', () => {
  it('renders the operational summary from backend dashboard data', async () => {
    const wrapper = await mountPage()

    expect(mockDashboard).toHaveBeenCalled()
    expect(mockSchedules).toHaveBeenCalled()
    expect(mockTodaySessions).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Operational Summary')
    expect(wrapper.text()).toContain('Schedule')
    expect(wrapper.text()).toContain('Morning Nursery')
  })
})
