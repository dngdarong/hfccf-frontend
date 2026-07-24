<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getApiErrorMessage } from '@/services/api'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import {
  fetchPreferences,
  updatePreferences,
} from '@/modules/preschool/services/api/preschoolPreferencesApi'

defineOptions({
  name: 'PreschoolPreferencesSettingsPage',
})

const { t } = useLanguage()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const saveErrors = ref({})
const preferences = ref(createEmptyPreferences())

const supportedLanguages = ['en', 'kh']
const supportedDateFormats = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'DD/MM/YYYY']
const supportedTimeFormats = ['H:i', 'HH:mm']
const supportedYearFormats = ['YY', 'YYYY']

const languageOptions = computed(() => [
  { label: t('preschoolPreferencesSettingsPage.languages.english'), value: 'en' },
  { label: t('preschoolPreferencesSettingsPage.languages.khmer'), value: 'kh' },
])

const studentCodePreview = computed(() => buildStudentCodePreview(preferences.value))

function createEmptyPreferences() {
  return {
    timezone: '',
    defaultLanguage: '',
    dateFormat: '',
    timeFormat: '',
    minimumEnrollmentAgeMonths: null,
    maximumEnrollmentAgeMonths: null,
    autoApproveEnrollment: false,
    studentCodePrefix: '',
    studentCodeYearFormat: '',
    studentCodeSequenceLength: null,
    defaultClassCapacity: null,
    teacherStudentRatio: null,
    waitlistEnabled: false,
    minimumGuardians: null,
    maximumGuardians: null,
    primaryGuardianRequired: false,
    pickupAuthorizationRequired: false,
    attendanceAlertEnabled: false,
    assessmentAlertEnabled: false,
    healthAlertEnabled: false,
    enrollmentNotificationEnabled: false,
  }
}

function buildStudentCodePreview(settings = {}) {
  const prefix = String(settings.studentCodePrefix || '').trim().toUpperCase()
  const format = String(settings.studentCodeYearFormat || '').trim().toUpperCase()
  const sequenceLength = Number(settings.studentCodeSequenceLength)

  if (!prefix || !supportedYearFormats.includes(format) || !Number.isInteger(sequenceLength) || sequenceLength < 1) {
    return '—'
  }

  const year = format === 'YY'
    ? new Date().getFullYear().toString().slice(-2)
    : format === 'YYYY'
      ? new Date().getFullYear().toString()
      : format

  if (!year || year === format) {
    return '—'
  }

  return `${prefix}-${year}-${String(1).padStart(sequenceLength, '0')}`
}

function isSupportedTimezone(value) {
  const timezone = String(value || '').trim()
  if (!timezone) return false

  if (typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone').includes(timezone)
  }

  return timezone === 'Asia/Phnom_Penh'
}

function mapValidationMessage(value) {
  const key = String(value || '').trim()
  if (!key) return ''

  const validationKeys = new Set([
    'required',
    'positive',
    'range',
    'invalidTimezone',
    'unsupportedLanguage',
    'invalidDateFormat',
    'invalidTimeFormat',
    'invalidYearFormat',
  ])

  return validationKeys.has(key)
    ? t(`preschoolPreferencesSettingsPage.validation.${key}`)
    : key
}

function mapBackendValidationErrors(error) {
  const responseErrors = error?.validationErrors
    || error?.response?.data?.data?.errors
    || error?.response?.data?.errors
    || {}
  const mapped = {}

  Object.entries(responseErrors).forEach(([field, messages]) => {
    const value = Array.isArray(messages) ? messages[0] : messages
    mapped[field.replace(/^preferences\./, '')] = String(value || '')
  })

  return mapped
}

