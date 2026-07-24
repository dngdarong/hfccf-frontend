import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolAssessmentSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolAssessmentSettingsPage.vue'
import {
  archiveAssessmentCategory,
  archiveReportPeriod,
  createAssessmentCategory,
  createGradeBand,
  createReportPeriod,
  deleteGradeBand,
  fetchAssessmentCategories,
  fetchAssessmentSettings,
  fetchAssessmentWeights,
  fetchGradingScale,
  fetchReportPeriods,
  updateAssessmentCategory,
  updateAssessmentSettings,
  updateAssessmentWeights,
  updateGradeBand,
  updateReportPeriod,
} from '@/modules/preschool/services/api/preschoolAssessmentConfigurationApi'

const toastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: toastAdd,
  }),
}))

vi.mock('@/modules/preschool/composables/usePreschoolAcademicLifecycle', () => ({
  usePreschoolAcademicLifecycle: () => ({
    academicYears: ref([
      { id: 1, name: '2026 - 2027', label: '2026 - 2027' },
    ]),
    terms: ref([
      { id: 11, academicYearId: 1, name: 'Term 1' },
    ]),
    loadAcademicLifecycle: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolAssessmentConfigurationApi', () => ({
  fetchAssessmentSettings: vi.fn(),
  updateAssessmentSettings: vi.fn(),
  fetchGradingScale: vi.fn(),
  createGradeBand: vi.fn(),
  updateGradeBand: vi.fn(),
  deleteGradeBand: vi.fn(),
  fetchAssessmentCategories: vi.fn(),
  createAssessmentCategory: vi.fn(),
  updateAssessmentCategory: vi.fn(),
  archiveAssessmentCategory: vi.fn(),
  fetchReportPeriods: vi.fn(),
  createReportPeriod: vi.fn(),
  updateReportPeriod: vi.fn(),
  archiveReportPeriod: vi.fn(),
  fetchAssessmentWeights: vi.fn(),
  updateAssessmentWeights: vi.fn(),
  normalizeAssessmentSettings: value => value,
  normalizeGradeBand: value => value,
  normalizeAssessmentCategory: value => value,
  normalizeReportPeriod: value => value,
  normalizeAssessmentWeight: value => value,
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PreschoolSettingsSectionCard: { props: ['eyebrow', 'title', 'subtitle'], template: '<section><h2>{{ title }}</h2><slot /></section>' },
    Button: { props: ['label', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}<slot /></button>' },
    Dialog: { props: ['visible'], template: '<div v-if="visible"><slot name="header" /><slot /><slot name="footer" /></div>' },
    InputText: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    InputNumber: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? null : Number($event.target.value))" />' },
    Select: { props: ['modelValue', 'options'], emits: ['update:modelValue'], template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>' },
    Textarea: { props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    ToggleSwitch: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  window.confirm = vi.fn(() => true)

  fetchAssessmentSettings.mockResolvedValue({
    id: 1,
    passingScore: 60,
    weightingEnabled: true,
  })
  fetchGradingScale.mockResolvedValue([
    { id: 2, grade: 'A', minimumScore: 90, maximumScore: 100, isPassing: true, color: '#10b981' },
  ])
  fetchAssessmentCategories.mockResolvedValue([
    { id: 3, name: 'Quiz', code: 'QZ', description: 'Short quiz', sortOrder: 1, isActive: true },
  ])
  fetchReportPeriods.mockResolvedValue([
    { id: 4, periodType: 'term', academicYearId: 1, termId: 11, name: 'Term 1', startDate: '2026-07-01', endDate: '2026-09-30', isActive: true },
  ])
  fetchAssessmentWeights.mockResolvedValue([
    { id: 5, categoryId: 3, percentage: 100 },
  ])
  updateAssessmentSettings.mockResolvedValue({
    id: 1,
    passingScore: 70,
    weightingEnabled: false,
  })
  createGradeBand.mockResolvedValue({ id: 6, grade: 'B', minimumScore: 80, maximumScore: 89, isPassing: false })
  updateGradeBand.mockResolvedValue({ id: 6, grade: 'B', minimumScore: 82, maximumScore: 89, isPassing: false })
  deleteGradeBand.mockResolvedValue(true)
  createAssessmentCategory.mockResolvedValue({ id: 7, name: 'Assignment', code: 'ASG', isActive: true, sortOrder: 2 })
  updateAssessmentCategory.mockResolvedValue({ id: 7, name: 'Assignment', code: 'ASG2', isActive: true, sortOrder: 2 })
  archiveAssessmentCategory.mockResolvedValue({ id: 7, name: 'Assignment', code: 'ASG2', isActive: false, status: 'archived', sortOrder: 2 })
  createReportPeriod.mockResolvedValue({ id: 8, periodType: 'monthly', name: 'Midterm', academicYearId: 1, termId: 11, isActive: true })
  updateReportPeriod.mockResolvedValue({ id: 8, periodType: 'monthly', name: 'Midterm Updated', academicYearId: 1, termId: 11, isActive: true })
  archiveReportPeriod.mockResolvedValue({ id: 8, periodType: 'monthly', name: 'Midterm Updated', academicYearId: 1, termId: 11, isActive: false, status: 'archived' })
  updateAssessmentWeights.mockResolvedValue([
    { id: 5, categoryId: 3, percentage: 100 },
  ])
})

describe('PreschoolAssessmentSettingsPage', () => {
  it('renders the assessment configuration page', async () => {
    const wrapper = mountWithPlugins(PreschoolAssessmentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Assessment Configuration')
    expect(wrapper.text()).toContain('Passing Score')
    expect(wrapper.text()).toContain('Grading Scale')
    expect(wrapper.text()).toContain('Assessment Categories')
    expect(wrapper.text()).toContain('Report Periods')
    expect(wrapper.text()).toContain('Assessment Weights')
    expect(wrapper.text()).toContain('Period Type')
    expect(wrapper.findAll('input[type="number"]')[0].element.value).toBe('60')
    expect(wrapper.text()).toContain('Quiz')
  })

  it('sends the assessment settings payload when saving', async () => {
    const wrapper = mountWithPlugins(PreschoolAssessmentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const inputs = wrapper.findAll('input[type="number"]')
    await inputs[0].setValue('70')

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Settings'))
    await saveButton.trigger('click')

    expect(updateAssessmentSettings).toHaveBeenCalledWith(expect.objectContaining({
      passingScore: 70,
      weightingEnabled: true,
    }))
  })

  it('creates grade bands, archives categories, creates report periods, and validates weights', async () => {
    const wrapper = mountWithPlugins(PreschoolAssessmentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text().includes('Add Grade Band')).trigger('click')
    const gradeDialogInputs = wrapper.findAll('input[type="text"]')
    await gradeDialogInputs[0].setValue('B')
    const gradeNumberInputs = wrapper.findAll('input[type="number"]')
    await gradeNumberInputs[2].setValue('80')
    await gradeNumberInputs[3].setValue('89')
    await wrapper.findAll('button').find((button) => button.text().trim() === 'Save').trigger('click')
    expect(createGradeBand).toHaveBeenCalledWith(expect.objectContaining({
      grade: 'B',
      minimumScore: 80,
      maximumScore: 89,
    }))

    await wrapper.findAll('button').find((button) => button.text().includes('Archive')).trigger('click')
    expect(archiveAssessmentCategory).toHaveBeenCalledWith(3)

    await wrapper.findAll('button').find((button) => button.text().includes('Create Report Period')).trigger('click')
    const reportInputs = wrapper.findAll('input[type="text"]')
    await reportInputs[0].setValue('Midterm')
    const periodTypeSelect = wrapper.findAll('select').find((select) =>
      Array.from(select.element.options).some((option) => option.value === 'monthly'))
    await periodTypeSelect.setValue('monthly')
    const reportDates = wrapper.findAll('input[type="date"]')
    await reportDates[0].setValue('2026-10-01')
    await reportDates[1].setValue('2026-12-31')
    await wrapper.findAll('button').find((button) => button.text().trim() === 'Save').trigger('click')
    expect(createReportPeriod).toHaveBeenCalledWith(expect.objectContaining({
      periodType: 'monthly',
      name: 'Midterm',
      academicYearId: '1',
      termId: '',
    }))

    const weightInputs = wrapper.findAll('input[type="number"]')
    await weightInputs[1].setValue('50')
    await wrapper.findAll('button').find((button) => button.text().includes('Save Weights')).trigger('click')
    expect(updateAssessmentWeights).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('The total weight must equal 100% before saving.')
  })
})
