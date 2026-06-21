import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import { preschoolRoutes } from '@/modules/preschool/routes'
import PreschoolSettingsDashboard from '@/modules/preschool/admin/pages/settings/PreschoolSettingsDashboard.vue'
import { fetchPreschoolSettingsDashboard } from '@/modules/preschool/services/preschoolApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolSettingsDashboard: vi.fn(),
}))

// Keep the Preschool settings page mount-tested so route wiring, summary copy,
// and the reusable section layout stay stable while the configuration area
// remains local-only.
beforeEach(() => {
  vi.clearAllMocks()
})

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Card: { template: '<section><slot name="content" /></section>' },
    Button: { props: ['label'], template: '<button>{{ label }}<slot /></button>' },
    PreschoolAcademicYearSettings: { template: '<div class="academic-year-stub" />' },
    PreschoolTermSetup: { template: '<div class="term-setup-stub" />' },
    PreschoolClassConfiguration: { template: '<div class="class-config-stub" />' },
    PreschoolAttendanceConfiguration: { template: '<div class="attendance-config-stub" />' },
    PreschoolPaymentConfiguration: { template: '<div class="payment-config-stub" />' },
    PreschoolSettingsSectionCard: { template: '<div><slot /></div>' },
  }
}

describe('Preschool settings page', () => {
  it('exposes the stable settings dashboard route structure', () => {
    expect(
      preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings' && route.path === '/preschool/settings'),
    ).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-academic')).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-attendance')).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-payments')).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-assessments')).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-health')).toBe(true)
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-preferences')).toBe(true)
  })

  it('mounts the dashboard page and renders the dashboard summary copy', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    fetchPreschoolSettingsDashboard.mockResolvedValue({
      academic: {
        activeAcademicYear: '2025 - 2026',
        activeAcademicYearDateRange: '2025-06-01 - 2026-05-31',
        activeTerm: 'Term 1',
        activeTermDateRange: '2025-06-01 - 2025-08-31',
        academicStatus: 'Active',
        isConfigured: true,
      },
      attendance: {
        lateThresholdMinutes: 15,
        absenceAlertDays: 3,
        schoolWeekLabel: 'Mon–Fri',
        calendarEventsCount: 12,
        isConfigured: true,
      },
      payments: {
        currency: 'USD',
        invoicePrefix: 'INV',
        receiptPrefix: 'REC',
        isConfigured: true,
      },
      assessments: {
        activeGradingScale: 'A-F',
        assessmentCategories: ['Reading', 'Writing'],
        isConfigured: true,
      },
      health: {
        alertSeverityLevels: ['Low', 'Medium', 'High'],
        healthCategories: ['Allergies', 'Medication'],
        isConfigured: true,
      },
      preferences: {
        organizationName: 'HFCCF',
        language: 'English',
        brandingStatus: 'Configured',
        isConfigured: true,
      },
    })

    const wrapper = mountWithPlugins(PreschoolSettingsDashboard, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Preschool Settings')
    expect(wrapper.text()).toContain('Preschool Settings Center')
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('Mon–Fri')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('Open Academic Settings')
    expect(wrapper.text()).toContain('Configured')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
