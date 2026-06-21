<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import {
  archiveCalendarEventDraft,
  createDefaultAttendanceSettings,
  createEmptyCalendarEventDraft,
  getAttendanceConfigurationSnapshot,
  getCalendarEventsCount,
  getSchoolWeekConfiguration,
  loadAttendanceConfiguration,
  saveAttendanceSettings,
  saveCalendarEventDraft,
  setAttendanceConfigurationSnapshot,
} from '@/modules/preschool/services/preschoolAttendanceConfigurationService'

defineOptions({
  name: 'PreschoolAttendanceSettingsPage',
})

const { t, language } = useLanguage()

const loading = ref(true)
const savingSettings = ref(false)
const savingEvent = ref(false)
const errorMessage = ref('')
const feedbackMessage = ref('')
const settingsDraft = ref(createDefaultAttendanceSettings())
const calendarEvents = ref([])
const eventDraft = ref(createEmptyCalendarEventDraft())
const eventDraftErrors = ref({})
const eventMode = ref('create')

const schoolWeekSummary = computed(() => getSchoolWeekConfiguration())
const eventTypeOptions = computed(() => ([
  { label: t('preschoolAttendanceSettingsPage.calendar.types.holiday'), value: 'holiday' },
  { label: t('preschoolAttendanceSettingsPage.calendar.types.closure'), value: 'closure' },
  { label: t('preschoolAttendanceSettingsPage.calendar.types.teacherTraining'), value: 'teacher_training' },
  { label: t('preschoolAttendanceSettingsPage.calendar.types.examination'), value: 'examination' },
  { label: t('preschoolAttendanceSettingsPage.calendar.types.specialEvent'), value: 'special_event' },
]))

const statusOptions = computed(() => ([
  { label: t('preschoolAttendanceSettingsPage.calendar.statuses.active'), value: 'active' },
  { label: t('preschoolAttendanceSettingsPage.calendar.statuses.archived'), value: 'archived' },
]))

const settingsValidation = computed(() => validateSettingsDraft())
const sortedCalendarEvents = computed(() =>
  [...calendarEvents.value].sort((left, right) => String(right.startDate || '').localeCompare(String(left.startDate || ''))),
)

function refreshSnapshot() {
  const snapshot = getAttendanceConfigurationSnapshot()
  settingsDraft.value = snapshot.settings || createDefaultAttendanceSettings()
  calendarEvents.value = snapshot.calendarEvents || []
}

function beginCreateEvent() {
  eventMode.value = 'create'
  eventDraft.value = createEmptyCalendarEventDraft()
  eventDraftErrors.value = {}
}

function beginEditEvent(event) {
  if (!event) return

  eventMode.value = 'edit'
  eventDraft.value = {
    id: event.id || '',
    academicYearId: event.academicYearId || '',
    title: event.title || '',
    description: event.description || '',
    type: event.type || 'holiday',
    startDate: event.startDate || '',
    endDate: event.endDate || '',
    status: event.status || 'active',
  }
  eventDraftErrors.value = {}
}

