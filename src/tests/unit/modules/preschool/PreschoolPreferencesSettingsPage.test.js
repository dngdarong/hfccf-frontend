import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolPreferencesSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolPreferencesSettingsPage.vue'
import {
  fetchPreferences,
  updatePreferences,
} from '@/modules/preschool/services/api/preschoolPreferencesApi'

const toastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: toastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolPreferencesApi', () => ({
  fetchPreferences: vi.fn(),
  updatePreferences: vi.fn(),
  normalizePreferences: (value) => value,
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PreschoolSettingsSectionCard: {
      inheritAttrs: false,
      props: ['eyebrow', 'title', 'subtitle'],
      template: '<section v-bind="$attrs"><h2>{{ title }}</h2><slot /></section>',
    },
    Button: {
      inheritAttrs: false,
      props: ['label', 'loading', 'disabled'],
      emits: ['click'],
      template: '<button v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}<slot /></button>',
    },
    InputText: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    InputNumber: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? null : Number($event.target.value))" />',
    },
    Select: {
      props: ['modelValue', 'options', 'optionLabel', 'optionValue'],
      emits: ['update:modelValue'],
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
    },
    ToggleSwitch: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  fetchPreferences.mockResolvedValue({
    id: 1,
    timezone: 'Asia/Phnom_Penh',
    defaultLanguage: 'en',
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    minimumEnrollmentAgeMonths: 24,
    maximumEnrollmentAgeMonths: 60,
    autoApproveEnrollment: false,
    studentCodePrefix: 'PS',
    studentCodeYearFormat: 'YYYY',
    studentCodeSequenceLength: 4,
    defaultClassCapacity: 18,
    teacherStudentRatio: 10,
    waitlistEnabled: true,
    minimumGuardians: 1,
    maximumGuardians: 2,
    primaryGuardianRequired: true,
    pickupAuthorizationRequired: true,
    attendanceAlertEnabled: true,
    assessmentAlertEnabled: true,
    healthAlertEnabled: true,
    enrollmentNotificationEnabled: true,
  })

  updatePreferences.mockResolvedValue({
    id: 1,
    timezone: 'Asia/Phnom_Penh',
    defaultLanguage: 'kh',
    dateFormat: 'd/m/Y',
    timeFormat: 'H:i',
    minimumEnrollmentAgeMonths: 30,
    maximumEnrollmentAgeMonths: 72,
    autoApproveEnrollment: true,
    studentCodePrefix: 'PRE',
    studentCodeYearFormat: 'YY',
    studentCodeSequenceLength: 6,
    defaultClassCapacity: 20,
    teacherStudentRatio: 12,
    waitlistEnabled: false,
    minimumGuardians: 1,
    maximumGuardians: 3,
    primaryGuardianRequired: true,
    pickupAuthorizationRequired: true,
    attendanceAlertEnabled: true,
    assessmentAlertEnabled: false,
    healthAlertEnabled: true,
    enrollmentNotificationEnabled: false,
  })
})

describe('PreschoolPreferencesSettingsPage', () => {
  it('renders the preferences configuration page', async () => {
    const wrapper = mountWithPlugins(PreschoolPreferencesSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Preferences')
    expect(wrapper.text()).toContain('General Preferences')
    expect(wrapper.text()).toContain('Enrollment Rules')
    expect(wrapper.text()).toContain('Student Code Rules')
    expect(wrapper.text()).toContain('Class Rules')
    expect(wrapper.text()).toContain('Guardian Rules')
    expect(wrapper.text()).toContain('Communication Rules')
  })

  it('sends the preferences payload when saving', async () => {
    const wrapper = mountWithPlugins(PreschoolPreferencesSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const general = wrapper.get('[data-testid="preferences-general-section"]')
    const enrollment = wrapper.get('[data-testid="preferences-enrollment-section"]')
    const studentCode = wrapper.get('[data-testid="preferences-student-code-section"]')
    const classRules = wrapper.get('[data-testid="preferences-class-section"]')
    const guardianRules = wrapper.get('[data-testid="preferences-guardian-section"]')
    const communications = wrapper.get('[data-testid="preferences-communications-section"]')

    await general.findAll('input[type="text"]')[0].setValue('Asia/Phnom_Penh')
    await general.findAll('select')[0].setValue('kh')
    await general.findAll('input[type="text"]')[1].setValue('d/m/Y')
    await general.findAll('input[type="text"]')[2].setValue('H:i')

    await enrollment.findAll('input[type="number"]')[0].setValue('30')
    await enrollment.findAll('input[type="number"]')[1].setValue('72')
    await enrollment.find('input[type="checkbox"]').setValue(true)

    await studentCode.findAll('input[type="text"]')[0].setValue('PRE')
    await studentCode.findAll('input[type="text"]')[1].setValue('YY')
    await studentCode.findAll('input[type="number"]')[0].setValue('6')

    await classRules.findAll('input[type="number"]')[0].setValue('20')
    await classRules.findAll('input[type="number"]')[1].setValue('12')
    await classRules.find('input[type="checkbox"]').setValue(false)

    await guardianRules.findAll('input[type="number"]')[0].setValue('1')
    await guardianRules.findAll('input[type="number"]')[1].setValue('3')
    const guardianCheckboxes = guardianRules.findAll('input[type="checkbox"]')
    await guardianCheckboxes[0].setValue(true)
    await guardianCheckboxes[1].setValue(true)

    const commCheckboxes = communications.findAll('input[type="checkbox"]')
    await commCheckboxes[0].setValue(true)
    await commCheckboxes[1].setValue(false)
    await commCheckboxes[2].setValue(true)
    await commCheckboxes[3].setValue(false)

    await wrapper.get('[data-testid="save-preferences-settings"]').trigger('click')

    expect(updatePreferences).toHaveBeenCalledWith(expect.objectContaining({
      defaultLanguage: 'kh',
      dateFormat: 'd/m/Y',
      timeFormat: 'H:i',
      minimumEnrollmentAgeMonths: 30,
      maximumEnrollmentAgeMonths: 72,
      autoApproveEnrollment: true,
      studentCodePrefix: 'PRE',
      studentCodeYearFormat: 'YY',
      studentCodeSequenceLength: 6,
      defaultClassCapacity: 20,
      teacherStudentRatio: 12,
      waitlistEnabled: false,
      minimumGuardians: 1,
      maximumGuardians: 3,
      primaryGuardianRequired: true,
      pickupAuthorizationRequired: true,
      attendanceAlertEnabled: true,
      assessmentAlertEnabled: false,
      healthAlertEnabled: true,
      enrollmentNotificationEnabled: false,
    }))
  })

  it('shows a student code preview', async () => {
    const wrapper = mountWithPlugins(PreschoolPreferencesSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.get('[data-testid="student-code-preview"]').text()).toContain('PS-')
  })
})
