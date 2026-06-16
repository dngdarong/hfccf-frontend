import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import { preschoolRoutes } from '@/modules/preschool/routes'
import PreschoolSettings from '@/modules/preschool/admin/pages/settings/PreschoolSettings.vue'

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
    Button: { template: '<button><slot /></button>' },
    PreschoolAcademicYearSettings: { template: '<div class="academic-year-stub" />' },
    PreschoolTermSetup: { template: '<div class="term-setup-stub" />' },
    PreschoolClassConfiguration: { template: '<div class="class-config-stub" />' },
    PreschoolAttendanceConfiguration: { template: '<div class="attendance-config-stub" />' },
    PreschoolPaymentConfiguration: { template: '<div class="payment-config-stub" />' },
    PreschoolSettingsSectionCard: { template: '<div><slot /></div>' },
  }
}

describe('Preschool settings page', () => {
  it('exposes the stable admin settings route', () => {
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings')).toBe(true)
  })

  it('mounts the settings page and renders the dashboard summary copy', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(PreschoolSettings, {
      messages: {
        en: enPreschool,
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Preschool Settings')
    expect(wrapper.text()).toContain('2025 - 2026')
    expect(wrapper.text()).toContain('Save Changes')
    expect(wrapper.text()).toContain('Ready for review')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})

