import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enCommon from '@/i18n/en/common'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import AssessmentDashboard from '@/modules/preschool/admin/pages/assessments/AssessmentDashboard.vue'
import AssessmentListPage from '@/modules/preschool/admin/pages/assessments/AssessmentListPage.vue'
import AssessmentReportsPage from '@/modules/preschool/admin/pages/assessments/AssessmentReportsPage.vue'

const mockLoadLookupData = vi.fn(() => Promise.resolve())
const mockLoadAssessments = vi.fn(() => Promise.resolve())
const mockSaveAssessment = vi.fn(() => Promise.resolve({ id: 21 }))
const mockUpdateAssessment = vi.fn(() => Promise.resolve({ id: 21 }))
const mockFinalizeAssessment = vi.fn(() => Promise.resolve({ id: 21 }))
const mockArchiveAssessment = vi.fn(() => Promise.resolve({ id: 21 }))

vi.mock('@/modules/preschool/composables/useAssessmentData', () => ({
  useAssessmentData: () => ({
    loadAllLookupData: mockLoadLookupData,
    loadAssessments: mockLoadAssessments,
    loadCategories: vi.fn(() => Promise.resolve()),
    loadStudents: vi.fn(() => Promise.resolve()),
    loadClasses: vi.fn(() => Promise.resolve()),
    assessments: ref([{ id: 11, status: 'draft', score: 78, student: { fullName: 'Alice Student' } }]),
    categories: ref([{ id: 1, name: 'Learning Progress' }]),
    studentOptions: ref([{ label: 'Alice Student', value: 7 }]),
    classOptions: ref([{ label: 'PS-3 - Morning Class', value: 3 }]),
    loading: ref(false),
  }),
}))

vi.mock('@/modules/preschool/composables/useAssessmentReports', () => ({
  useAssessmentReports: () => ({
    summaryStats: ref({ total: 1, completed: 1, pending: 0, average: 78, median: 78 }),
    riskAnalysis: ref({ excellent: 0, good: 1, fair: 0, atRisk: 0 }),
    categoryPerformanceArray: ref([
      { categoryName: 'Learning Progress', average: 78, count: 1, excellentCount: 0, goodCount: 1, fairCount: 0, needsImprovementCount: 0 },
    ]),
    highRiskStudents: ref([]),
    periodComparison: ref([
      { period: 'Q1', count: 1, average: 78, excellent: 0, good: 1, fair: 0, needsImprovement: 0 },
    ]),
    getRiskPercentage: vi.fn(() => 0),
    getImprovementTrend: vi.fn(() => null),
    exportData: ref([{ id: 1 }]),
  }),
}))

vi.mock('@/modules/preschool/stores/assessmentStore', () => ({
  useAssessmentStore: () => ({
    filters: {
      studentId: null,
      classId: null,
      categoryId: null,
      periodLabel: null,
      status: 'all',
      searchQuery: '',
      dateFrom: null,
      dateTo: null,
    },
    isFormOpen: ref(false),
    editingAssessment: ref(null),
    saving: ref(false),
    error: ref(null),
    openCreateForm: vi.fn(),
    openEditForm: vi.fn(),
    closeForm: vi.fn(),
    reset: vi.fn(),
    setFilter: vi.fn(),
    resetFilters: vi.fn(),
    saveAssessment: mockSaveAssessment,
    updateAssessment: mockUpdateAssessment,
    finalize: mockFinalizeAssessment,
    archive: mockArchiveAssessment,
    assessments: ref([]),
  }),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: { template: '<button><slot /></button>' },
    Select: { template: '<div class="select-stub" />' },
    DataTable: { template: '<div class="datatable-stub"><slot /></div>' },
    Column: { template: '<div class="column-stub"><slot /></div>' },
    Dialog: { template: '<div class="dialog-stub"><slot /></div>' },
    InputText: { template: '<div class="input-stub" />' },
    AssessmentWorkspaceCard: { props: ['title'], template: '<div class="workspace-card-stub">{{ title }}</div>' },
    StatCard: { props: ['label'], template: '<div class="stat-card-stub">{{ label }}</div>' },
    ProgressIndicator: { template: '<div class="progress-indicator-stub" />' },
    FilterBar: { template: '<div class="filter-bar-stub" />' },
    AssessmentTable: { template: '<div class="assessment-table-stub" />' },
    AssessmentModal: { template: '<div class="assessment-modal-stub" />' },
    Checkbox: { template: '<div class="checkbox-stub" />' },
    Message: { template: '<div class="message-stub"><slot /></div>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Preschool assessment pages', () => {
  it('mounts the assessment dashboard workspace', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(AssessmentDashboard, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockLoadLookupData).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Assessment Dashboard')
    expect(wrapper.text()).toContain('Workspace Navigation')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the assessment list page and keeps the workflow stable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(AssessmentListPage, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockLoadLookupData).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Assessment List')
    expect(wrapper.text()).toContain('Choose a student to begin.')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('mounts the assessment reports page with localized summary data', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(AssessmentReportsPage, {
      messages: {
        en: { common: enCommon, ...enPreschool },
        kh: { common: enCommon, ...khPreschool },
      },
      global: {
        stubs: stubs(),
      },
    })

    await flushPromises()

    expect(mockLoadLookupData).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Assessment Reports')
    expect(wrapper.text()).toContain('Summary Statistics')
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})