function validatePreferencesDraft() {
  const errors = {}
  const minimumAge = Number(preferences.value.minimumEnrollmentAgeMonths)
  const maximumAge = Number(preferences.value.maximumEnrollmentAgeMonths)

  if (!isSupportedTimezone(preferences.value.timezone)) errors.timezone = 'invalidTimezone'
  if (!supportedLanguages.includes(String(preferences.value.defaultLanguage || '').trim())) errors.defaultLanguage = 'unsupportedLanguage'
  if (!supportedDateFormats.includes(String(preferences.value.dateFormat || '').trim())) errors.dateFormat = 'invalidDateFormat'
  if (!supportedTimeFormats.includes(String(preferences.value.timeFormat || '').trim())) errors.timeFormat = 'invalidTimeFormat'
  if (!(minimumAge >= 0)) errors.minimumEnrollmentAgeMonths = 'positive'
  if (!(maximumAge >= 0)) errors.maximumEnrollmentAgeMonths = 'positive'
  if (!errors.minimumEnrollmentAgeMonths && !errors.maximumEnrollmentAgeMonths && minimumAge > maximumAge) {
    errors.maximumEnrollmentAgeMonths = 'range'
  }
  if (!String(preferences.value.studentCodePrefix || '').trim()) errors.studentCodePrefix = 'required'
  if (!supportedYearFormats.includes(String(preferences.value.studentCodeYearFormat || '').trim().toUpperCase())) errors.studentCodeYearFormat = 'invalidYearFormat'
  if (!(Number(preferences.value.studentCodeSequenceLength) >= 1)) errors.studentCodeSequenceLength = 'positive'
  if (!(Number(preferences.value.defaultClassCapacity) >= 1)) errors.defaultClassCapacity = 'positive'
  if (!(Number(preferences.value.teacherStudentRatio) >= 1)) errors.teacherStudentRatio = 'positive'
  if (!(Number(preferences.value.minimumGuardians) >= 0)) errors.minimumGuardians = 'positive'
  if (!(Number(preferences.value.maximumGuardians) >= 0)) errors.maximumGuardians = 'positive'
  if (!errors.minimumGuardians && !errors.maximumGuardians && Number(preferences.value.minimumGuardians) > Number(preferences.value.maximumGuardians)) {
    errors.maximumGuardians = 'range'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

async function loadPreferences() {
  loading.value = true
  errorMessage.value = ''
  saveErrors.value = {}

  try {
    preferences.value = await fetchPreferences()
  } catch (error) {
    preferences.value = createEmptyPreferences()
    errorMessage.value = getApiErrorMessage(error, t('preschoolPreferencesSettingsPage.messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  const result = validatePreferencesDraft()
  saveErrors.value = result.errors

  if (!result.isValid) {
    toast.add({
      severity: 'warn',
      summary: t('preschoolPreferencesSettingsPage.messages.validationFailed'),
      life: 2600,
    })
    return
  }

  saving.value = true

  try {
    preferences.value = await updatePreferences(preferences.value)
    saveErrors.value = {}
    toast.add({
      severity: 'success',
      summary: t('preschoolPreferencesSettingsPage.messages.settingsSaved'),
      life: 2600,
    })
  } catch (error) {
    const validationErrors = mapBackendValidationErrors(error)

    if (Object.keys(validationErrors).length > 0) {
      saveErrors.value = validationErrors
      toast.add({
        severity: 'warn',
        summary: t('preschoolPreferencesSettingsPage.messages.validationFailed'),
        life: 2600,
      })
      return
    }

    toast.add({
      severity: 'error',
      summary: getApiErrorMessage(error, t('preschoolPreferencesSettingsPage.messages.saveFailed')),
      life: 3200,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadPreferences()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolPreferencesSettingsPage.pageTitle')"
        :subtitle="t('preschoolPreferencesSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        data-testid="preferences-settings-loading"
      >
        <div
          v-for="index in 4"
          :key="index"
          class="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-4 h-6 w-48 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-3 h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>

      <div v-else class="space-y-6">
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="preferences-settings-error"
        >
          {{ errorMessage }}
        </div>

        <PreschoolSettingsSectionCard
          data-testid="preferences-general-section"
          :eyebrow="t('preschoolPreferencesSettingsPage.sections.general.eyebrow')"
          :title="t('preschoolPreferencesSettingsPage.sections.general.title')"
          :subtitle="t('preschoolPreferencesSettingsPage.sections.general.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="field">
              <span>{{ t('preschoolPreferencesSettingsPage.fields.timezone') }}</span>
              <InputText v-model="preferences.timezone" />
              <small v-if="saveErrors.timezone" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.timezone) }}</small>
            </label>

            <label class="field">
              <span>{{ t('preschoolPreferencesSettingsPage.fields.defaultLanguage') }}</span>
              <Select
                v-model="preferences.defaultLanguage"
                :options="languageOptions"
                option-label="label"
                option-value="value"
              />
              <small v-if="saveErrors.defaultLanguage" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.defaultLanguage) }}</small>
            </label>

            <label class="field">
              <span>{{ t('preschoolPreferencesSettingsPage.fields.dateFormat') }}</span>
              <InputText v-model="preferences.dateFormat" />
              <small v-if="saveErrors.dateFormat" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.dateFormat) }}</small>
            </label>

            <label class="field">
              <span>{{ t('preschoolPreferencesSettingsPage.fields.timeFormat') }}</span>
              <InputText v-model="preferences.timeFormat" />
              <small v-if="saveErrors.timeFormat" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.timeFormat) }}</small>
            </label>
          </div>
        </PreschoolSettingsSectionCard>

        <div class="grid gap-6 xl:grid-cols-2">
          <PreschoolSettingsSectionCard
            data-testid="preferences-enrollment-section"
            :eyebrow="t('preschoolPreferencesSettingsPage.sections.enrollment.eyebrow')"
            :title="t('preschoolPreferencesSettingsPage.sections.enrollment.title')"
            :subtitle="t('preschoolPreferencesSettingsPage.sections.enrollment.subtitle')"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.minimumEnrollmentAgeMonths') }}</span>
                <InputNumber v-model="preferences.minimumEnrollmentAgeMonths" :min="0" />
                <small v-if="saveErrors.minimumEnrollmentAgeMonths" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.minimumEnrollmentAgeMonths) }}</small>
              </label>

              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.maximumEnrollmentAgeMonths') }}</span>
                <InputNumber v-model="preferences.maximumEnrollmentAgeMonths" :min="0" />
                <small v-if="saveErrors.maximumEnrollmentAgeMonths" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.maximumEnrollmentAgeMonths) }}</small>
              </label>

              <label class="toggle md:col-span-2">
                <div>
                  <span>{{ t('preschoolPreferencesSettingsPage.fields.autoApproveEnrollment') }}</span>
                </div>
                <ToggleSwitch v-model="preferences.autoApproveEnrollment" />
              </label>
            </div>
          </PreschoolSettingsSectionCard>

          <PreschoolSettingsSectionCard
            data-testid="preferences-student-code-section"
            :eyebrow="t('preschoolPreferencesSettingsPage.sections.studentCode.eyebrow')"
            :title="t('preschoolPreferencesSettingsPage.sections.studentCode.title')"
            :subtitle="t('preschoolPreferencesSettingsPage.sections.studentCode.subtitle')"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.studentCodePrefix') }}</span>
                <InputText v-model="preferences.studentCodePrefix" />
                <small v-if="saveErrors.studentCodePrefix" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.studentCodePrefix) }}</small>
              </label>

              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.studentCodeYearFormat') }}</span>
                <InputText v-model="preferences.studentCodeYearFormat" />
                <small v-if="saveErrors.studentCodeYearFormat" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.studentCodeYearFormat) }}</small>
              </label>

              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.studentCodeSequenceLength') }}</span>
                <InputNumber v-model="preferences.studentCodeSequenceLength" :min="1" :max="12" />
                <small v-if="saveErrors.studentCodeSequenceLength" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.studentCodeSequenceLength) }}</small>
              </label>

              <div class="preview-card">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {{ t('preschoolPreferencesSettingsPage.preview.studentCode') }}
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-900" data-testid="student-code-preview">
                  {{ studentCodePreview }}
                </p>
              </div>
            </div>
          </PreschoolSettingsSectionCard>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <PreschoolSettingsSectionCard
            data-testid="preferences-class-section"
            :eyebrow="t('preschoolPreferencesSettingsPage.sections.classRules.eyebrow')"
            :title="t('preschoolPreferencesSettingsPage.sections.classRules.title')"
            :subtitle="t('preschoolPreferencesSettingsPage.sections.classRules.subtitle')"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.defaultClassCapacity') }}</span>
                <InputNumber v-model="preferences.defaultClassCapacity" :min="1" />
                <small v-if="saveErrors.defaultClassCapacity" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.defaultClassCapacity) }}</small>
              </label>

              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.teacherStudentRatio') }}</span>
                <InputNumber v-model="preferences.teacherStudentRatio" :min="1" />
                <small v-if="saveErrors.teacherStudentRatio" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.teacherStudentRatio) }}</small>
              </label>

              <label class="toggle md:col-span-2">
                <div>
                  <span>{{ t('preschoolPreferencesSettingsPage.fields.waitlistEnabled') }}</span>
                </div>
                <ToggleSwitch v-model="preferences.waitlistEnabled" />
              </label>
            </div>
          </PreschoolSettingsSectionCard>

          <PreschoolSettingsSectionCard
            data-testid="preferences-guardian-section"
            :eyebrow="t('preschoolPreferencesSettingsPage.sections.guardianRules.eyebrow')"
            :title="t('preschoolPreferencesSettingsPage.sections.guardianRules.title')"
            :subtitle="t('preschoolPreferencesSettingsPage.sections.guardianRules.subtitle')"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.minimumGuardians') }}</span>
                <InputNumber v-model="preferences.minimumGuardians" :min="0" />
                <small v-if="saveErrors.minimumGuardians" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.minimumGuardians) }}</small>
              </label>

              <label class="field">
                <span>{{ t('preschoolPreferencesSettingsPage.fields.maximumGuardians') }}</span>
                <InputNumber v-model="preferences.maximumGuardians" :min="0" />
                <small v-if="saveErrors.maximumGuardians" class="text-xs font-medium text-rose-600">{{ mapValidationMessage(saveErrors.maximumGuardians) }}</small>
              </label>

              <label class="toggle">
                <div>
                  <span>{{ t('preschoolPreferencesSettingsPage.fields.primaryGuardianRequired') }}</span>
                </div>
                <ToggleSwitch v-model="preferences.primaryGuardianRequired" />
              </label>

              <label class="toggle">
                <div>
                  <span>{{ t('preschoolPreferencesSettingsPage.fields.pickupAuthorizationRequired') }}</span>
                </div>
                <ToggleSwitch v-model="preferences.pickupAuthorizationRequired" />
              </label>
            </div>
          </PreschoolSettingsSectionCard>
        </div>

        <PreschoolSettingsSectionCard
          data-testid="preferences-communications-section"
          :eyebrow="t('preschoolPreferencesSettingsPage.sections.communicationRules.eyebrow')"
          :title="t('preschoolPreferencesSettingsPage.sections.communicationRules.title')"
          :subtitle="t('preschoolPreferencesSettingsPage.sections.communicationRules.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="toggle">
              <div>
                <span>{{ t('preschoolPreferencesSettingsPage.fields.attendanceAlerts') }}</span>
              </div>
              <ToggleSwitch v-model="preferences.attendanceAlertEnabled" />
            </label>

            <label class="toggle">
              <div>
                <span>{{ t('preschoolPreferencesSettingsPage.fields.assessmentAlerts') }}</span>
              </div>
              <ToggleSwitch v-model="preferences.assessmentAlertEnabled" />
            </label>

            <label class="toggle">
              <div>
                <span>{{ t('preschoolPreferencesSettingsPage.fields.healthAlerts') }}</span>
              </div>
              <ToggleSwitch v-model="preferences.healthAlertEnabled" />
            </label>

            <label class="toggle">
              <div>
                <span>{{ t('preschoolPreferencesSettingsPage.fields.enrollmentNotifications') }}</span>
              </div>
              <ToggleSwitch v-model="preferences.enrollmentNotificationEnabled" />
            </label>
          </div>
        </PreschoolSettingsSectionCard>

        <div class="flex items-center justify-end gap-3">
          <Button
            data-testid="save-preferences-settings"
            :label="t('preschoolPreferencesSettingsPage.actions.saveSettings')"
            :loading="saving"
            @click="handleSave"
          />
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
.toggle > div > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-select),
:deep(.p-select .p-select-label) {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
}

.preview-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 7.5rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
}
</style>
