import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import StudentSummaryReport from '@/modules/preschool/admin/pages/reports/StudentSummaryReport.vue'
import * as preschoolApi from '@/modules/preschool/services/preschoolApi'
import * as assessmentApi from '@/modules/preschool/services/api/preschoolAssessmentApi'
import * as lifecycleApi from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
  fetchPreschoolStudent: vi.fn(),
  fetchPreschoolAttendance: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAssessmentApi', () => ({
  fetchStudentAssessments: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolAcademicLifecycleApi', () => ({
  fetchAcademicLifecycle: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1></header>' },
    Button: { emits: ['click'], template: '<button @click="$emit(\'click\')"><slot /></button>' },
    Select: { props: ['modelValue', 'options'], emits: ['update:modelValue'], template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>' },
    StudentIdentityCard: { template: '<div data-testid="identity-card"></div>' },
    StudentAttendanceSummary: { template: '<div data-testid="attendance-summary"></div>' },
    StudentAssessmentSummary: { template: '<div data-testid="assessment-summary"></div>' },
    ClassSummaryTable: { template: '<div data-testid="class-table"></div>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  lifecycleApi.fetchAcademicLifecycle.mockResolvedValue({
    academicYears: [
      { id: 1, code: 'AY2026', label: 'Academic Year 2026' },
    ],
  })

  preschoolApi.fetchPreschoolClasses.mockResolvedValue({
    items: [
      { id: 1, name: 'Preschool-A' },
      { id: 2, name: 'Preschool-B' },
    ],
  })

  preschoolApi.fetchPreschoolStudents.mockResolvedValue({
    items: [
      { id: 1, fullName: 'Sokha', studentCode: 'P001', publicId: 'P001' },
      { id: 2, fullName: 'Sophea', studentCode: 'P002', publicId: 'P002' },
    ],
  })

  preschoolApi.fetchPreschoolStudent.mockResolvedValue({
    id: 1,
    fullName: 'Sokha',
    studentCode: 'P001',
    gender: 'Male',
    dateOfBirth: '2020-01-15',
    status: 'active',
    classes: [{ id: 1, name: 'Preschool-A' }],
  })

  preschoolApi.fetchPreschoolAttendance.mockResolvedValue({
    items: [
      { status: 'present' },
      { status: 'present' },
      { status: 'absent' },
      { status: 'late' },
    ],
    total: 4,
  })

  assessmentApi.fetchStudentAssessments.mockResolvedValue({
    items: [
      { id: 1, category: { name: 'Social' }, score: 85, status: 'finalized' },
      { id: 2, category: { name: 'Physical' }, score: 92, status: 'finalized' },
    ],
  })
})

describe('StudentSummaryReport', () => {
  it('renders the report generator with filters', async () => {
    const wrapper = mountWithPlugins(StudentSummaryReport, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Student Summary')
    expect(wrapper.text()).toContain('Filters')
    expect(wrapper.text()).toContain('Generate Report')
  })

  it('loads filter options on mount', async () => {
    mountWithPlugins(StudentSummaryReport, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(lifecycleApi.fetchAcademicLifecycle).toHaveBeenCalled()
    expect(preschoolApi.fetchPreschoolClasses).toHaveBeenCalled()
  })

  it('generates individual student report on button click', async () => {
    const wrapper = mountWithPlugins(StudentSummaryReport, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const buttons = wrapper.findAll('button')
    const generateButton = buttons.find(b => b.text().includes('Generate'))
    await generateButton.trigger('click')

    await flushPromises()

    expect(preschoolApi.fetchPreschoolStudent).toHaveBeenCalled()
    expect(preschoolApi.fetchPreschoolAttendance).toHaveBeenCalled()
    expect(assessmentApi.fetchStudentAssessments).toHaveBeenCalled()
  })

  it('shows empty state when no report generated', async () => {
    const wrapper = mountWithPlugins(StudentSummaryReport, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Select a report type and filters')
  })

  it('hides student filter when scope is class', async () => {
    const wrapper = mountWithPlugins(StudentSummaryReport, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const radioButtons = wrapper.findAll('input[type="radio"]')
    const classRadio = radioButtons.find(r => r.element.value === 'class')

    if (classRadio) {
      classRadio.element.checked = true
      await classRadio.trigger('change')
    }

    await flushPromises()
    // Student field should be hidden (v-show="scopeType === 'individual'")
    expect(wrapper.vm.scopeType).toBe('class')
  })
})
