import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolSettings from '@/modules/preschool/admin/pages/settings/PreschoolSettings.vue'

const mockFetchClassLevels = vi.fn()
const mockCreateClassLevel = vi.fn()
const mockUpdateClassLevel = vi.fn()
const mockDeactivateClassLevel = vi.fn()
const mockRestoreClassLevel = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClassLevels: (...args) => mockFetchClassLevels(...args),
  createPreschoolClassLevel: (...args) => mockCreateClassLevel(...args),
  updatePreschoolClassLevel: (...args) => mockUpdateClassLevel(...args),
  deactivatePreschoolClassLevel: (...args) => mockDeactivateClassLevel(...args),
  restorePreschoolClassLevel: (...args) => mockRestoreClassLevel(...args),
}))

vi.mock('@/modules/preschool/composables/usePreschoolSettings', () => ({
  createEmptyAcademicYearDraft: () => ({ code: '', label: '', startDate: null, endDate: null, status: 'active', isCurrent: true, notes: '' }),
  createDefaultClassConfiguration: () => ({ id: 'class-1', classLevel: 'NUR', capacity: 18, assignedTeacher: '', room: '', status: 'active' }),
  createEmptyTermDraft: () => ({ code: '', name: '', academicYearId: 1, startDate: null, endDate: null, status: 'active', isCurrent: true, sortOrder: 0, notes: '' }),
  validatePreschoolAcademicYearDraft: () => ({ errors: {}, isValid: true }),
  validatePreschoolTermDraft: () => ({ errors: {}, isValid: true }),
  usePreschoolSettings: () => ({
    settings: ref({
      academicYear: { currentAcademicYear: '2026 - 2027' },
      terms: [],
      classConfigurations: [],
      attendance: {},
      assessment: {},
      schedule: {},
      payment: {},
      enrollment: {},
    }),
    validationErrors: ref({
      academicYear: {},
      terms: {},
      classConfigurations: {},
      attendance: {},
      assessment: {},
      schedule: {},
      payment: {},
      enrollment: {},
    }),
    lastSavedAt: ref(null),
    issueCount: ref(0),
    hasValidationIssues: ref(false),
    loading: ref(false),
    saving: ref(false),
    reportPeriods: ref([]),
    loadSettings: vi.fn().mockResolvedValue({}),
    loadReportPeriods: vi.fn().mockResolvedValue({}),
    saveSettings: vi.fn().mockResolvedValue({}),
    resetSettings: vi.fn(),
    addClassConfiguration: vi.fn(),
    updateClassConfiguration: vi.fn(),
    removeClassConfiguration: vi.fn(),
  }),
}))

