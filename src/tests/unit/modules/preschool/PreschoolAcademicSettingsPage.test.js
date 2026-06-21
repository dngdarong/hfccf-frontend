import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool/settings.js'
import { preschoolRoutes } from '@/modules/preschool/routes'
import PreschoolAcademicSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolAcademicSettingsPage.vue'

const mockLoadAcademicLifecycle = vi.fn()
const mockCreateYear = vi.fn()
const mockUpdateYear = vi.fn()
const mockActivateYear = vi.fn()
const mockCloseYear = vi.fn()
const mockArchiveYear = vi.fn()
const mockCreateTerm = vi.fn()
const mockUpdateTerm = vi.fn()
const mockActivateTerm = vi.fn()
const mockCloseTerm = vi.fn()
const mockArchiveTerm = vi.fn()

const academicYears = ref([
  {
    id: 1,
    name: '2025 - 2026',
    label: '2025 - 2026',
    code: 'AY-2025-2026',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    status: 'active',
    isCurrent: true,
  },
])

const terms = ref([
  {
    id: 11,
    name: 'Term 1',
    academicYearId: 1,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    isCurrent: true,
  },
])

const currentContext = ref({
  academic_year_id: 1,
  term_id: 11,
})

vi.mock('@/modules/preschool/composables/usePreschoolAcademicLifecycle', () => ({
  usePreschoolAcademicLifecycle: () => ({
    academicYears,
    terms,
    currentContext,
    currentAcademicYear: ref(academicYears.value[0]),
    currentTerm: ref(terms.value[0]),
    loading: ref(false),
    saving: ref(false),
    loadAcademicLifecycle: mockLoadAcademicLifecycle,
    createYear: mockCreateYear,
    updateYear: mockUpdateYear,
    activateYear: mockActivateYear,
    closeYear: mockCloseYear,
    archiveYear: mockArchiveYear,
    createTerm: mockCreateTerm,
    updateTerm: mockUpdateTerm,
    activateTerm: mockActivateTerm,
    closeTerm: mockCloseTerm,
    archiveTerm: mockArchiveTerm,
  }),
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
    PreschoolAcademicYearManager: { template: '<div data-testid="year-manager" />' },
    PreschoolTermManager: { template: '<div data-testid="term-manager" />' },
    PreschoolAcademicYearDialog: { template: '<div data-testid="year-dialog" />' },
    PreschoolTermDialog: { template: '<div data-testid="term-dialog" />' },
  }
}

describe('PreschoolAcademicSettingsPage', () => {
  it('renders the academic settings dashboard and wires the academic lifecycle route', async () => {
    const wrapper = mountWithPlugins(PreschoolAcademicSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-settings-academic' && route.path === '/preschool/settings/academic')).toBe(true)
    expect(mockLoadAcademicLifecycle).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Academic Settings')
    expect(wrapper.text()).toContain('2025 - 2026')
    expect(wrapper.text()).toContain('01/06/2025 - 31/05/2026')
    expect(wrapper.text()).toContain('Term 1')
    expect(wrapper.text()).toContain('01/06/2025 - 31/08/2025')
    expect(wrapper.find('[data-testid="year-manager"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="term-manager"]').exists()).toBe(true)
  })
})
