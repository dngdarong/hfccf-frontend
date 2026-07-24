import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolAttendanceSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolAttendanceSettingsPage.vue'
import {
  archiveCalendarEventDraft,
  createDefaultAttendanceSettings,
  createEmptyCalendarEventDraft,
  getCalendarEventsCount,
  getAttendanceConfigurationSnapshot,
  getSchoolWeekConfiguration,
  loadAttendanceConfiguration,
  saveAttendanceSettings,
  saveCalendarEventDraft,
} from '@/modules/preschool/services/preschoolAttendanceConfigurationService'

vi.mock('@/modules/preschool/services/preschoolAttendanceConfigurationService', () => ({
  archiveCalendarEventDraft: vi.fn(),
  createDefaultAttendanceSettings: vi.fn(),
  createEmptyCalendarEventDraft: vi.fn(),
  getAttendanceConfigurationSnapshot: vi.fn(),
  getCalendarEventsCount: vi.fn(),
  getSchoolWeekConfiguration: vi.fn(),
  loadAttendanceConfiguration: vi.fn(),
  saveAttendanceSettings: vi.fn(),
  saveCalendarEventDraft: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PreschoolSettingsSectionCard: { props: ['eyebrow', 'title', 'subtitle'], template: '<section><h2>{{ title }}</h2><p>{{ subtitle }}</p><slot /></section>' },
    Button: { props: ['label'], emits: ['click'], template: '<button @click="$emit(\'click\')">{{ label }}<slot /></button>' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  createDefaultAttendanceSettings.mockReturnValue({
    id: '',
    lateThresholdMinutes: 15,
    halfDayThresholdMinutes: 180,
    absenceAlertDays: 3,
    guardianAlertEnabled: true,
    teacherAlertEnabled: true,
    adminAlertEnabled: true,
    mondayEnabled: true,
    tuesdayEnabled: true,
    wednesdayEnabled: true,
    thursdayEnabled: true,
    fridayEnabled: true,
    saturdayEnabled: false,
    sundayEnabled: false,
  })

  createEmptyCalendarEventDraft.mockReturnValue({
    id: '',
    academicYearId: '',
    title: '',
    description: '',
    type: 'holiday',
    startDate: '',
    endDate: '',
    status: 'active',
  })

  getSchoolWeekConfiguration.mockReturnValue({
    mondayEnabled: true,
    tuesdayEnabled: true,
    wednesdayEnabled: true,
    thursdayEnabled: true,
    fridayEnabled: true,
    saturdayEnabled: false,
    sundayEnabled: false,
    schoolDaysPerWeek: 5,
    label: 'Mon-Fri',
  })

  getCalendarEventsCount.mockReturnValue(1)
  getAttendanceConfigurationSnapshot.mockReturnValue({
    settings: createDefaultAttendanceSettings(),
    calendarEvents: [
      {
        id: 1,
        academicYearId: 5,
        title: 'National Holiday',
        description: 'School closed',
        type: 'holiday',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        status: 'active',
      },
    ],
  })

  loadAttendanceConfiguration.mockResolvedValue({
    settings: createDefaultAttendanceSettings(),
    calendarEvents: [
      {
        id: 1,
        academicYearId: 5,
        title: 'National Holiday',
        description: 'School closed',
        type: 'holiday',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        status: 'active',
      },
    ],
  })

  saveAttendanceSettings.mockResolvedValue(createDefaultAttendanceSettings())
  saveCalendarEventDraft.mockResolvedValue({
    id: 2,
    academicYearId: 5,
    title: 'Teacher Training',
    description: 'Staff workshop',
    type: 'teacher_training',
    startDate: '2026-02-05',
    endDate: '2026-02-05',
    status: 'active',
  })
  archiveCalendarEventDraft.mockResolvedValue({
    id: 1,
    academicYearId: 5,
    title: 'National Holiday',
    description: 'School closed',
    type: 'holiday',
    startDate: '2026-01-01',
    endDate: '2026-01-01',
    status: 'archived',
  })
})

describe('PreschoolAttendanceSettingsPage', () => {
  it('renders the attendance configuration page and loads live data', async () => {
    const wrapper = mountWithPlugins(PreschoolAttendanceSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Attendance Configuration')
    expect(wrapper.text()).toContain('Attendance Threshold Rules')
    expect(wrapper.text()).toContain('Mon-Fri')
    expect(wrapper.text()).toContain('National Holiday')
  })

  it('sends the attendance settings payload when saving', async () => {
    const wrapper = mountWithPlugins(PreschoolAttendanceSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const numberInputs = wrapper.findAll('input[type="number"]')
    await numberInputs[0].setValue('20')
    await numberInputs[1].setValue('200')
    await numberInputs[2].setValue('4')

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('Save Settings'))
    await saveButton.trigger('click')

    expect(saveAttendanceSettings).toHaveBeenCalledWith(expect.objectContaining({
      lateThresholdMinutes: 20,
      halfDayThresholdMinutes: 200,
      absenceAlertDays: 4,
    }))
  })

  it('creates calendar events with the expected payload', async () => {
    const wrapper = mountWithPlugins(PreschoolAttendanceSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const textInputs = wrapper.findAll('input[type="text"]')
    await textInputs[0].setValue('5')
    await textInputs[1].setValue('Teacher Training')
    await wrapper.find('textarea').setValue('Staff workshop')
    const dateInputs = wrapper.findAll('input[type="date"]')
    await dateInputs[0].setValue('2026-02-05')
    await dateInputs[1].setValue('2026-02-05')

    const createButton = wrapper.findAll('button').find((button) => button.text().includes('Create Event'))
    await createButton.trigger('click')

    expect(saveCalendarEventDraft).toHaveBeenCalledWith(expect.objectContaining({
      academicYearId: '5',
      title: 'Teacher Training',
      description: 'Staff workshop',
      type: 'holiday',
    }))
  })

  it('archives existing calendar events', async () => {
    const wrapper = mountWithPlugins(PreschoolAttendanceSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const archiveButton = wrapper.findAll('button').find((button) => button.text().includes('Archive'))
    await archiveButton.trigger('click')

    expect(archiveCalendarEventDraft).toHaveBeenCalledWith(1)
  })

  it('shows a safe error state when attendance configuration loading fails', async () => {
    loadAttendanceConfiguration.mockRejectedValueOnce(new Error('API endpoint not found.'))
    getCalendarEventsCount.mockReturnValue(0)
    getAttendanceConfigurationSnapshot.mockReturnValue({
      settings: createDefaultAttendanceSettings(),
      calendarEvents: [],
    })

    const wrapper = mountWithPlugins(PreschoolAttendanceSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.find('[data-testid="attendance-settings-error"]').text()).toContain('API endpoint not found.')
    expect(wrapper.text()).not.toContain('National Holiday')
    expect(wrapper.text()).toContain('Calendar Events: 0')
  })
})