vi.mock('@/modules/preschool/composables/usePreschoolAcademicLifecycle', () => ({
  usePreschoolAcademicLifecycle: () => ({
    academicYears: ref([{ id: 1, label: '2026 - 2027', isCurrent: true }]),
    terms: ref([]),
    currentContext: ref(null),
    loadAcademicLifecycle: vi.fn().mockResolvedValue({}),
    createYear: vi.fn(),
    updateYear: vi.fn(),
    activateYear: vi.fn(),
    closeYear: vi.fn(),
    createTerm: vi.fn(),
    updateTerm: vi.fn(),
    activateTerm: vi.fn(),
    closeTerm: vi.fn(),
  }),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: { props: ['label', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot />{{ label }}</button>' },
    Dialog: { props: ['visible'], template: '<div v-if="visible"><slot name="header" /><slot /><slot name="footer" /></div>' },
    InputText: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    InputNumber: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? null : Number($event.target.value))" />' },
    ToggleSwitch: { props: ['modelValue'], emits: ['update:modelValue'], template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
    Select: { props: ['modelValue', 'options'], emits: ['update:modelValue'], template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>' },
    Textarea: { props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    PreschoolSettingsSectionCard: { props: ['eyebrow', 'title', 'subtitle'], template: '<section><h2>{{ title }}</h2><slot /></section>' },
    PreschoolAcademicYearDialog: { template: '<div />' },
    PreschoolAcademicYearManager: { template: '<div />' },
    PreschoolAttendanceConfiguration: { template: '<div />' },
    PreschoolAssessmentConfiguration: { template: '<div />' },
    PreschoolClassConfiguration: { template: '<div />' },
    PreschoolEnrollmentConfiguration: { template: '<div />' },
    PreschoolPaymentConfiguration: { template: '<div />' },
    PreschoolScheduleConfiguration: { template: '<div />' },
    PreschoolTermDialog: { template: '<div />' },
    PreschoolTermManager: { template: '<div />' },
    AppButton: { props: ['variant', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>' },
    AppBadge: { props: ['label'], template: '<span>{{ label }}</span>' },
    AppStatusChip: { props: ['label'], template: '<span>{{ label }}</span>' },
    PreschoolClassLevelsManager: {
      props: ['items', 'loading', 'saving'],
      emits: ['open-add', 'open-edit', 'deactivate', 'restore'],
      template: `
        <section>
          <h2>Class Levels</h2>
          <button @click="$emit('open-add')">Add Level</button>
          <div v-for="(item, index) in items" :key="item.id" :data-testid="'class-level-row-' + item.id">
            <span>{{ item.nameEn }}</span>
            <button @click="$emit('open-edit', index)">Edit</button>
            <button v-if="item.isActive === false" @click="$emit('restore', index)">Restore</button>
            <button v-else @click="$emit('deactivate', index)">Deactivate</button>
          </div>
          <slot />
        </section>
      `,
    },
    PreschoolClassLevelDialog: {
      props: ['visible', 'title', 'draft', 'errors'],
      emits: ['cancel', 'save', 'update:draft'],
      template: `
        <div v-if="visible" data-testid="class-level-dialog">
          <h3>{{ title }}</h3>
          <input type="text" :value="draft.nameEn" @input="$emit('update:draft', { ...draft, nameEn: $event.target.value })" />
          <input type="text" :value="draft.nameKh" @input="$emit('update:draft', { ...draft, nameKh: $event.target.value })" />
          <input type="text" :value="draft.code" @input="$emit('update:draft', { ...draft, code: $event.target.value })" />
          <input type="number" :value="draft.sortOrder" @input="$emit('update:draft', { ...draft, sortOrder: Number($event.target.value) })" />
          <input type="checkbox" :checked="draft.isActive" @change="$emit('update:draft', { ...draft, isActive: $event.target.checked })" />
          <button @click="$emit('cancel')">Cancel</button>
          <button @click="$emit('save')">Save Level</button>
        </div>
      `,
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  mockFetchClassLevels.mockResolvedValue({
    items: [
      { id: 1, nameEn: 'Nursery', nameKh: 'មត្តេយ្យកម្រិតតូច', code: 'NUR', sortOrder: 1, isActive: true },
      { id: 2, nameEn: 'Prep', nameKh: 'ត្រៀមចូលរៀន', code: 'PRE', sortOrder: 2, isActive: false },
    ],
  })
  mockCreateClassLevel.mockResolvedValue({
    id: 3,
    nameEn: 'Kindergarten A',
    nameKh: 'មត្តេយ្យ A',
    code: 'KGA',
    sortOrder: 3,
    isActive: true,
  })
  mockUpdateClassLevel.mockResolvedValue({
    id: 1,
    nameEn: 'Nursery Updated',
    nameKh: 'មត្តេយ្យកម្រិតតូច',
    code: 'NUR',
    sortOrder: 1,
    isActive: true,
  })
  mockDeactivateClassLevel.mockResolvedValue(true)
  mockRestoreClassLevel.mockResolvedValue(true)
})

describe('PreschoolSettings', () => {
  it('renders class levels and saves a new level through the settings dialog', async () => {
    const wrapper = mountWithPlugins(PreschoolSettings, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(mockFetchClassLevels).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Class Levels')
    expect(wrapper.text()).toContain('Nursery')
    expect(wrapper.text()).toContain('Prep')
    expect(wrapper.text()).toContain('Deactivate')

    await wrapper.findAll('button').find((button) => button.text().includes('Add Level')).trigger('click')
    const dialog = wrapper.find('[data-testid="class-level-dialog"]')
    const inputs = dialog.findAll('input[type="text"]')
    await inputs[0].setValue('Kindergarten A')
    await inputs[1].setValue('មត្តេយ្យ A')
    await inputs[2].setValue('kga')
    await dialog.find('input[type="number"]').setValue('3')
    await dialog.findAll('button').find((button) => button.text().includes('Save Level')).trigger('click')

    expect(mockCreateClassLevel).toHaveBeenCalledWith(expect.objectContaining({
      name_en: 'Kindergarten A',
      name_kh: 'មត្តេយ្យ A',
      code: 'KGA',
      sort_order: 3,
      is_active: true,
    }))
  })

  it('can deactivate and restore existing levels', async () => {
    const wrapper = mountWithPlugins(PreschoolSettings, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text().includes('Deactivate')).trigger('click')
    expect(mockDeactivateClassLevel).toHaveBeenCalledWith(1)

    await wrapper.vm.$nextTick()
    await wrapper.findAll('button').find((button) => button.text().includes('Restore')).trigger('click')
    expect(mockRestoreClassLevel).toHaveBeenCalledWith(2)
  })
})