function validateSettingsDraft() {
  const errors = {}

  if (!(Number(settingsDraft.value.lateThresholdMinutes) >= 0)) {
    errors.lateThresholdMinutes = 'positive'
  }

  if (!(Number(settingsDraft.value.halfDayThresholdMinutes) >= 0)) {
    errors.halfDayThresholdMinutes = 'positive'
  }

  if (!(Number(settingsDraft.value.absenceAlertDays) >= 1)) {
    errors.absenceAlertDays = 'positive'
  }

  if (![
    settingsDraft.value.mondayEnabled,
    settingsDraft.value.tuesdayEnabled,
    settingsDraft.value.wednesdayEnabled,
    settingsDraft.value.thursdayEnabled,
    settingsDraft.value.fridayEnabled,
    settingsDraft.value.saturdayEnabled,
    settingsDraft.value.sundayEnabled,
  ].some(Boolean)) {
    errors.schoolWeek = 'required'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateEventDraft() {
  const errors = {}
  const startDate = eventDraft.value.startDate ? new Date(eventDraft.value.startDate) : null
  const endDate = eventDraft.value.endDate ? new Date(eventDraft.value.endDate) : null

  if (!String(eventDraft.value.academicYearId || '').trim()) {
    errors.academicYearId = 'required'
  }
  if (!String(eventDraft.value.title || '').trim()) {
    errors.title = 'required'
  }
  if (!String(eventDraft.value.type || '').trim()) {
    errors.type = 'required'
  }
  if (!eventDraft.value.startDate) {
    errors.startDate = 'required'
  }
  if (!eventDraft.value.endDate) {
    errors.endDate = 'required'
  }

  if (startDate && Number.isNaN(startDate.getTime())) {
    errors.startDate = 'required'
  }
  if (endDate && Number.isNaN(endDate.getTime())) {
    errors.endDate = 'required'
  }

  if (!errors.startDate && !errors.endDate && startDate && endDate && startDate.getTime() > endDate.getTime()) {
    errors.endDate = 'range'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  try {
    const snapshot = await loadAttendanceConfiguration()
    settingsDraft.value = snapshot.settings || createDefaultAttendanceSettings()
    calendarEvents.value = snapshot.calendarEvents || []
    setAttendanceConfigurationSnapshot(snapshot)
    beginCreateEvent()
  } catch (error) {
    refreshSnapshot()
    errorMessage.value = error?.message || t('preschoolAttendanceSettingsPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

async function handleSaveSettings() {
  const result = validateSettingsDraft()
  if (!result.isValid) {
    feedbackMessage.value = t('preschoolAttendanceSettingsPage.messages.validationFailed')
    return
  }

  savingSettings.value = true
  feedbackMessage.value = ''

  try {
    const saved = await saveAttendanceSettings(settingsDraft.value)
    settingsDraft.value = saved
    setAttendanceConfigurationSnapshot({ settings: saved, calendarEvents: calendarEvents.value })
    feedbackMessage.value = t('preschoolAttendanceSettingsPage.messages.settingsSaved')
  } catch (error) {
    feedbackMessage.value = error?.message || t('preschoolAttendanceSettingsPage.messages.saveFailed')
  } finally {
    savingSettings.value = false
  }
}

async function handleSaveEvent() {
  const result = validateEventDraft()
  eventDraftErrors.value = result.errors

  if (!result.isValid) {
    feedbackMessage.value = t('preschoolAttendanceSettingsPage.messages.validationFailed')
    return
  }

  savingEvent.value = true
  feedbackMessage.value = ''

  try {
    const nextMessageKey = eventMode.value === 'edit'
      ? 'messages.eventUpdated'
      : 'messages.eventCreated'
    const saved = await saveCalendarEventDraft(eventDraft.value)
    const nextEvents = calendarEvents.value.filter((event) => String(event.id) !== String(saved.id))
    nextEvents.unshift(saved)
    calendarEvents.value = nextEvents
    setAttendanceConfigurationSnapshot({ settings: settingsDraft.value, calendarEvents: nextEvents })
    beginCreateEvent()
    feedbackMessage.value = t(`preschoolAttendanceSettingsPage.${nextMessageKey}`)
  } catch (error) {
    feedbackMessage.value = error?.message || t('preschoolAttendanceSettingsPage.messages.saveFailed')
  } finally {
    savingEvent.value = false
  }
}

async function handleArchiveEvent(event) {
  if (!event) return

  savingEvent.value = true
  feedbackMessage.value = ''

  try {
    const archived = await archiveCalendarEventDraft(event.id)
    const nextEvents = calendarEvents.value.map((item) => (
      String(item.id) === String(archived.id) ? archived : item
    ))
    calendarEvents.value = nextEvents
    setAttendanceConfigurationSnapshot({ settings: settingsDraft.value, calendarEvents: nextEvents })
    feedbackMessage.value = t('preschoolAttendanceSettingsPage.messages.eventArchived')
  } catch (error) {
    feedbackMessage.value = error?.message || t('preschoolAttendanceSettingsPage.messages.saveFailed')
  } finally {
    savingEvent.value = false
  }
}

function formatDate(value) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(language.value === 'KH' ? 'km-KH' : 'en-GB', { dateStyle: 'medium' }).format(date)
}

function formatSchoolWeekLabel() {
  return schoolWeekSummary.value.label
}

onMounted(loadPage)
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolAttendanceSettingsPage.pageTitle')"
        :subtitle="t('preschoolAttendanceSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
        data-testid="attendance-settings-loading"
      >
        <div class="h-4 w-40 animate-pulse rounded-full bg-slate-100" />
        <div class="mt-4 h-4 w-80 animate-pulse rounded-full bg-slate-100" />
      </div>

      <div v-else class="space-y-6">
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="attendance-settings-error"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="feedbackMessage"
          class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700"
          data-testid="attendance-settings-feedback"
        >
          {{ feedbackMessage }}
        </div>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAttendanceSettingsPage.sections.thresholds.eyebrow')"
          :title="t('preschoolAttendanceSettingsPage.sections.thresholds.title')"
          :subtitle="t('preschoolAttendanceSettingsPage.sections.thresholds.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-3">
            <label class="field">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.lateThresholdMinutes') }}</span>
                <input
                v-model.number="settingsDraft.lateThresholdMinutes"
                type="number"
                min="0"
              >
              <small v-if="settingsValidation.errors.lateThresholdMinutes" class="error-text">
                {{ t(`preschoolAttendanceSettingsPage.validation.${settingsValidation.errors.lateThresholdMinutes}`) }}
              </small>
            </label>

            <label class="field">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.halfDayThresholdMinutes') }}</span>
                <input
                v-model.number="settingsDraft.halfDayThresholdMinutes"
                type="number"
                min="0"
              >
              <small v-if="settingsValidation.errors.halfDayThresholdMinutes" class="error-text">
                {{ t(`preschoolAttendanceSettingsPage.validation.${settingsValidation.errors.halfDayThresholdMinutes}`) }}
              </small>
            </label>

            <label class="field">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.absenceAlertDays') }}</span>
                <input
                v-model.number="settingsDraft.absenceAlertDays"
                type="number"
                min="1"
              >
              <small v-if="settingsValidation.errors.absenceAlertDays" class="error-text">
                {{ t(`preschoolAttendanceSettingsPage.validation.${settingsValidation.errors.absenceAlertDays}`) }}
              </small>
            </label>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAttendanceSettingsPage.sections.alerts.eyebrow')"
          :title="t('preschoolAttendanceSettingsPage.sections.alerts.title')"
          :subtitle="t('preschoolAttendanceSettingsPage.sections.alerts.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-3">
            <label class="toggle">
              <input v-model="settingsDraft.guardianAlertEnabled" type="checkbox">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.guardianAlerts') }}</span>
            </label>
            <label class="toggle">
              <input v-model="settingsDraft.teacherAlertEnabled" type="checkbox">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.teacherAlerts') }}</span>
            </label>
            <label class="toggle">
              <input v-model="settingsDraft.adminAlertEnabled" type="checkbox">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.adminAlerts') }}</span>
            </label>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAttendanceSettingsPage.sections.schoolWeek.eyebrow')"
          :title="t('preschoolAttendanceSettingsPage.sections.schoolWeek.title')"
          :subtitle="t('preschoolAttendanceSettingsPage.sections.schoolWeek.subtitle')"
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <label v-for="day in [
              ['mondayEnabled', 'monday'],
              ['tuesdayEnabled', 'tuesday'],
              ['wednesdayEnabled', 'wednesday'],
              ['thursdayEnabled', 'thursday'],
              ['fridayEnabled', 'friday'],
              ['saturdayEnabled', 'saturday'],
              ['sundayEnabled', 'sunday'],
            ]" :key="day[0]" class="toggle toggle--day">
              <input v-model="settingsDraft[day[0]]" type="checkbox">
              <span>{{ t(`preschoolAttendanceSettingsPage.weekDays.${day[1]}`) }}</span>
            </label>
          </div>
          <p v-if="settingsValidation.errors.schoolWeek" class="mt-3 text-sm font-medium text-rose-600">
            {{ t(`preschoolAttendanceSettingsPage.validation.${settingsValidation.errors.schoolWeek}`) }}
          </p>
          <p class="mt-4 text-sm text-slate-500">
            {{ t('preschoolAttendanceSettingsPage.summary.schoolWeek') }}: {{ formatSchoolWeekLabel() }}
          </p>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAttendanceSettingsPage.sections.calendar.eyebrow')"
          :title="t('preschoolAttendanceSettingsPage.sections.calendar.title')"
          :subtitle="t('preschoolAttendanceSettingsPage.sections.calendar.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm text-slate-600">
              {{ t('preschoolAttendanceSettingsPage.summary.calendarEvents') }}: {{ getCalendarEventsCount() }}
            </div>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" :label="t('preschoolAttendanceSettingsPage.actions.addEvent')" @click="beginCreateEvent" />
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.academicYearId') }}</span>
                <input v-model="eventDraft.academicYearId" type="text">
                <small v-if="eventDraftErrors.academicYearId" class="error-text">{{ t(`preschoolAttendanceSettingsPage.validation.${eventDraftErrors.academicYearId}`) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.title') }}</span>
                <input v-model="eventDraft.title" type="text">
                <small v-if="eventDraftErrors.title" class="error-text">{{ t(`preschoolAttendanceSettingsPage.validation.${eventDraftErrors.title}`) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.type') }}</span>
                <select v-model="eventDraft.type">
                  <option v-for="option in eventTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <small v-if="eventDraftErrors.type" class="error-text">{{ t(`preschoolAttendanceSettingsPage.validation.${eventDraftErrors.type}`) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.startDate') }}</span>
                <input v-model="eventDraft.startDate" type="date">
                <small v-if="eventDraftErrors.startDate" class="error-text">{{ t(`preschoolAttendanceSettingsPage.validation.${eventDraftErrors.startDate}`) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.endDate') }}</span>
                <input v-model="eventDraft.endDate" type="date">
                <small v-if="eventDraftErrors.endDate" class="error-text">{{ t(`preschoolAttendanceSettingsPage.validation.${eventDraftErrors.endDate}`) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolAttendanceSettingsPage.fields.status') }}</span>
                <select v-model="eventDraft.status">
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>

            <label class="field mt-4">
              <span>{{ t('preschoolAttendanceSettingsPage.fields.description') }}</span>
              <textarea v-model="eventDraft.description" rows="3" />
            </label>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                :label="eventMode === 'edit' ? t('preschoolAttendanceSettingsPage.actions.updateEvent') : t('preschoolAttendanceSettingsPage.actions.createEvent')"
                :loading="savingEvent"
                @click="handleSaveEvent"
              />
              <Button variant="ghost" size="sm" :label="t('preschoolAttendanceSettingsPage.actions.resetEvent')" @click="beginCreateEvent" />
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.title') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.type') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.startDate') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.endDate') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="event in sortedCalendarEvents" :key="event.id">
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ event.title }}</p>
                      <p v-if="event.description" class="text-xs text-slate-500">{{ event.description }}</p>
                    </td>
                    <td class="px-4 py-3">{{ t(`preschoolAttendanceSettingsPage.calendar.types.${event.type}`) }}</td>
                    <td class="px-4 py-3">{{ formatDate(event.startDate) }}</td>
                    <td class="px-4 py-3">{{ formatDate(event.endDate) }}</td>
                    <td class="px-4 py-3">
                      <span :class="event.status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ t(`preschoolAttendanceSettingsPage.calendar.statuses.${event.status}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('preschoolAttendanceSettingsPage.actions.edit')" @click="beginEditEvent(event)" />
                        <Button
                          variant="ghost"
                          size="sm"
                          :label="t('preschoolAttendanceSettingsPage.actions.archive')"
                          :disabled="event.status === 'archived'"
                          @click="handleArchiveEvent(event)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <div class="flex justify-end gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
          <Button variant="primary" :loading="savingSettings" :label="t('preschoolAttendanceSettingsPage.actions.saveSettings')" @click="handleSaveSettings" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field > span,
.toggle > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.field > input,
.field > select,
.field > textarea {
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
  font-size: 0.875rem;
}

.field > textarea {
  min-height: 7rem;
}

.error-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e11d48;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
}

.toggle--day {
  justify-content: flex-start;
}
</style>
