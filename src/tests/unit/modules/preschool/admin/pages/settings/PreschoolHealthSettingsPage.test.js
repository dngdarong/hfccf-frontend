import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolHealthSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolHealthSettingsPage.vue'
import {
  archiveHealthCheckCategory,
  archiveIncidentCategory,
  archiveSeverityLevel,
  archiveVaccinationCategory,
  createHealthCheckCategory,
  createIncidentCategory,
  createSeverityLevel,
  createVaccinationCategory,
  fetchHealthCheckCategories,
  fetchHealthSettings,
  fetchIncidentCategories,
  fetchSeverityLevels,
  fetchVaccinationCategories,
  updateHealthCheckCategory,
  updateHealthSettings,
  updateIncidentCategory,
  updateSeverityLevel,
  updateVaccinationCategory,
} from '@/modules/preschool/services/api/preschoolHealthConfigurationApi'

const toastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: toastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolHealthConfigurationApi', () => ({
  fetchHealthSettings: vi.fn(),
  updateHealthSettings: vi.fn(),
  fetchSeverityLevels: vi.fn(),
  createSeverityLevel: vi.fn(),
  updateSeverityLevel: vi.fn(),
  archiveSeverityLevel: vi.fn(),
  fetchIncidentCategories: vi.fn(),
  createIncidentCategory: vi.fn(),
  updateIncidentCategory: vi.fn(),
  archiveIncidentCategory: vi.fn(),
  fetchVaccinationCategories: vi.fn(),
  createVaccinationCategory: vi.fn(),
  updateVaccinationCategory: vi.fn(),
  archiveVaccinationCategory: vi.fn(),
  fetchHealthCheckCategories: vi.fn(),
  createHealthCheckCategory: vi.fn(),
  updateHealthCheckCategory: vi.fn(),
  archiveHealthCheckCategory: vi.fn(),
  normalizeHealthSettings: (value) => value,
  normalizeSeverityLevel: (value) => value,
  normalizeIncidentCategory: (value) => value,
  normalizeVaccinationCategory: (value) => value,
  normalizeHealthCheckCategory: (value) => value,
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PreschoolSettingsSectionCard: { props: ['eyebrow', 'title', 'subtitle'], template: '<section><h2>{{ title }}</h2><slot /></section>' },
    Button: { props: ['label', 'loading', 'disabled'], emits: ['click'], template: '<button :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}<slot /></button>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  window.confirm = vi.fn(() => true)

  fetchHealthSettings.mockResolvedValue({
    criticalAlertEnabled: true,
    guardianNotificationEnabled: true,
    teacherNotificationEnabled: true,
    adminNotificationEnabled: true,
    medicationReminderEnabled: true,
    vaccinationReminderEnabled: false,
    overdueVaccinationAlertDays: 21,
    medicationReminderMinutesBefore: 45,
  })
  fetchSeverityLevels.mockResolvedValue([
    { id: 1, name: 'Critical', code: 'critical', priority: 1, color: '#ef4444', requiresAcknowledgment: true, triggersNotification: true, isActive: true },
  ])
  fetchIncidentCategories.mockResolvedValue([
    { id: 2, name: 'Fever', code: 'fever', defaultSeverityCode: 'high', isActive: true },
  ])
  fetchVaccinationCategories.mockResolvedValue([
    { id: 3, name: 'MMR', code: 'mmr', recommendedAgeMonths: 12, isRequired: true, isActive: true },
  ])
  fetchHealthCheckCategories.mockResolvedValue([
    { id: 4, name: 'Temperature', code: 'temperature', isActive: true },
  ])

  updateHealthSettings.mockResolvedValue({
    criticalAlertEnabled: false,
    guardianNotificationEnabled: true,
    teacherNotificationEnabled: true,
    adminNotificationEnabled: true,
    medicationReminderEnabled: true,
    vaccinationReminderEnabled: true,
    overdueVaccinationAlertDays: 30,
    medicationReminderMinutesBefore: 60,
  })
  createSeverityLevel.mockResolvedValue({ id: 5, name: 'High', code: 'high', priority: 2, isActive: true })
  updateSeverityLevel.mockResolvedValue({ id: 5, name: 'High Updated', code: 'high', priority: 3, isActive: true })
  archiveSeverityLevel.mockResolvedValue({ id: 5, name: 'High Updated', code: 'high', priority: 3, isActive: false, status: 'archived' })
  createIncidentCategory.mockResolvedValue({ id: 6, name: 'Injury', code: 'injury', isActive: true })
  updateIncidentCategory.mockResolvedValue({ id: 6, name: 'Injury Updated', code: 'injury', isActive: true })
  archiveIncidentCategory.mockResolvedValue({ id: 6, name: 'Injury Updated', code: 'injury', isActive: false, status: 'archived' })
  createVaccinationCategory.mockResolvedValue({ id: 7, name: 'Polio', code: 'polio', isActive: true })
  updateVaccinationCategory.mockResolvedValue({ id: 7, name: 'Polio Updated', code: 'polio', isActive: true })
  archiveVaccinationCategory.mockResolvedValue({ id: 7, name: 'Polio Updated', code: 'polio', isActive: false, status: 'archived' })
  createHealthCheckCategory.mockResolvedValue({ id: 8, name: 'Vision', code: 'vision', isActive: true })
  updateHealthCheckCategory.mockResolvedValue({ id: 8, name: 'Vision Updated', code: 'vision', isActive: true })
  archiveHealthCheckCategory.mockResolvedValue({ id: 8, name: 'Vision Updated', code: 'vision', isActive: false, status: 'archived' })
})

