<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getApiErrorMessage } from '@/services/api'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
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
  normalizeHealthCheckCategory,
  normalizeHealthSettings,
  normalizeIncidentCategory,
  normalizeSeverityLevel,
  normalizeVaccinationCategory,
  updateHealthCheckCategory,
  updateHealthSettings,
  updateIncidentCategory,
  updateSeverityLevel,
  updateVaccinationCategory,
} from '@/modules/preschool/services/api/preschoolHealthConfigurationApi'

defineOptions({
  name: 'PreschoolHealthSettingsPage',
})

const { t } = useLanguage()
const toast = useToast()

const loading = ref(true)
const errorMessage = ref('')

const savingSettings = ref(false)
const savingSeverityLevel = ref(false)
const savingIncidentCategory = ref(false)
const savingVaccinationCategory = ref(false)
const savingHealthCheckCategory = ref(false)

const settingsDraft = ref(createDefaultHealthSettings())
const settingsErrors = ref({})

const severityLevels = ref([])
const severityFormVisible = ref(false)
const severityMode = ref('create')
const severityDraft = ref(createSeverityLevelDraft())
const severityErrors = ref({})

const incidentCategories = ref([])
const incidentFormVisible = ref(false)
const incidentMode = ref('create')
const incidentDraft = ref(createIncidentCategoryDraft())
const incidentErrors = ref({})

const vaccinationCategories = ref([])
const vaccinationFormVisible = ref(false)
const vaccinationMode = ref('create')
const vaccinationDraft = ref(createVaccinationCategoryDraft())
const vaccinationErrors = ref({})

const healthCheckCategories = ref([])
const healthCheckFormVisible = ref(false)
const healthCheckMode = ref('create')
const healthCheckDraft = ref(createHealthCheckCategoryDraft())
const healthCheckErrors = ref({})

const sortedSeverityLevels = computed(() => sortRows(severityLevels.value))
const sortedIncidentCategories = computed(() => sortRows(incidentCategories.value))
const sortedVaccinationCategories = computed(() => sortRows(vaccinationCategories.value))
const sortedHealthCheckCategories = computed(() => sortRows(healthCheckCategories.value))

const severityReferenceOptions = computed(() => {
  if (sortedSeverityLevels.value.length > 0) {
    return sortedSeverityLevels.value.map((level) => ({
      label: formatReferenceLabel(level.name, level.code),
      value: level.code || level.name || '',
    }))
  }

  return [
    { label: t('preschoolHealthPage.severity.low'), value: 'low' },
    { label: t('preschoolHealthPage.severity.medium'), value: 'medium' },
    { label: t('preschoolHealthPage.severity.high'), value: 'high' },
    { label: t('preschoolHealthPage.severity.critical'), value: 'critical' },
  ]
})

function createDefaultHealthSettings() {
  return {
    id: '',
    criticalAlertEnabled: true,
    guardianNotificationEnabled: true,
    teacherNotificationEnabled: true,
    adminNotificationEnabled: true,
    medicationReminderEnabled: true,
    vaccinationReminderEnabled: true,
    overdueVaccinationAlertDays: 30,
    medicationReminderMinutesBefore: 30,
    updatedAt: '',
  }
}

function createSeverityLevelDraft() {
  return {
    id: '',
    name: '',
    code: '',
    priority: 0,
    color: '',
    requiresAcknowledgment: false,
    triggersNotification: true,
    isActive: true,
    sortOrder: 0,
  }
}

function createIncidentCategoryDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    defaultSeverityCode: '',
    isActive: true,
    sortOrder: 0,
  }
}

function createVaccinationCategoryDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    recommendedAgeMonths: '',
    isRequired: false,
    isActive: true,
    sortOrder: 0,
  }
}

function createHealthCheckCategoryDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  }
}

function sortRows(rows = []) {
  return [...rows].sort((left, right) => {
    const leftOrder = Number(left.sortOrder ?? left.priority ?? 0)
    const rightOrder = Number(right.sortOrder ?? right.priority ?? 0)
    if (leftOrder !== rightOrder) return leftOrder - rightOrder

    return String(left.name || '').localeCompare(String(right.name || ''))
  })
}

function formatReferenceLabel(name, code) {
  const cleanedName = String(name || '').trim()
  const cleanedCode = String(code || '').trim()

  if (cleanedName && cleanedCode && cleanedName !== cleanedCode) {
    return `${cleanedName} (${cleanedCode})`
  }

  return cleanedName || cleanedCode || '-'
}

