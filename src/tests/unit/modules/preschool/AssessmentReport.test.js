import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AssessmentReport from '@/modules/preschool/admin/pages/reports/AssessmentReport.vue'
import * as preschoolApi from '@/modules/preschool/services/preschoolApi'
import * as lifecycleApi from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import * as paginationHelper from '@/modules/preschool/admin/pages/reports/reportPaginationHelper'

vi.mock('@/modules/preschool/services/preschoolApi')
vi.mock('@/modules/preschool/services/api/preschoolAssessmentApi')
vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi')
vi.mock('@/modules/preschool/admin/pages/reports/reportPaginationHelper')
vi.mock('@/layouts/MainLayout.vue', { default: { template: '<div><slot /></div>' } })
vi.mock('@/components/navigation/HeaderSection.vue', { default: { template: '<div><slot /></div>' } })
vi.mock('@/components/buttons/Button.vue', { default: { template: '<button @click="$emit(\'click\')"><slot /></button>' } })

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      preschoolAssessmentReportPage: {
        title: 'Assessment Report',
        subtitle: 'Individual and class assessment reports',
        filters: 'Filters',
        category: 'Category',
        status: 'Assessment Status',
        scope: 'Report Scope',
        individual: 'Individual Student',
        class: 'Entire Class',
        generateReport: 'Generate Report',
        reset: 'Reset',
        emptyState: 'Select filters and click Generate Report to view assessment data',
        categories: { all: 'All Categories' },
        statuses: { all: 'All', draft: 'Draft', finalized: 'Finalized', published: 'Published', archived: 'Archived' },
        messages: { loadFailed: 'Failed to load filters', noStudents: 'No students found' },
      },
      preschoolReportsCenterPage: {
        filters: {
          academicYear: 'Academic Year',
          class: 'Class',
          student: 'Student',
        },
      },
    },
  },
})

