import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ReportManagement from '@/modules/preschool/admin/pages/reports/ReportManagement.vue'
import StudentReports from '@/modules/preschool/admin/pages/reports/StudentReports.vue'
import ClassroomReports from '@/modules/preschool/admin/pages/reports/ClassroomReports.vue'

const mockPush = vi.fn()
const mockUseRoute = vi.fn()
const mockUseRouter = vi.fn()
const mockUsePreschoolReports = vi.fn()
const mockUsePreschoolClassroomReports = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => mockUseRoute(),
    useRouter: () => mockUseRouter(),
  }
})

vi.mock('@/modules/preschool/composables/usePreschoolReports', () => ({
  PRESCHOOL_REPORT_PERIOD_TYPE_OPTIONS: [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Term', value: 'term' },
    { label: 'Annual', value: 'annual' },
  ],
  usePreschoolReports: () => mockUsePreschoolReports(),
}))

vi.mock('@/modules/preschool/composables/usePreschoolClassroomReports', () => ({
  PRESCHOOL_CLASSROOM_REPORT_PERIOD_TYPE_OPTIONS: [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Term', value: 'term' },
    { label: 'Annual', value: 'annual' },
  ],
  usePreschoolClassroomReports: () => mockUsePreschoolClassroomReports(),
}))

const stubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
  Button: { template: '<button><slot /></button>' },
  Dropdown: { props: ['modelValue', 'options'], template: '<div class="dropdown">{{ options?.length || 0 }}</div>' },
  ReportPeriodSelector: { props: ['label', 'periods', 'modelValue'], template: '<div><span>{{ label }}</span><small>{{ periods?.length || 0 }}</small></div>' },
  StudentProgressReport: { props: ['report', 'loading'], template: '<div class="student-report">{{ report?.summary?.finalizedAssessments || 0 }}</div>' },
  ClassroomProgressTable: { props: ['report', 'loading'], template: '<div class="classroom-report">{{ report?.summary?.finalizedAssessments || 0 }}</div>' },
  ReportSummaryCard: { props: ['title', 'value', 'caption'], template: '<div class="card">{{ title }} {{ value }}</div>' },
  ProgressTrendList: { props: ['items'], template: '<div class="trend">{{ items?.length || 0 }}</div>' },
}

// Keep the Preschool report pages covered so the real workflows do not regress
// back into placeholders or mount-time Vue warnings.
beforeEach(() => {
  vi.clearAllMocks()
  mockUseRouter.mockReturnValue({ push: mockPush })
  mockUseRoute.mockReturnValue({ query: {} })
})

function mountPage(page, messages = enPreschool) {
  return mountWithPlugins(page, {
    messages: {
      en: messages,
    },
    global: {
      stubs,
    },
  })
}

describe('Preschool report pages', () => {
  it('renders the report overview with finalized period rows', async () => {
    mockUsePreschoolReports.mockReturnValue({
      errorMessage: ref(''),
      loadLookupData: vi.fn().mockResolvedValue(undefined),
      loadReportPeriodOptions: vi.fn().mockResolvedValue(undefined),
      loading: ref(false),
      reportPeriodLockMessage: ref(''),
      reportPeriods: ref([{ label: 'Term 1', assessmentCount: 2, studentCount: 1, classCount: 1 }]),
      studentOptions: ref([{ id: 1, label: 'Student One' }]),
      selectedReportPeriod: ref({ label: 'Term 1', status: 'finalized' }),
    })

    const wrapper = mountPage(ReportManagement)
    await flushPromises()

    expect(wrapper.text()).toContain(enPreschool.preschoolReportsPage.title)
    expect(wrapper.text()).toContain('Term 1')
    expect(wrapper.text()).toContain(enPreschool.preschoolReportsPage.actions.openStudentReports)
  })

  it('renders the student report page with a selected finalized report', async () => {
    mockUsePreschoolReports.mockReturnValue({
      errorMessage: ref(''),
      loadLookupData: vi.fn().mockResolvedValue(undefined),
      loadReportPeriodOptions: vi.fn().mockResolvedValue(undefined),
      loadStudentReport: vi.fn().mockResolvedValue(undefined),
      loading: ref(false),
      reportBundle: ref({
        student: { id: 1, fullName: 'Lina Chan' },
        periods: [{ label: 'Term 1' }],
        period: { label: 'Term 1' },
        report: { summary: { finalizedAssessments: 2 } },
      }),
      reportPeriods: ref([{ label: 'Term 1' }]),
      selectedPeriodType: ref('term'),
      selectedPeriodLabel: ref('Term 1'),
      selectedStudentId: ref('1'),
      setSelectedPeriodLabel: vi.fn(),
      setSelectedPeriodType: vi.fn(),
      setSelectedStudentId: vi.fn(),
      studentOptions: ref([{ id: 1, label: 'Lina Chan (S-001)' }]),
    })

    const wrapper = mountPage(StudentReports)
    await flushPromises()

    expect(wrapper.text()).toContain(enPreschool.preschoolStudentReportsPage.title)
    expect(wrapper.text()).toContain('2')
  })

  it('renders the classroom report page with a selected finalized report', async () => {
    mockUsePreschoolClassroomReports.mockReturnValue({
      classOptions: ref([{ id: 3, label: 'PS-3 - Morning Class' }]),
      errorMessage: ref(''),
      loadReportPeriodOptions: vi.fn().mockResolvedValue(undefined),
      loadClassroomReport: vi.fn().mockResolvedValue(undefined),
      loadLookupData: vi.fn().mockResolvedValue(undefined),
      loading: ref(false),
      reportBundle: ref({
        class: { id: 3, name: 'Morning Class' },
        periods: [{ label: 'Term 2' }],
        period: { label: 'Term 2' },
        report: { summary: { finalizedAssessments: 4 }, studentSummaries: [], attendanceSummary: {}, categorySummaries: [], observations: [], assessments: [] },
      }),
      reportPeriods: ref([{ label: 'Term 2' }]),
      selectedPeriodType: ref('term'),
      selectedClassId: ref('3'),
      selectedPeriodLabel: ref('Term 2'),
      setSelectedClassId: vi.fn(),
      setSelectedPeriodType: vi.fn(),
      setSelectedPeriodLabel: vi.fn(),
    })

    const wrapper = mountPage(ClassroomReports)
    await flushPromises()

    expect(wrapper.text()).toContain(enPreschool.preschoolClassroomReportsPage.title)
    expect(wrapper.text()).toContain('4')
  })
})