function formatMonths(value) {
  if (value === null || value === undefined || value === '') return '-'
  return `${value} ${Number(value) === 1 ? 'month' : 'months'}`
}

function formatBoolean(value) {
  return value ? t('common.enabled') : t('common.disabled')
}

function formatStatus(isActive) {
  return isActive ? t('common.status.active') : t('common.status.archived')
}

function validationMessage(code) {
  if (!code) return ''
  return t(`preschoolHealthSettingsPage.validation.${code}`)
}

function severityLabel(code) {
  const match = sortedSeverityLevels.value.find((level) => String(level.code || '').trim() === String(code || '').trim())
  if (match) {
    return formatReferenceLabel(match.name, match.code)
  }
  return String(code || '').trim() || '-'
}

function openSeverityCreate() {
  severityMode.value = 'create'
  severityDraft.value = createSeverityLevelDraft()
  severityErrors.value = {}
  severityFormVisible.value = true
}

function openSeverityEdit(level) {
  if (!level) return

  severityMode.value = 'edit'
  severityDraft.value = {
    id: level.id || '',
    name: level.name || '',
    code: level.code || '',
    priority: Number(level.priority ?? level.sortOrder ?? 0),
    color: level.color || '',
    requiresAcknowledgment: Boolean(level.requiresAcknowledgment),
    triggersNotification: Boolean(level.triggersNotification),
    isActive: Boolean(level.isActive ?? level.status !== 'archived'),
    sortOrder: Number(level.sortOrder ?? level.priority ?? 0),
  }
  severityErrors.value = {}
  severityFormVisible.value = true
}

function openIncidentCreate() {
  incidentMode.value = 'create'
  incidentDraft.value = createIncidentCategoryDraft()
  incidentErrors.value = {}
  incidentFormVisible.value = true
}

function openIncidentEdit(category) {
  if (!category) return

  incidentMode.value = 'edit'
  incidentDraft.value = {
    id: category.id || '',
    name: category.name || '',
    code: category.code || '',
    description: category.description || '',
    defaultSeverityCode: category.defaultSeverityCode || '',
    isActive: Boolean(category.isActive ?? category.status !== 'archived'),
    sortOrder: Number(category.sortOrder ?? 0),
  }
  incidentErrors.value = {}
  incidentFormVisible.value = true
}

function openVaccinationCreate() {
  vaccinationMode.value = 'create'
  vaccinationDraft.value = createVaccinationCategoryDraft()
  vaccinationErrors.value = {}
  vaccinationFormVisible.value = true
}

function openVaccinationEdit(category) {
  if (!category) return

  vaccinationMode.value = 'edit'
  vaccinationDraft.value = {
    id: category.id || '',
    name: category.name || '',
    code: category.code || '',
    description: category.description || '',
    recommendedAgeMonths: category.recommendedAgeMonths || '',
    isRequired: Boolean(category.isRequired),
    isActive: Boolean(category.isActive ?? category.status !== 'archived'),
    sortOrder: Number(category.sortOrder ?? 0),
  }
  vaccinationErrors.value = {}
  vaccinationFormVisible.value = true
}

function openHealthCheckCreate() {
  healthCheckMode.value = 'create'
  healthCheckDraft.value = createHealthCheckCategoryDraft()
  healthCheckErrors.value = {}
  healthCheckFormVisible.value = true
}

function openHealthCheckEdit(category) {
  if (!category) return

  healthCheckMode.value = 'edit'
  healthCheckDraft.value = {
    id: category.id || '',
    name: category.name || '',
    code: category.code || '',
    description: category.description || '',
    isActive: Boolean(category.isActive ?? category.status !== 'archived'),
    sortOrder: Number(category.sortOrder ?? 0),
  }
  healthCheckErrors.value = {}
  healthCheckFormVisible.value = true
}

