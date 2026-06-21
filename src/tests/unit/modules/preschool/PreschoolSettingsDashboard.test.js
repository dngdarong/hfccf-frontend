import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import { canAccessRoute } from '@/services/accessControl'
import { preschoolRoutes } from '@/modules/preschool/routes'
import PreschoolSettingsDashboard from '@/modules/preschool/admin/pages/settings/PreschoolSettingsDashboard.vue'
import { fetchPreschoolSettingsDashboard } from '@/modules/preschool/services/preschoolApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolSettingsDashboard: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: { props: ['label'], template: '<button>{{ label }}<slot /></button>' },
    PreschoolSettingsSectionCard: { template: '<section><slot /></section>' },
  }
}

function makeRouteMatch(route) {
  return { matched: [{ meta: route.meta }] }
}

function makeUser(role, scope = 'admin', domain = 'preschool') {
  return {
    role,
    scope,
    domain,
  }
}

describe('Preschool settings dashboard', () => {
  it('shows the loading state before the dashboard request resolves', async () => {
    let resolveDashboard
    fetchPreschoolSettingsDashboard.mockReturnValueOnce(new Promise((resolve) => {
      resolveDashboard = resolve
    }))

    const wrapper = mountWithPlugins(PreschoolSettingsDashboard, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    expect(wrapper.find('[data-testid="settings-dashboard-loading"]').exists()).toBe(true)

    resolveDashboard({
      academic: { activeAcademicYear: '', activeAcademicYearDateRange: '', activeTerm: '', activeTermDateRange: '', academicStatus: '', isConfigured: false },
      attendance: { lateThresholdMinutes: '', absenceAlertDays: '', schoolWeekLabel: '', calendarEventsCount: '', isConfigured: false },
      payments: { feeTypesCount: '', paymentMethodsCount: '', lateFeeEnabled: false, gracePeriodDays: '', invoicePrefix: '', receiptPrefix: '', lateFeeType: '', lateFeeAmount: '', prorationEnabled: false, isConfigured: false },
      assessments: { passingScore: '', weightingEnabled: false, gradeBandsCount: '', assessmentCategoriesCount: '', reportPeriodsCount: '', isConfigured: false },
      health: {
        criticalAlertEnabled: false,
        severityLevelsCount: '',
        incidentCategoriesCount: '',
        vaccinationCategoriesCount: '',
        healthCheckCategoriesCount: '',
        medicationReminderEnabled: false,
        vaccinationReminderEnabled: false,
        isConfigured: false,
      },
      preferences: {
        enrollmentRulesLabel: '',
        studentCodeFormatLabel: '',
        classCapacityLabel: '',
        guardianRulesLabel: '',
        communicationRulesLabel: '',
        isConfigured: false,
      },
    })

    await flushPromises()
    expect(wrapper.find('[data-testid="settings-dashboard-loading"]').exists()).toBe(false)
  })

  it('renders empty state copy when the dashboard payload is blank', async () => {
    fetchPreschoolSettingsDashboard.mockResolvedValueOnce({
      academic: { activeAcademicYear: '', activeAcademicYearDateRange: '', activeTerm: '', activeTermDateRange: '', academicStatus: '', isConfigured: false },
      attendance: { lateThresholdMinutes: '', absenceAlertDays: '', schoolWeekLabel: '', calendarEventsCount: '', isConfigured: false },
      payments: { feeTypesCount: '', paymentMethodsCount: '', lateFeeEnabled: false, gracePeriodDays: '', invoicePrefix: '', receiptPrefix: '', lateFeeType: '', lateFeeAmount: '', prorationEnabled: false, isConfigured: false },
      assessments: { passingScore: '', weightingEnabled: false, gradeBandsCount: '', assessmentCategoriesCount: '', reportPeriodsCount: '', isConfigured: false },
      health: {
        criticalAlertEnabled: false,
        severityLevelsCount: '',
        incidentCategoriesCount: '',
        vaccinationCategoriesCount: '',
        healthCheckCategoriesCount: '',
        medicationReminderEnabled: false,
        vaccinationReminderEnabled: false,
        isConfigured: false,
      },
      preferences: {
        enrollmentRulesLabel: '',
        studentCodeFormatLabel: '',
        classCapacityLabel: '',
        guardianRulesLabel: '',
        communicationRulesLabel: '',
        isConfigured: false,
      },
    })

    const wrapper = mountWithPlugins(PreschoolSettingsDashboard, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.find('[data-testid="settings-dashboard-empty"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No Academic Year Configured')
    expect(wrapper.text()).toContain('No Fee Types Configured')
    expect(wrapper.text()).toContain('No Payment Methods Configured')
    expect(wrapper.text()).toContain('No Grace Period Configured')
    expect(wrapper.text()).toContain('No Invoice Prefix Configured')
    expect(wrapper.text()).toContain('No Receipt Prefix Configured')
    expect(wrapper.text()).toContain('No Preschool settings have been configured yet.')
  })

  it('renders the live attendance summary fields from the dashboard payload', async () => {
    fetchPreschoolSettingsDashboard.mockResolvedValueOnce({
      academic: { activeAcademicYear: '2026 - 2027', activeAcademicYearDateRange: '2026-07-01 - 2027-06-30', activeTerm: 'Term 1', activeTermDateRange: '2026-07-01 - 2026-09-30', academicStatus: 'Active', isConfigured: true },
      attendance: { lateThresholdMinutes: 15, absenceAlertDays: 3, schoolWeekLabel: 'Mon-Fri', calendarEventsCount: 12, isConfigured: true },
      payments: { feeTypesCount: 6, paymentMethodsCount: 5, lateFeeEnabled: true, gracePeriodDays: 5, invoicePrefix: 'INV', receiptPrefix: 'RCT', lateFeeType: 'fixed', lateFeeAmount: 5, prorationEnabled: false, isConfigured: true },
      assessments: { passingScore: 60, weightingEnabled: true, gradeBandsCount: 5, assessmentCategoriesCount: 6, reportPeriodsCount: 4, isConfigured: true },
      health: {
        criticalAlertEnabled: true,
        severityLevelsCount: 4,
        incidentCategoriesCount: 6,
        vaccinationCategoriesCount: 5,
        healthCheckCategoriesCount: 2,
        medicationReminderEnabled: true,
        vaccinationReminderEnabled: false,
        isConfigured: true,
      },
      preferences: {
        enrollmentRulesLabel: '24-60 months',
        studentCodeFormatLabel: 'PS-2026-0001',
        classCapacityLabel: '18 students - 1:10 ratio - Waitlist enabled',
        guardianRulesLabel: 'Min 1 - Max 2 - Primary guardian required - Pickup authorization required',
        communicationRulesLabel: 'Attendance: On - Assessment: On - Health: On - Enrollment: On',
        isConfigured: true,
      },
    })

    const wrapper = mountWithPlugins(PreschoolSettingsDashboard, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('Enabled')
    expect(wrapper.text()).toContain('60')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('6')
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('Fee Types')
    expect(wrapper.text()).toContain('Payment Methods')
    expect(wrapper.text()).toContain('Grace Period')
    expect(wrapper.text()).toContain('Late Fee')
    expect(wrapper.text()).toContain('INV')
    expect(wrapper.text()).toContain('RCT')
    expect(wrapper.text()).toContain('Mon-Fri')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('Enrollment Rules')
    expect(wrapper.text()).toContain('Student Code Format')
    expect(wrapper.text()).toContain('Class Capacity')
    expect(wrapper.text()).toContain('Guardian Rules')
    expect(wrapper.text()).toContain('Communication Rules')
    expect(wrapper.text()).toContain('Critical Alerts')
    expect(wrapper.text()).toContain('Severity Levels')
    expect(wrapper.text()).toContain('Incident Categories')
    expect(wrapper.text()).toContain('Vaccination Categories')
    expect(wrapper.text()).toContain('Health Check Categories')
    expect(wrapper.text()).toContain('Reminder Status')
  })

  it('keeps the settings dashboard route admin-only', () => {
    const dashboardRoute = preschoolRoutes.find((route) => route.name === 'dashboard-preschool-admin-settings')

    expect(canAccessRoute(makeUser('teacher-preschool', 'staff', 'preschool'), makeRouteMatch(dashboardRoute))).toBe(false)
    expect(canAccessRoute(makeUser('adminpreschool', 'admin', 'preschool'), makeRouteMatch(dashboardRoute))).toBe(true)
    expect(canAccessRoute(makeUser('superadmin', 'super_admin', 'global'), makeRouteMatch(dashboardRoute))).toBe(true)
  })
})
