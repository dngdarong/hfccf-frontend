import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolReportsDashboard from '@/modules/preschool/admin/pages/reports/PreschoolReportsDashboard.vue'
import { fetchReportsDashboard } from '@/modules/preschool/services/api/preschoolReportingApi'

const routerPush = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ push: routerPush }),
  }
})

vi.mock('@/modules/preschool/services/api/preschoolReportingApi', () => ({
  fetchReportsDashboard: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    ReportFilterBar: { template: '<div data-testid="report-filter-bar"></div>' },
    ReportSummaryCards: { props: ['cards'], template: '<div data-testid="report-summary-cards"><span v-for="card in cards" :key="card.title">{{ card.title }} {{ card.value }}</span></div>' },
    EmptyReportState: { props: ['title', 'subtitle'], template: '<div data-testid="report-empty-state"><h2>{{ title }}</h2><p>{{ subtitle }}</p></div>' },
    Button: { props: ['label'], emits: ['click'], template: '<button @click="$emit(\'click\')"><slot />{{ label }}</button>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  fetchReportsDashboard.mockResolvedValue({
    dashboard: {
      report: 'dashboard',
      kpis: {
        attendanceRate: 96,
        revenue: 1825,
        openHealthAlerts: 2,
        assessmentCompletion: 88,
      },
      modules: {
        attendance: { attendance_rate: 96 },
        assessments: { completion_rate: 88 },
        health: { open_alerts: 2 },
        payments: { revenue: 1825 },
        enrollments: { new_enrollments: 11 },
        guardians: { open_issues: 1 },
      },
    },
  })
})

describe('PreschoolReportsDashboard', () => {
  it('renders the reports hub and dashboard metrics', async () => {
    const wrapper = mountWithPlugins(PreschoolReportsDashboard, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Preschool Reporting Center')
    expect(wrapper.text()).toContain('Attendance Rate')
    expect(wrapper.text()).toContain('Revenue')
    expect(wrapper.text()).toContain('Open Health Alerts')
    expect(wrapper.text()).toContain('Assessment Completion')
    expect(wrapper.text()).toContain('Attendance Reports')
    expect(wrapper.text()).toContain('Assessment Reports')
    expect(wrapper.text()).toContain('Health Reports')
    expect(wrapper.text()).toContain('Payment Reports')
    expect(wrapper.text()).toContain('Enrollment Reports')
    expect(wrapper.text()).toContain('Guardian Reports')
    expect(wrapper.text()).toContain('96')
    expect(wrapper.text()).toContain('1825')
  })

  it('navigates to the attendance and assessment report pages', async () => {
    const wrapper = mountWithPlugins(PreschoolReportsDashboard, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(routerPush).toHaveBeenCalledWith({ name: 'dashboard-preschool-admin-reports-attendance' })
    expect(routerPush).toHaveBeenCalledWith({ name: 'dashboard-preschool-admin-reports-assessments' })
  })
})