function validateHealthSettingsDraft() {
  const errors = {}

  if (!(Number(settingsDraft.value.overdueVaccinationAlertDays) >= 0)) {
    errors.overdueVaccinationAlertDays = 'positive'
  }

  if (!(Number(settingsDraft.value.medicationReminderMinutesBefore) >= 0)) {
    errors.medicationReminderMinutesBefore = 'positive'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateSeverityLevelDraft() {
  const errors = {}

  if (!String(severityDraft.value.name || '').trim()) errors.name = 'required'
  if (!String(severityDraft.value.code || '').trim()) errors.code = 'required'
  if (!(Number(severityDraft.value.priority) >= 0)) errors.priority = 'positive'
  if (!(Number(severityDraft.value.sortOrder) >= 0)) errors.sortOrder = 'positive'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateIncidentCategoryDraft() {
  const errors = {}

  if (!String(incidentDraft.value.name || '').trim()) errors.name = 'required'
  if (!(Number(incidentDraft.value.sortOrder) >= 0)) errors.sortOrder = 'positive'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateVaccinationCategoryDraft() {
  const errors = {}

  if (!String(vaccinationDraft.value.name || '').trim()) errors.name = 'required'
  if (String(vaccinationDraft.value.recommendedAgeMonths || '').trim() !== '' && !(Number(vaccinationDraft.value.recommendedAgeMonths) >= 0)) {
    errors.recommendedAgeMonths = 'positive'
  }
  if (!(Number(vaccinationDraft.value.sortOrder) >= 0)) errors.sortOrder = 'positive'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateHealthCheckCategoryDraft() {
  const errors = {}

  if (!String(healthCheckDraft.value.name || '').trim()) errors.name = 'required'
  if (!(Number(healthCheckDraft.value.sortOrder) >= 0)) errors.sortOrder = 'positive'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  const results = await Promise.allSettled([
    fetchHealthSettings(),
    fetchSeverityLevels(),
    fetchIncidentCategories(),
    fetchVaccinationCategories(),
    fetchHealthCheckCategories(),
  ])

  const [settingsResult, severityResult, incidentResult, vaccinationResult, checkResult] = results
  const rejection = results.find((result) => result.status === 'rejected')

  if (settingsResult.status === 'fulfilled') {
    settingsDraft.value = normalizeHealthSettings(settingsResult.value)
  }

  if (severityResult.status === 'fulfilled') {
    severityLevels.value = sortRows((severityResult.value || []).map(normalizeSeverityLevel))
  }

  if (incidentResult.status === 'fulfilled') {
    incidentCategories.value = sortRows((incidentResult.value || []).map(normalizeIncidentCategory))
  }

  if (vaccinationResult.status === 'fulfilled') {
    vaccinationCategories.value = sortRows((vaccinationResult.value || []).map(normalizeVaccinationCategory))
  }

  if (checkResult.status === 'fulfilled') {
    healthCheckCategories.value = sortRows((checkResult.value || []).map(normalizeHealthCheckCategory))
  }

  if (rejection) {
    errorMessage.value = getApiErrorMessage(rejection.reason, t('preschoolHealthSettingsPage.messages.loadFailed'))
  }

  loading.value = false
}

async function saveHealthSettingsDraft() {
  const result = validateHealthSettingsDraft()
  settingsErrors.value = result.errors

  if (!result.isValid) {
    errorMessage.value = t('preschoolHealthSettingsPage.messages.validationFailed')
    return
  }

  savingSettings.value = true
  errorMessage.value = ''

  try {
    const saved = await updateHealthSettings(settingsDraft.value)
    settingsDraft.value = normalizeHealthSettings(saved)
    toast.add({
      severity: 'success',
      summary: t('preschoolHealthSettingsPage.messages.settingsSaved'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingSettings.value = false
  }
}

async function saveSeverityLevelDraft() {
  const result = validateSeverityLevelDraft()
  severityErrors.value = result.errors

  if (!result.isValid) {
    errorMessage.value = t('preschoolHealthSettingsPage.messages.validationFailed')
    return
  }

  savingSeverityLevel.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...severityDraft.value,
      name: String(severityDraft.value.name || '').trim(),
      code: String(severityDraft.value.code || '').trim(),
    }
    const saved = severityMode.value === 'edit'
      ? await updateSeverityLevel(severityDraft.value.id, payload)
      : await createSeverityLevel(payload)

    severityLevels.value = sortRows([
      ...severityLevels.value.filter((level) => String(level.id) !== String(saved.id)),
      normalizeSeverityLevel(saved),
    ])
    severityFormVisible.value = false
    toast.add({
      severity: 'success',
      summary: severityMode.value === 'edit'
        ? t('preschoolHealthSettingsPage.messages.severityLevelUpdated')
        : t('preschoolHealthSettingsPage.messages.severityLevelCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingSeverityLevel.value = false
  }
}

async function archiveSeverityRow(level) {
  if (!level?.id || !window.confirm(t('preschoolHealthSettingsPage.messages.archiveSeverityConfirm'))) {
    return
  }

  savingSeverityLevel.value = true
  errorMessage.value = ''

  try {
    const saved = await archiveSeverityLevel(level.id)
    severityLevels.value = sortRows([
      ...severityLevels.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeSeverityLevel(saved),
    ])
    toast.add({
      severity: 'success',
      summary: t('preschoolHealthSettingsPage.messages.severityLevelArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
  } finally {
    savingSeverityLevel.value = false
  }
}

async function saveIncidentCategoryDraft() {
  const result = validateIncidentCategoryDraft()
  incidentErrors.value = result.errors

  if (!result.isValid) {
    errorMessage.value = t('preschoolHealthSettingsPage.messages.validationFailed')
    return
  }

  savingIncidentCategory.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...incidentDraft.value,
      name: String(incidentDraft.value.name || '').trim(),
      code: String(incidentDraft.value.code || '').trim(),
    }
    const saved = incidentMode.value === 'edit'
      ? await updateIncidentCategory(incidentDraft.value.id, payload)
      : await createIncidentCategory(payload)

    incidentCategories.value = sortRows([
      ...incidentCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeIncidentCategory(saved),
    ])
    incidentFormVisible.value = false
    toast.add({
      severity: 'success',
      summary: incidentMode.value === 'edit'
        ? t('preschoolHealthSettingsPage.messages.incidentCategoryUpdated')
        : t('preschoolHealthSettingsPage.messages.incidentCategoryCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingIncidentCategory.value = false
  }
}

async function archiveIncidentRow(category) {
  if (!category?.id || !window.confirm(t('preschoolHealthSettingsPage.messages.archiveIncidentConfirm'))) {
    return
  }

  savingIncidentCategory.value = true
  errorMessage.value = ''

  try {
    const saved = await archiveIncidentCategory(category.id)
    incidentCategories.value = sortRows([
      ...incidentCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeIncidentCategory(saved),
    ])
    toast.add({
      severity: 'success',
      summary: t('preschoolHealthSettingsPage.messages.incidentCategoryArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
  } finally {
    savingIncidentCategory.value = false
  }
}

async function saveVaccinationCategoryDraft() {
  const result = validateVaccinationCategoryDraft()
  vaccinationErrors.value = result.errors

  if (!result.isValid) {
    errorMessage.value = t('preschoolHealthSettingsPage.messages.validationFailed')
    return
  }

  savingVaccinationCategory.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...vaccinationDraft.value,
      name: String(vaccinationDraft.value.name || '').trim(),
      code: String(vaccinationDraft.value.code || '').trim(),
    }
    const saved = vaccinationMode.value === 'edit'
      ? await updateVaccinationCategory(vaccinationDraft.value.id, payload)
      : await createVaccinationCategory(payload)

    vaccinationCategories.value = sortRows([
      ...vaccinationCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeVaccinationCategory(saved),
    ])
    vaccinationFormVisible.value = false
    toast.add({
      severity: 'success',
      summary: vaccinationMode.value === 'edit'
        ? t('preschoolHealthSettingsPage.messages.vaccinationCategoryUpdated')
        : t('preschoolHealthSettingsPage.messages.vaccinationCategoryCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingVaccinationCategory.value = false
  }
}

async function archiveVaccinationRow(category) {
  if (!category?.id || !window.confirm(t('preschoolHealthSettingsPage.messages.archiveVaccinationConfirm'))) {
    return
  }

  savingVaccinationCategory.value = true
  errorMessage.value = ''

  try {
    const saved = await archiveVaccinationCategory(category.id)
    vaccinationCategories.value = sortRows([
      ...vaccinationCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeVaccinationCategory(saved),
    ])
    toast.add({
      severity: 'success',
      summary: t('preschoolHealthSettingsPage.messages.vaccinationCategoryArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
  } finally {
    savingVaccinationCategory.value = false
  }
}

async function saveHealthCheckCategoryDraft() {
  const result = validateHealthCheckCategoryDraft()
  healthCheckErrors.value = result.errors

  if (!result.isValid) {
    errorMessage.value = t('preschoolHealthSettingsPage.messages.validationFailed')
    return
  }

  savingHealthCheckCategory.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...healthCheckDraft.value,
      name: String(healthCheckDraft.value.name || '').trim(),
      code: String(healthCheckDraft.value.code || '').trim(),
    }
    const saved = healthCheckMode.value === 'edit'
      ? await updateHealthCheckCategory(healthCheckDraft.value.id, payload)
      : await createHealthCheckCategory(payload)

    healthCheckCategories.value = sortRows([
      ...healthCheckCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeHealthCheckCategory(saved),
    ])
    healthCheckFormVisible.value = false
    toast.add({
      severity: 'success',
      summary: healthCheckMode.value === 'edit'
        ? t('preschoolHealthSettingsPage.messages.healthCheckCategoryUpdated')
        : t('preschoolHealthSettingsPage.messages.healthCheckCategoryCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingHealthCheckCategory.value = false
  }
}

async function archiveHealthCheckRow(category) {
  if (!category?.id || !window.confirm(t('preschoolHealthSettingsPage.messages.archiveHealthCheckConfirm'))) {
    return
  }

  savingHealthCheckCategory.value = true
  errorMessage.value = ''

  try {
    const saved = await archiveHealthCheckCategory(category.id)
    healthCheckCategories.value = sortRows([
      ...healthCheckCategories.value.filter((item) => String(item.id) !== String(saved.id)),
      normalizeHealthCheckCategory(saved),
    ])
    toast.add({
      severity: 'success',
      summary: t('preschoolHealthSettingsPage.messages.healthCheckCategoryArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolHealthSettingsPage.messages.saveFailed'))
  } finally {
    savingHealthCheckCategory.value = false
  }
}

onMounted(loadPage)
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolHealthSettingsPage.pageTitle')"
        :subtitle="t('preschoolHealthSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
        data-testid="health-settings-loading"
      >
        <div class="h-4 w-44 animate-pulse rounded-full bg-slate-100" />
        <div class="mt-4 h-4 w-80 animate-pulse rounded-full bg-slate-100" />
      </div>

      <div v-else class="space-y-6">
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="health-settings-error"
        >
          {{ errorMessage }}
        </div>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolHealthSettingsPage.sections.settings.eyebrow')"
          :title="t('preschoolHealthSettingsPage.sections.settings.title')"
          :subtitle="t('preschoolHealthSettingsPage.sections.settings.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label class="field field--toggle">
              <input v-model="settingsDraft.criticalAlertEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.criticalAlertsEnabled') }}</span>
            </label>
            <label class="field field--toggle">
              <input v-model="settingsDraft.guardianNotificationEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.guardianNotifications') }}</span>
            </label>
            <label class="field field--toggle">
              <input v-model="settingsDraft.teacherNotificationEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.teacherNotifications') }}</span>
            </label>
            <label class="field field--toggle">
              <input v-model="settingsDraft.adminNotificationEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.adminNotifications') }}</span>
            </label>
            <label class="field field--toggle">
              <input v-model="settingsDraft.medicationReminderEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.medicationReminders') }}</span>
            </label>
            <label class="field field--toggle">
              <input v-model="settingsDraft.vaccinationReminderEnabled" type="checkbox">
              <span>{{ t('preschoolHealthSettingsPage.fields.vaccinationReminders') }}</span>
            </label>
            <label class="field">
              <span>{{ t('preschoolHealthSettingsPage.fields.overdueVaccinationAlertDays') }}</span>
              <input v-model.number="settingsDraft.overdueVaccinationAlertDays" type="number" min="0">
              <small v-if="settingsErrors.overdueVaccinationAlertDays" class="error-text">
                {{ validationMessage(settingsErrors.overdueVaccinationAlertDays) }}
              </small>
            </label>
            <label class="field">
              <span>{{ t('preschoolHealthSettingsPage.fields.medicationReminderMinutesBefore') }}</span>
              <input v-model.number="settingsDraft.medicationReminderMinutesBefore" type="number" min="0">
              <small v-if="settingsErrors.medicationReminderMinutesBefore" class="error-text">
                {{ validationMessage(settingsErrors.medicationReminderMinutesBefore) }}
              </small>
            </label>
          </div>

          <div class="mt-5 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              :loading="savingSettings"
              :label="t('preschoolHealthSettingsPage.actions.saveSettings')"
              @click="saveHealthSettingsDraft"
            />
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolHealthSettingsPage.sections.severityLevels.eyebrow')"
          :title="t('preschoolHealthSettingsPage.sections.severityLevels.title')"
          :subtitle="t('preschoolHealthSettingsPage.sections.severityLevels.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">{{ t('preschoolHealthSettingsPage.sections.severityLevels.description') }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolHealthSettingsPage.actions.createSeverityLevel')"
              @click="openSeverityCreate"
            />
          </div>

          <div v-if="severityFormVisible" class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="health-severity-form">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.name') }}</span>
                <input v-model="severityDraft.name" type="text">
                <small v-if="severityErrors.name" class="error-text">{{ validationMessage(severityErrors.name) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.code') }}</span>
                <input v-model="severityDraft.code" type="text">
                <small v-if="severityErrors.code" class="error-text">{{ validationMessage(severityErrors.code) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.priority') }}</span>
                <input v-model.number="severityDraft.priority" type="number" min="0">
                <small v-if="severityErrors.priority" class="error-text">{{ validationMessage(severityErrors.priority) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.color') }}</span>
                <input v-model="severityDraft.color" type="text">
              </label>
              <label class="field field--toggle">
                <input v-model="severityDraft.requiresAcknowledgment" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.requiresAcknowledgment') }}</span>
              </label>
              <label class="field field--toggle">
                <input v-model="severityDraft.triggersNotification" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.triggersNotification') }}</span>
              </label>
              <label class="field field--toggle">
                <input v-model="severityDraft.isActive" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.active') }}</span>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.sortOrder') }}</span>
                <input v-model.number="severityDraft.sortOrder" type="number" min="0">
                <small v-if="severityErrors.sortOrder" class="error-text">{{ validationMessage(severityErrors.sortOrder) }}</small>
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                :loading="savingSeverityLevel"
                :label="severityMode === 'edit' ? t('preschoolHealthSettingsPage.actions.update') : t('preschoolHealthSettingsPage.actions.save')"
                @click="saveSeverityLevelDraft"
              />
              <Button
                variant="ghost"
                size="sm"
                :label="t('common.cancel')"
                @click="severityFormVisible = false"
              />
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="health-severity-table">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.name') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.code') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.priority') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.color') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.requiresAcknowledgment') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.triggersNotification') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr
                    v-for="level in sortedSeverityLevels"
                    :key="level.id"
                    :data-testid="`health-severity-row-${level.id}`"
                  >
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ level.name }}</p>
                      <p v-if="level.description" class="text-xs text-slate-500">{{ level.description }}</p>
                    </td>
                    <td class="px-4 py-3">{{ level.code || '-' }}</td>
                    <td class="px-4 py-3">{{ level.priority }}</td>
                    <td class="px-4 py-3">
                      <span v-if="level.color" class="inline-flex items-center gap-2">
                        <span class="inline-block h-3 w-3 rounded-full border border-slate-300" :style="{ backgroundColor: level.color }" />
                        {{ level.color }}
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td class="px-4 py-3">{{ formatBoolean(level.requiresAcknowledgment) }}</td>
                    <td class="px-4 py-3">{{ formatBoolean(level.triggersNotification) }}</td>
                    <td class="px-4 py-3">
                      <span :class="level.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ formatStatus(level.isActive) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('common.edit')" @click="openSeverityEdit(level)" />
                        <Button
                          variant="ghost"
                          size="sm"
                          :label="t('preschoolHealthSettingsPage.actions.archive')"
                          :disabled="!level.isActive"
                          @click="archiveSeverityRow(level)"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!sortedSeverityLevels.length">
                    <td colspan="8" class="px-4 py-6 text-center text-sm text-slate-500">
                      {{ t('preschoolHealthSettingsPage.emptyStates.severityLevels') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolHealthSettingsPage.sections.incidentCategories.eyebrow')"
          :title="t('preschoolHealthSettingsPage.sections.incidentCategories.title')"
          :subtitle="t('preschoolHealthSettingsPage.sections.incidentCategories.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">{{ t('preschoolHealthSettingsPage.sections.incidentCategories.description') }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolHealthSettingsPage.actions.createIncidentCategory')"
              @click="openIncidentCreate"
            />
          </div>

          <div v-if="incidentFormVisible" class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="health-incident-form">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.name') }}</span>
                <input v-model="incidentDraft.name" type="text">
                <small v-if="incidentErrors.name" class="error-text">{{ validationMessage(incidentErrors.name) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.code') }}</span>
                <input v-model="incidentDraft.code" type="text">
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.defaultSeverity') }}</span>
                <select v-model="incidentDraft.defaultSeverityCode">
                  <option value="">{{ t('common.empty') }}</option>
                  <option v-for="option in severityReferenceOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.sortOrder') }}</span>
                <input v-model.number="incidentDraft.sortOrder" type="number" min="0">
                <small v-if="incidentErrors.sortOrder" class="error-text">{{ validationMessage(incidentErrors.sortOrder) }}</small>
              </label>
              <label class="field field--toggle">
                <input v-model="incidentDraft.isActive" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.active') }}</span>
              </label>
              <label class="field field--full">
                <span>{{ t('preschoolHealthSettingsPage.fields.description') }}</span>
                <textarea v-model="incidentDraft.description" rows="2" />
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                :loading="savingIncidentCategory"
                :label="incidentMode === 'edit' ? t('preschoolHealthSettingsPage.actions.update') : t('preschoolHealthSettingsPage.actions.save')"
                @click="saveIncidentCategoryDraft"
              />
              <Button variant="ghost" size="sm" :label="t('common.cancel')" @click="incidentFormVisible = false" />
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="health-incident-table">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.name') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.code') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.defaultSeverity') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr
                    v-for="category in sortedIncidentCategories"
                    :key="category.id"
                    :data-testid="`health-incident-row-${category.id}`"
                  >
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ category.name }}</p>
                      <p v-if="category.description" class="text-xs text-slate-500">{{ category.description }}</p>
                    </td>
                    <td class="px-4 py-3">{{ category.code || '-' }}</td>
                    <td class="px-4 py-3">{{ severityLabel(category.defaultSeverityCode) }}</td>
                    <td class="px-4 py-3">
                      <span :class="category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ formatStatus(category.isActive) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('common.edit')" @click="openIncidentEdit(category)" />
                        <Button
                          variant="ghost"
                          size="sm"
                          :label="t('preschoolHealthSettingsPage.actions.archive')"
                          :disabled="!category.isActive"
                          @click="archiveIncidentRow(category)"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!sortedIncidentCategories.length">
                    <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500">
                      {{ t('preschoolHealthSettingsPage.emptyStates.incidentCategories') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolHealthSettingsPage.sections.vaccinationCategories.eyebrow')"
          :title="t('preschoolHealthSettingsPage.sections.vaccinationCategories.title')"
          :subtitle="t('preschoolHealthSettingsPage.sections.vaccinationCategories.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">{{ t('preschoolHealthSettingsPage.sections.vaccinationCategories.description') }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolHealthSettingsPage.actions.createVaccinationCategory')"
              @click="openVaccinationCreate"
            />
          </div>

          <div v-if="vaccinationFormVisible" class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="health-vaccination-form">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.name') }}</span>
                <input v-model="vaccinationDraft.name" type="text">
                <small v-if="vaccinationErrors.name" class="error-text">{{ validationMessage(vaccinationErrors.name) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.code') }}</span>
                <input v-model="vaccinationDraft.code" type="text">
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.recommendedAgeMonths') }}</span>
                <input v-model.number="vaccinationDraft.recommendedAgeMonths" type="number" min="0">
                <small v-if="vaccinationErrors.recommendedAgeMonths" class="error-text">{{ validationMessage(vaccinationErrors.recommendedAgeMonths) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.sortOrder') }}</span>
                <input v-model.number="vaccinationDraft.sortOrder" type="number" min="0">
                <small v-if="vaccinationErrors.sortOrder" class="error-text">{{ validationMessage(vaccinationErrors.sortOrder) }}</small>
              </label>
              <label class="field field--toggle">
                <input v-model="vaccinationDraft.isRequired" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.required') }}</span>
              </label>
              <label class="field field--toggle">
                <input v-model="vaccinationDraft.isActive" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.active') }}</span>
              </label>
              <label class="field field--full">
                <span>{{ t('preschoolHealthSettingsPage.fields.description') }}</span>
                <textarea v-model="vaccinationDraft.description" rows="2" />
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                :loading="savingVaccinationCategory"
                :label="vaccinationMode === 'edit' ? t('preschoolHealthSettingsPage.actions.update') : t('preschoolHealthSettingsPage.actions.save')"
                @click="saveVaccinationCategoryDraft"
              />
              <Button variant="ghost" size="sm" :label="t('common.cancel')" @click="vaccinationFormVisible = false" />
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="health-vaccination-table">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.name') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.code') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.recommendedAge') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.required') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr
                    v-for="category in sortedVaccinationCategories"
                    :key="category.id"
                    :data-testid="`health-vaccination-row-${category.id}`"
                  >
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ category.name }}</p>
                      <p v-if="category.description" class="text-xs text-slate-500">{{ category.description }}</p>
                    </td>
                    <td class="px-4 py-3">{{ category.code || '-' }}</td>
                    <td class="px-4 py-3">{{ formatMonths(category.recommendedAgeMonths) }}</td>
                    <td class="px-4 py-3">{{ formatBoolean(category.isRequired) }}</td>
                    <td class="px-4 py-3">
                      <span :class="category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ formatStatus(category.isActive) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('common.edit')" @click="openVaccinationEdit(category)" />
                        <Button
                          variant="ghost"
                          size="sm"
                          :label="t('preschoolHealthSettingsPage.actions.archive')"
                          :disabled="!category.isActive"
                          @click="archiveVaccinationRow(category)"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!sortedVaccinationCategories.length">
                    <td colspan="6" class="px-4 py-6 text-center text-sm text-slate-500">
                      {{ t('preschoolHealthSettingsPage.emptyStates.vaccinationCategories') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolHealthSettingsPage.sections.healthCheckCategories.eyebrow')"
          :title="t('preschoolHealthSettingsPage.sections.healthCheckCategories.title')"
          :subtitle="t('preschoolHealthSettingsPage.sections.healthCheckCategories.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">{{ t('preschoolHealthSettingsPage.sections.healthCheckCategories.description') }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolHealthSettingsPage.actions.createHealthCheckCategory')"
              @click="openHealthCheckCreate"
            />
          </div>

          <div v-if="healthCheckFormVisible" class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-testid="health-check-form">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.name') }}</span>
                <input v-model="healthCheckDraft.name" type="text">
                <small v-if="healthCheckErrors.name" class="error-text">{{ validationMessage(healthCheckErrors.name) }}</small>
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.code') }}</span>
                <input v-model="healthCheckDraft.code" type="text">
              </label>
              <label class="field">
                <span>{{ t('preschoolHealthSettingsPage.fields.sortOrder') }}</span>
                <input v-model.number="healthCheckDraft.sortOrder" type="number" min="0">
                <small v-if="healthCheckErrors.sortOrder" class="error-text">{{ validationMessage(healthCheckErrors.sortOrder) }}</small>
              </label>
              <label class="field field--toggle">
                <input v-model="healthCheckDraft.isActive" type="checkbox">
                <span>{{ t('preschoolHealthSettingsPage.fields.active') }}</span>
              </label>
              <label class="field field--full">
                <span>{{ t('preschoolHealthSettingsPage.fields.description') }}</span>
                <textarea v-model="healthCheckDraft.description" rows="2" />
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                :loading="savingHealthCheckCategory"
                :label="healthCheckMode === 'edit' ? t('preschoolHealthSettingsPage.actions.update') : t('preschoolHealthSettingsPage.actions.save')"
                @click="saveHealthCheckCategoryDraft"
              />
              <Button variant="ghost" size="sm" :label="t('common.cancel')" @click="healthCheckFormVisible = false" />
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="health-check-table">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.name') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.code') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolHealthSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr
                    v-for="category in sortedHealthCheckCategories"
                    :key="category.id"
                    :data-testid="`health-health-check-row-${category.id}`"
                  >
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ category.name }}</p>
                      <p v-if="category.description" class="text-xs text-slate-500">{{ category.description }}</p>
                    </td>
                    <td class="px-4 py-3">{{ category.code || '-' }}</td>
                    <td class="px-4 py-3">
                      <span :class="category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ formatStatus(category.isActive) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('common.edit')" @click="openHealthCheckEdit(category)" />
                        <Button
                          variant="ghost"
                          size="sm"
                          :label="t('preschoolHealthSettingsPage.actions.archive')"
                          :disabled="!category.isActive"
                          @click="archiveHealthCheckRow(category)"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!sortedHealthCheckCategories.length">
                    <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">
                      {{ t('preschoolHealthSettingsPage.emptyStates.healthCheckCategories') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field--toggle {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}

.field input[type='text'],
.field input[type='number'],
.field select,
.field textarea {
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  padding: 0.7rem 0.85rem;
  background: #fff;
  width: 100%;
  color: #0f172a;
}

.field input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
}

.error-text {
  color: #e11d48;
  font-size: 0.78rem;
  font-weight: 600;
}
</style>