describe('PreschoolHealthSettingsPage', () => {
  it('renders the health configuration page and loads live data', async () => {
    const wrapper = mountWithPlugins(PreschoolHealthSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Health Configuration')
    expect(wrapper.text()).toContain('Health Settings')
    expect(wrapper.text()).toContain('Severity Levels')
    expect(wrapper.text()).toContain('Incident Categories')
    expect(wrapper.text()).toContain('Vaccination Categories')
    expect(wrapper.text()).toContain('Health Check Categories')
    expect(wrapper.text()).toContain('Critical')
    expect(wrapper.text()).toContain('Fever')
  })

  it('sends the health settings payload when saving', async () => {
    const wrapper = mountWithPlugins(PreschoolHealthSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const numberInputs = wrapper.findAll('input[type="number"]')
    await numberInputs[0].setValue('30')
    await numberInputs[1].setValue('60')

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Settings'))
    await saveButton.trigger('click')

    expect(updateHealthSettings).toHaveBeenCalledWith(expect.objectContaining({
      overdueVaccinationAlertDays: 30,
      medicationReminderMinutesBefore: 60,
    }))
  })

  it('creates, updates, and archives health configuration records', async () => {
    const wrapper = mountWithPlugins(PreschoolHealthSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text().includes('Create Severity Level')).trigger('click')
    const severityForm = wrapper.find('[data-testid="health-severity-form"]')
    const severityTextInputs = severityForm.findAll('input[type="text"]')
    const severityNumberInputs = severityForm.findAll('input[type="number"]')
    const severityCheckboxes = severityForm.findAll('input[type="checkbox"]')
    await severityTextInputs[0].setValue('High')
    await severityTextInputs[1].setValue('high')
    await severityTextInputs[2].setValue('#f59e0b')
    await severityNumberInputs[0].setValue('0')
    await severityNumberInputs[1].setValue('0')
    await severityCheckboxes[0].setValue(true)
    await severityCheckboxes[1].setValue(true)
    await severityCheckboxes[2].setValue(true)
    await severityForm.findAll('button').find((button) => button.text().includes('Save')).trigger('click')
    expect(createSeverityLevel).toHaveBeenCalledWith(expect.objectContaining({
      name: 'High',
      code: 'high',
      priority: 0,
    }))
    await flushPromises()
    const severityRow = wrapper.find('[data-testid="health-severity-row-5"]')
    const severityButtons = severityRow.findAll('button')
    await severityButtons[0].trigger('click')
    const updatedSeverityForm = wrapper.find('[data-testid="health-severity-form"]')
    const updatedSeverityTextInputs = updatedSeverityForm.findAll('input[type="text"]')
    const updatedSeverityNumberInputs = updatedSeverityForm.findAll('input[type="number"]')
    await updatedSeverityTextInputs[0].setValue('High Updated')
    await updatedSeverityNumberInputs[0].setValue('3')
    await updatedSeverityForm.findAll('button').find((button) => button.text().includes('Update')).trigger('click')
    expect(updateSeverityLevel).toHaveBeenCalledWith(5, expect.objectContaining({
      name: 'High Updated',
      priority: 3,
    }))
    await flushPromises()

    await severityButtons[1].trigger('click')
    expect(archiveSeverityLevel).toHaveBeenCalledWith(5)

    await wrapper.findAll('button').find((button) => button.text().includes('Create Incident Category')).trigger('click')
    const incidentForm = wrapper.find('[data-testid="health-incident-form"]')
    const incidentTextInputs = incidentForm.findAll('input[type="text"]')
    const incidentNumberInputs = incidentForm.findAll('input[type="number"]')
    const incidentSelects = incidentForm.findAll('select')
    const incidentCheckboxes = incidentForm.findAll('input[type="checkbox"]')
    await incidentTextInputs[0].setValue('A-Injury')
    await incidentTextInputs[1].setValue('injury')
    await incidentSelects[0].setValue('critical')
    await incidentNumberInputs[0].setValue('1')
    await incidentCheckboxes[0].setValue(true)
    await incidentForm.findAll('button').find((button) => button.text().includes('Save')).trigger('click')
    expect(createIncidentCategory).toHaveBeenCalledWith(expect.objectContaining({
      name: 'A-Injury',
      code: 'injury',
      defaultSeverityCode: 'critical',
    }))
    await flushPromises()

    const incidentRow = wrapper.find('[data-testid="health-incident-row-6"]')
    const incidentButtons = incidentRow.findAll('button')
    await incidentButtons[0].trigger('click')
    const updatedIncidentForm = wrapper.find('[data-testid="health-incident-form"]')
    const updatedIncidentTextInputs = updatedIncidentForm.findAll('input[type="text"]')
    await updatedIncidentTextInputs[0].setValue('Injury Updated')
    await updatedIncidentForm.findAll('button').find((button) => button.text().includes('Update')).trigger('click')
    expect(updateIncidentCategory).toHaveBeenCalledWith(6, expect.objectContaining({
      name: 'Injury Updated',
    }))
    await flushPromises()
    await incidentButtons[1].trigger('click')
    expect(archiveIncidentCategory).toHaveBeenCalledWith(6)

    await wrapper.findAll('button').find((button) => button.text().includes('Create Vaccination Category')).trigger('click')
    const vaccinationForm = wrapper.find('[data-testid="health-vaccination-form"]')
    const vaccinationTextInputs = vaccinationForm.findAll('input[type="text"]')
    const vaccinationNumberInputs = vaccinationForm.findAll('input[type="number"]')
    const vaccinationCheckboxes = vaccinationForm.findAll('input[type="checkbox"]')
    await vaccinationTextInputs[0].setValue('A-Polio')
    await vaccinationTextInputs[1].setValue('polio')
    await vaccinationNumberInputs[0].setValue('12')
    await vaccinationNumberInputs[1].setValue('1')
    await vaccinationCheckboxes[0].setValue(true)
    await vaccinationCheckboxes[1].setValue(true)
    await vaccinationForm.findAll('button').find((button) => button.text().includes('Save')).trigger('click')
    expect(createVaccinationCategory).toHaveBeenCalledWith(expect.objectContaining({
      name: 'A-Polio',
      code: 'polio',
      recommendedAgeMonths: 12,
    }))
    await flushPromises()

    const vaccinationRow = wrapper.find('[data-testid="health-vaccination-row-7"]')
    const vaccinationButtons = vaccinationRow.findAll('button')
    await vaccinationButtons[0].trigger('click')
    const updatedVaccinationForm = wrapper.find('[data-testid="health-vaccination-form"]')
    const updatedVaccinationTextInputs = updatedVaccinationForm.findAll('input[type="text"]')
    await updatedVaccinationTextInputs[0].setValue('Polio Updated')
    await updatedVaccinationForm.findAll('button').find((button) => button.text().includes('Update')).trigger('click')
    expect(updateVaccinationCategory).toHaveBeenCalledWith(7, expect.objectContaining({
      name: 'Polio Updated',
    }))
    await flushPromises()
    await vaccinationButtons[1].trigger('click')
    expect(archiveVaccinationCategory).toHaveBeenCalledWith(7)

    await wrapper.findAll('button').find((button) => button.text().includes('Create Health Check Category')).trigger('click')
    const checkForm = wrapper.find('[data-testid="health-check-form"]')
    const checkTextInputs = checkForm.findAll('input[type="text"]')
    const checkNumberInputs = checkForm.findAll('input[type="number"]')
    const checkCheckboxes = checkForm.findAll('input[type="checkbox"]')
    await checkTextInputs[0].setValue('A-Vision')
    await checkTextInputs[1].setValue('vision')
    await checkNumberInputs[0].setValue('1')
    await checkCheckboxes[0].setValue(true)
    await checkForm.findAll('button').find((button) => button.text().includes('Save')).trigger('click')
    expect(createHealthCheckCategory).toHaveBeenCalledWith(expect.objectContaining({
      name: 'A-Vision',
      code: 'vision',
    }))
    await flushPromises()

    const checkRow = wrapper.find('[data-testid="health-health-check-row-8"]')
    const checkButtons = checkRow.findAll('button')
    await checkButtons[0].trigger('click')
    const updatedCheckForm = wrapper.find('[data-testid="health-check-form"]')
    const updatedCheckTextInputs = updatedCheckForm.findAll('input[type="text"]')
    await updatedCheckTextInputs[0].setValue('Vision Updated')
    await updatedCheckForm.findAll('button').find((button) => button.text().includes('Update')).trigger('click')
    expect(updateHealthCheckCategory).toHaveBeenCalledWith(8, expect.objectContaining({
      name: 'Vision Updated',
    }))
    await flushPromises()
    await checkButtons[1].trigger('click')
    expect(archiveHealthCheckCategory).toHaveBeenCalledWith(8)
  })
})