describe('AssessmentReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (options = {}) => {
    return mount(AssessmentReport, {
      global: {
        plugins: [i18n],
        stubs: {
          MainLayout: true,
          HeaderSection: true,
          Button: true,
          Select: true,
          DataTable: true,
          Column: true,
          Avatar: true,
          StudentAssessmentDetails: true,
          ClassAssessmentTable: true,
          AssessmentSummaryCards: true,
        },
        ...options.global,
      },
      ...options,
    })
  }

  it('renders the report page with title and filters', async () => {
    preschoolApi.fetchPreschoolClasses.mockResolvedValue({ items: [] })
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({ academicYears: [] })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.filterOptions).toBeDefined()
    expect(wrapper.vm.scopeType).toBe('individual')
  })

  it('loads academic years and classes on mount', async () => {
    const mockAcademicYears = [
      { id: '1', label: '2025-2026' },
      { id: '2', label: '2026-2027' },
    ]

    const mockClasses = [
      { id: 'class1', name: 'Nursery A' },
      { id: 'class2', name: 'Nursery B' },
    ]

    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: mockAcademicYears,
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({ items: mockClasses })
    preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: [] })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.filterOptions.academicYears.length).toBeGreaterThan(0)
    expect(wrapper.vm.filterOptions.classes.length).toBeGreaterThan(0)
  })

  it('loads students when class is changed', async () => {
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [{ id: '1', label: '2025-2026' }],
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({
      items: [{ id: 'class1', name: 'Nursery A' }],
    })

    const mockStudents = [
      { id: 'student1', fullName: 'John Doe', studentCode: '001' },
      { id: 'student2', fullName: 'Jane Smith', studentCode: '002' },
    ]

    preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: mockStudents })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    wrapper.vm.classId = 'class1'
    await wrapper.vm.loadStudents()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.filterOptions.students.length).toBe(2)
  })

  it('disables generate button when required filters are missing', async () => {
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [],
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({ items: [] })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canGenerate).toBeFalsy()
  })

  it('enables generate button when required filters are selected (individual mode)', async () => {
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [{ id: '1', label: '2025-2026' }],
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({
      items: [{ id: 'class1', name: 'Nursery A' }],
    })

    preschoolApi.fetchPreschoolStudents.mockResolvedValue({
      items: [{ id: 'student1', fullName: 'John Doe', studentCode: '001' }],
    })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    wrapper.vm.academicYearId = '1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.studentId = 'student1'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canGenerate).toBeTruthy()
  })

  it('enables generate button when required filters are selected (class mode)', async () => {
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [{ id: '1', label: '2025-2026' }],
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({
      items: [{ id: 'class1', name: 'Nursery A' }],
    })

    preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: [] })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    wrapper.vm.academicYearId = '1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'class'

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canGenerate).toBeTruthy()
  })

  it('filters assessments by category when selected', async () => {
    const mockStudent = { id: 'student1', fullName: 'John Doe', studentCode: '001' }

    const mockAssessments = [
      { id: '1', categoryId: 'math', status: 'finalized', score: 85 },
      { id: '2', categoryId: 'language', status: 'finalized', score: 90 },
      { id: '3', categoryId: 'math', status: 'draft', score: 75 },
    ]

    preschoolApi.fetchPreschoolStudent.mockResolvedValue(mockStudent)
    paginationHelper.fetchAllPages.mockResolvedValue({ items: mockAssessments })

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.categoryId = 'math'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.generateIndividualReport()
    await wrapper.vm.$nextTick()

    const filtered = wrapper.vm.reportData.assessments
    expect(filtered.every(a => a.categoryId === 'math')).toBe(true)
  })

  it('filters assessments by status when selected', async () => {
    const mockStudent = { id: 'student1', fullName: 'John Doe', studentCode: '001' }

    const mockAssessments = [
      { id: '1', categoryId: 'math', status: 'finalized', score: 85, assessment_date: '2026-01-15' },
      { id: '2', categoryId: 'language', status: 'draft', score: 90, assessment_date: '2026-01-16' },
      { id: '3', categoryId: 'math', status: 'draft', score: 75, assessment_date: '2026-01-14' },
    ]

    preschoolApi.fetchPreschoolStudent.mockResolvedValue(mockStudent)
    paginationHelper.fetchAllPages.mockResolvedValue({ items: mockAssessments })

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.assessmentStatus = 'draft'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.generateIndividualReport()
    await wrapper.vm.$nextTick()

    const filtered = wrapper.vm.reportData.assessments
    expect(filtered.every(a => a.status === 'draft')).toBe(true)
  })

  it('generates individual student report', async () => {
    const mockStudent = {
      id: 'student1',
      fullName: 'John Doe',
      studentCode: '001',
      classes: [{ name: 'Nursery A' }],
    }

    const mockAssessments = [
      { id: '1', status: 'finalized', score: 85, assessment_date: '2026-01-15' },
    ]

    preschoolApi.fetchPreschoolStudent.mockResolvedValue(mockStudent)
    paginationHelper.fetchAllPages.mockResolvedValue({ items: mockAssessments })

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.generateIndividualReport()

    expect(wrapper.vm.reportGenerated).toBe(true)
    expect(wrapper.vm.reportData.student).toEqual(mockStudent)
    expect(wrapper.vm.reportData.assessments.length).toBeGreaterThan(0)
  })

  it('generates class report', async () => {
    const mockStudents = [
      { id: 'student1', fullName: 'John Doe', studentCode: '001' },
      { id: 'student2', fullName: 'Jane Smith', studentCode: '002' },
    ]

    const mockAssessments = [
      { id: '1', status: 'finalized', score: 85, assessment_date: '2026-01-15' },
    ]

    preschoolApi.fetchPreschoolStudents.mockResolvedValue({ items: mockStudents })
    paginationHelper.fetchAllPages.mockResolvedValue({ items: mockAssessments })

    const wrapper = createWrapper()

    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'class'

    await wrapper.vm.generateClassReport()

    expect(wrapper.vm.reportGenerated).toBe(true)
    expect(wrapper.vm.reportData.classStudents.length).toBe(2)
  })

  it('sorts assessments by date (newest first)', async () => {
    const mockStudent = { id: 'student1', fullName: 'John Doe', studentCode: '001' }

    const mockAssessments = [
      { id: '1', status: 'finalized', score: 85, assessment_date: '2026-01-10' },
      { id: '2', status: 'finalized', score: 90, assessment_date: '2026-01-20' },
      { id: '3', status: 'finalized', score: 75, assessment_date: '2026-01-15' },
    ]

    preschoolApi.fetchPreschoolStudent.mockResolvedValue(mockStudent)
    paginationHelper.fetchAllPages.mockResolvedValue({ items: mockAssessments })

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.generateIndividualReport()

    const dates = wrapper.vm.reportData.assessments.map(a => a.assessment_date)
    expect(dates[0]).toBe('2026-01-20')
    expect(dates[1]).toBe('2026-01-15')
    expect(dates[2]).toBe('2026-01-10')
  })

  it('resets filters when reset button is clicked', async () => {
    lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
      academicYears: [{ id: '1', label: '2025-2026' }],
    })

    preschoolApi.fetchPreschoolClasses.mockResolvedValue({
      items: [{ id: 'class1', name: 'Nursery A' }],
    })

    preschoolApi.fetchPreschoolStudents.mockResolvedValue({
      items: [{ id: 'student1', fullName: 'John Doe', studentCode: '001' }],
    })

    const wrapper = createWrapper()

    await wrapper.vm.$nextTick()

    wrapper.vm.scopeType = 'class'
    wrapper.vm.categoryId = 'math'
    wrapper.vm.assessmentStatus = 'draft'
    wrapper.vm.reportGenerated = true

    wrapper.vm.resetFilters()

    expect(wrapper.vm.scopeType).toBe('individual')
    expect(wrapper.vm.categoryId).toBe('')
    expect(wrapper.vm.assessmentStatus).toBe('')
    expect(wrapper.vm.reportGenerated).toBe(false)
  })

  it('handles API errors gracefully', async () => {
    const mockStudent = { id: 'student1', fullName: 'John Doe', studentCode: '001' }

    preschoolApi.fetchPreschoolStudent.mockResolvedValue(mockStudent)
    paginationHelper.fetchAllPages.mockRejectedValue(new Error('API Error'))

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'individual'

    await wrapper.vm.generateIndividualReport()

    expect(wrapper.vm.errorMessage).toBeTruthy()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('shows loading state while generating report', async () => {
    const mockStudent = { id: 'student1', fullName: 'John Doe', studentCode: '001' }

    preschoolApi.fetchPreschoolStudent.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockStudent), 100))
    )

    paginationHelper.fetchAllPages.mockResolvedValue({ items: [] })

    const wrapper = createWrapper()

    wrapper.vm.studentId = 'student1'
    wrapper.vm.classId = 'class1'
    wrapper.vm.scopeType = 'individual'

    const promise = wrapper.vm.generateIndividualReport()

    expect(wrapper.vm.loading).toBe(true)

    await promise
    expect(wrapper.vm.loading).toBe(false)
  })
})
