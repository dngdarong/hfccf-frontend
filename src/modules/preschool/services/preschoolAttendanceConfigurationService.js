import { ref } from 'vue'
import {
  archiveCalendarEvent,
  buildSchoolWeekLabel,
  createCalendarEvent,
  fetchAttendanceSettings,
  fetchCalendarEvents,
  normalizeAttendanceSettings,
  normalizeAttendanceSummary,
  normalizeCalendarEvent,
  updateAttendanceSettings,
  updateCalendarEvent,
  buildAttendanceSettingsPayload,
} from '@/modules/preschool/services/api/preschoolAttendanceConfigurationApi'

function cloneValue(value) {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)]))
  }

  return value
}

function toIsoDate(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function isDateInRange(date, startDate, endDate) {
  if (!date || !startDate || !endDate) return false
  return date >= startDate && date <= endDate
}

function countEnabledDays(settings = {}) {
  return [
    settings.mondayEnabled,
    settings.tuesdayEnabled,
    settings.wednesdayEnabled,
    settings.thursdayEnabled,
    settings.fridayEnabled,
    settings.saturdayEnabled,
    settings.sundayEnabled,
  ].filter(Boolean).length
}

export function createDefaultAttendanceSettings() {
  return {
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
  }
}

export function createEmptyCalendarEventDraft() {
  return {
    id: '',
    academicYearId: '',
    title: '',
    description: '',
    type: 'holiday',
    startDate: '',
    endDate: '',
    status: 'active',
  }
}

const attendanceSettingsSnapshot = ref(createDefaultAttendanceSettings())
const calendarEventsSnapshot = ref([])

export function setAttendanceConfigurationSnapshot({ settings = null, calendarEvents = [] } = {}) {
  attendanceSettingsSnapshot.value = settings ? cloneValue(normalizeAttendanceSettings(settings)) : createDefaultAttendanceSettings()
  calendarEventsSnapshot.value = Array.isArray(calendarEvents) ? calendarEvents.map((event) => cloneValue(normalizeCalendarEvent(event))) : []
}

export function getAttendanceConfigurationSnapshot() {
  return {
    settings: cloneValue(attendanceSettingsSnapshot.value),
    calendarEvents: cloneValue(calendarEventsSnapshot.value),
  }
}

export function getLateThreshold() {
  return Number(attendanceSettingsSnapshot.value.lateThresholdMinutes || 0)
}

export function getHalfDayThreshold() {
  return Number(attendanceSettingsSnapshot.value.halfDayThresholdMinutes || 0)
}

export function getAbsenceAlertDays() {
  return Number(attendanceSettingsSnapshot.value.absenceAlertDays || 0)
}

export function getSchoolWeekConfiguration() {
  const settings = attendanceSettingsSnapshot.value
  const schoolDaysPerWeek = countEnabledDays(settings)
  return {
    mondayEnabled: Boolean(settings.mondayEnabled),
    tuesdayEnabled: Boolean(settings.tuesdayEnabled),
    wednesdayEnabled: Boolean(settings.wednesdayEnabled),
    thursdayEnabled: Boolean(settings.thursdayEnabled),
    fridayEnabled: Boolean(settings.fridayEnabled),
    saturdayEnabled: Boolean(settings.saturdayEnabled),
    sundayEnabled: Boolean(settings.sundayEnabled),
    schoolDaysPerWeek,
    label: buildSchoolWeekLabel(schoolDaysPerWeek),
  }
}

export function getAttendanceSummary() {
  const settings = attendanceSettingsSnapshot.value
  const schoolWeek = getSchoolWeekConfiguration()

  return normalizeAttendanceSummary({
    attendance: {
      lateThresholdMinutes: settings.lateThresholdMinutes,
      halfDayThresholdMinutes: settings.halfDayThresholdMinutes,
      absenceAlertDays: settings.absenceAlertDays,
      schoolDaysPerWeek: schoolWeek.schoolDaysPerWeek,
      schoolWeekLabel: schoolWeek.label,
      calendarEventsCount: getCalendarEventsCount(),
    },
  })
}

export function isHoliday(date) {
  const targetDate = toIsoDate(date)
  if (!targetDate) return false

  return calendarEventsSnapshot.value.some((event) => {
    if (String(event.status || '').toLowerCase() === 'archived') return false
    if (!['holiday', 'closure'].includes(String(event.type || '').toLowerCase())) return false
    return isDateInRange(targetDate, String(event.startDate || ''), String(event.endDate || ''))
  })
}

export function isSchoolDay(date) {
  const target = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(target.getTime())) return false
  if (isHoliday(target)) return false

  const settings = attendanceSettingsSnapshot.value
  const weekday = target.getDay()

  const enabledDays = [
    settings.sundayEnabled,
    settings.mondayEnabled,
    settings.tuesdayEnabled,
    settings.wednesdayEnabled,
    settings.thursdayEnabled,
    settings.fridayEnabled,
    settings.saturdayEnabled,
  ]

  return Boolean(enabledDays[weekday])
}

export function getCalendarEventsCount() {
  return calendarEventsSnapshot.value.filter((event) => String(event.status || '').toLowerCase() !== 'archived').length
}

export async function loadAttendanceConfiguration() {
  const [settings, calendarEvents] = await Promise.all([
    fetchAttendanceSettings(),
    fetchCalendarEvents({ perPage: 250 }),
  ])

  setAttendanceConfigurationSnapshot({
    settings,
    calendarEvents: calendarEvents.items || [],
  })

  return getAttendanceConfigurationSnapshot()
}

export async function saveAttendanceSettings(settings = attendanceSettingsSnapshot.value) {
  const saved = await updateAttendanceSettings(settings)
  const nextSettings = saved ? normalizeAttendanceSettings(saved) : normalizeAttendanceSettings(settings)
  attendanceSettingsSnapshot.value = cloneValue(nextSettings)
  return cloneValue(nextSettings)
}

export async function saveCalendarEventDraft(event = {}) {
  const isEdit = Boolean(event.id)
  const saved = isEdit
    ? await updateCalendarEvent(event.id, event)
    : await createCalendarEvent(event)

  const normalized = normalizeCalendarEvent(saved)
  const nextEvents = [...calendarEventsSnapshot.value]
  const existingIndex = nextEvents.findIndex((item) => String(item.id) === String(normalized.id))

  if (existingIndex > -1) {
    nextEvents.splice(existingIndex, 1, cloneValue(normalized))
  } else {
    nextEvents.unshift(cloneValue(normalized))
  }

  calendarEventsSnapshot.value = nextEvents
  return cloneValue(normalized)
}

export async function archiveCalendarEventDraft(eventOrId) {
  const archived = await archiveCalendarEvent(eventOrId)
  const normalized = normalizeCalendarEvent(archived)
  const nextEvents = calendarEventsSnapshot.value.map((event) => (
    String(event.id) === String(normalized.id) ? cloneValue(normalized) : event
  ))
  calendarEventsSnapshot.value = nextEvents
  return cloneValue(normalized)
}

export function serializeAttendanceSettings(settings = attendanceSettingsSnapshot.value) {
  return buildAttendanceSettingsPayload(settings)
}
