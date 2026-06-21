<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getApiErrorMessage } from '@/services/api'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
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
  normalizeAssessmentCategory,
  normalizeAssessmentSettings,
  normalizeAssessmentWeight,
  normalizeGradeBand,
  normalizeReportPeriod,
  updateAssessmentCategory,
  updateAssessmentSettings,
  updateAssessmentWeights,
  updateGradeBand,
  updateReportPeriod,
} from '@/modules/preschool/services/api/preschoolAssessmentConfigurationApi'

defineOptions({
  name: 'PreschoolAssessmentSettingsPage',
})

const { t } = useLanguage()
const toast = useToast()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(true)
const errorMessage = ref('')

const savingSettings = ref(false)
const savingGradeBand = ref(false)
const savingCategory = ref(false)
const savingReportPeriod = ref(false)
const savingWeights = ref(false)

const assessmentSettings = ref(createDefaultAssessmentSettings())
const gradeBands = ref([])
const categories = ref([])
const reportPeriods = ref([])
const weightDrafts = ref([])

const gradeBandDialogVisible = ref(false)
const gradeBandDialogMode = ref('create')
const gradeBandDraft = ref(createEmptyGradeBandDraft())
const gradeBandErrors = ref({})

const categoryDialogVisible = ref(false)
const categoryDialogMode = ref('create')
const categoryDraft = ref(createEmptyCategoryDraft())
const categoryErrors = ref({})

const reportPeriodDialogVisible = ref(false)
const reportPeriodDialogMode = ref('create')
const reportPeriodDraft = ref(createEmptyReportPeriodDraft())
const reportPeriodErrors = ref({})

const activeCategories = computed(() => categories.value.filter((category) => category.isActive !== false && category.status !== 'archived'))
const weightTotal = computed(() => weightDrafts.value.reduce((total, item) => total + Number(item.percentage || 0), 0))
const weightingEnabled = computed(() => Boolean(assessmentSettings.value.weightingEnabled))
const academicYearOptions = computed(() => academicYears.value.map((year) => ({
  label: year.name || year.label || year.code || `#${year.id}`,
  value: String(year.id || ''),
})))
const filteredTermOptions = computed(() => {
  const yearId = String(reportPeriodDraft.value.academicYearId || '')
  return terms.value
    .filter((term) => !yearId || String(term.academicYearId || '') === yearId)
    .map((term) => ({
      label: term.name || term.label || term.code || `#${term.id}`,
      value: String(term.id || ''),
    }))
})

const statusBadgeClass = (status) => (String(status || '').toLowerCase() === 'archived'
  ? 'bg-slate-100 text-slate-600'
  : 'bg-emerald-100 text-emerald-700')

function createDefaultAssessmentSettings() {
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
    gradingScaleType: '',
    weightingEnabled: false,
    updatedAt: '',
  }
}

function createEmptyGradeBandDraft() {
  return {
    id: '',
    name: '',
    grade: '',
    minimumScore: 0,
    maximumScore: 100,
    color: '',
    sortOrder: 0,
    isPassing: false,
  }
}

function createEmptyCategoryDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  }
}

function createEmptyReportPeriodDraft() {
  return {
    id: '',
    academicYearId: '',
    termId: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: true,
  }
}

function syncWeightDrafts() {
  weightDrafts.value = activeCategories.value.map((category) => {
    const existing = reportWeightForCategory(category.id)
    return {
      categoryId: String(category.id || ''),
      categoryName: category.name,
      percentage: existing ? existing.percentage : 0,
    }
  })
}

function reportWeightForCategory(categoryId) {
  return weightDrafts.value.find((item) => String(item.categoryId) === String(categoryId))
}

function openCreateGradeBand() {
  gradeBandDialogMode.value = 'create'
  gradeBandDraft.value = createEmptyGradeBandDraft()
  gradeBandErrors.value = {}
  gradeBandDialogVisible.value = true
}

function openEditGradeBand(band) {
  gradeBandDialogMode.value = 'edit'
  gradeBandDraft.value = {
    id: band.id || '',
    name: band.name || band.grade || '',
    grade: band.grade || band.name || '',
    minimumScore: Number(band.minimumScore ?? 0),
    maximumScore: Number(band.maximumScore ?? 100),
    color: band.color || '',
    sortOrder: Number(band.sortOrder ?? 0),
    isPassing: Boolean(band.isPassing),
  }
  gradeBandErrors.value = {}
  gradeBandDialogVisible.value = true
}

function openCreateCategory() {
  categoryDialogMode.value = 'create'
  categoryDraft.value = createEmptyCategoryDraft()
  categoryErrors.value = {}
  categoryDialogVisible.value = true
}

function openEditCategory(category) {
  categoryDialogMode.value = 'edit'
  categoryDraft.value = {
    id: category.id || '',
    name: category.name || '',
    code: category.code || '',
    description: category.description || '',
    sortOrder: Number(category.sortOrder ?? 0),
    isActive: Boolean(category.isActive),
  }
  categoryErrors.value = {}
  categoryDialogVisible.value = true
}

function openCreateReportPeriod() {
  reportPeriodDialogMode.value = 'create'
  reportPeriodDraft.value = createEmptyReportPeriodDraft()
  if (academicYearOptions.value.length > 0) {
    reportPeriodDraft.value.academicYearId = academicYearOptions.value[0].value
  }
  reportPeriodErrors.value = {}
  reportPeriodDialogVisible.value = true
}

function openEditReportPeriod(period) {
  reportPeriodDialogMode.value = 'edit'
  reportPeriodDraft.value = {
    id: period.id || '',
    academicYearId: String(period.academicYearId || ''),
    termId: String(period.termId || ''),
    name: period.name || '',
    startDate: period.startDate || '',
    endDate: period.endDate || '',
    isActive: Boolean(period.isActive ?? period.status !== 'archived'),
  }
  reportPeriodErrors.value = {}
  reportPeriodDialogVisible.value = true
}

function formatDate(value) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB')
}

function academicYearLabel(id) {
  const year = academicYears.value.find((item) => String(item.id || '') === String(id || ''))
  return year?.name || year?.label || year?.code || '-'
}

function termLabel(id) {
  const term = terms.value.find((item) => String(item.id || '') === String(id || ''))
  return term?.name || term?.label || term?.code || '-'
}

function normalizeCurrentSettings(payload) {
  assessmentSettings.value = normalizeAssessmentSettings(payload)
}

function normalizeBandList(payload) {
  gradeBands.value = Array.isArray(payload) ? payload.map(normalizeGradeBand) : []
}

function normalizeCategoryList(payload) {
  categories.value = Array.isArray(payload) ? payload.map(normalizeAssessmentCategory) : []
  syncWeightDrafts()
}

function normalizeReportPeriodList(payload) {
  reportPeriods.value = Array.isArray(payload) ? payload.map(normalizeReportPeriod) : []
}

function normalizeWeightList(payload) {
  const items = Array.isArray(payload) ? payload.map(normalizeAssessmentWeight) : []
  const byCategory = new Map(items.map((item) => [String(item.categoryId || ''), item]))
  weightDrafts.value = activeCategories.value.map((category) => {
    const existing = byCategory.get(String(category.id || ''))
    return {
      categoryId: String(category.id || ''),
      categoryName: category.name,
      percentage: existing ? Number(existing.percentage ?? 0) : 0,
    }
  })
}

function validateGradeBandDraft() {
  const errors = {}
  const min = Number(gradeBandDraft.value.minimumScore)
  const max = Number(gradeBandDraft.value.maximumScore)

  if (!String(gradeBandDraft.value.grade || '').trim()) errors.grade = 'required'
  if (!(min >= 0 && min <= 100)) errors.minimumScore = 'range'
  if (!(max >= 0 && max <= 100)) errors.maximumScore = 'range'
  if (!errors.minimumScore && !errors.maximumScore && min > max) errors.maximumScore = 'range'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateCategoryDraft() {
  const errors = {}
  if (!String(categoryDraft.value.name || '').trim()) errors.name = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateReportPeriodDraft() {
  const errors = {}
  const start = reportPeriodDraft.value.startDate ? new Date(reportPeriodDraft.value.startDate) : null
  const end = reportPeriodDraft.value.endDate ? new Date(reportPeriodDraft.value.endDate) : null

  if (!String(reportPeriodDraft.value.academicYearId || '').trim()) errors.academicYearId = 'required'
  if (!String(reportPeriodDraft.value.name || '').trim()) errors.name = 'required'
  if (!reportPeriodDraft.value.startDate) errors.startDate = 'required'
  if (!reportPeriodDraft.value.endDate) errors.endDate = 'required'
  if (start && Number.isNaN(start.getTime())) errors.startDate = 'required'
  if (end && Number.isNaN(end.getTime())) errors.endDate = 'required'
  if (!errors.startDate && !errors.endDate && start && end && start.getTime() > end.getTime()) errors.endDate = 'range'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateWeightsDraft() {
  const errors = {}
  if (weightingEnabled.value && Number(weightTotal.value) !== 100) {
    errors.total = 'total'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  const results = await Promise.allSettled([
    fetchAssessmentSettings(),
    fetchGradingScale(),
    fetchAssessmentCategories(),
    fetchReportPeriods(),
    fetchAssessmentWeights(),
    loadAcademicLifecycle(),
  ])

  const [settingsResult, bandsResult, categoriesResult, periodsResult, weightsResult, lifecycleResult] = results
  const rejection = results.find((result) => result.status === 'rejected')

  if (settingsResult.status === 'fulfilled') normalizeCurrentSettings(settingsResult.value)
  if (bandsResult.status === 'fulfilled') normalizeBandList(bandsResult.value.items || bandsResult.value)
  if (categoriesResult.status === 'fulfilled') normalizeCategoryList(categoriesResult.value)
  if (periodsResult.status === 'fulfilled') normalizeReportPeriodList(periodsResult.value.items || periodsResult.value)
  if (weightsResult.status === 'fulfilled') normalizeWeightList(weightsResult.value.items || weightsResult.value)

  syncWeightDrafts()

  if (rejection) {
    errorMessage.value = getApiErrorMessage(rejection.reason, t('preschoolAssessmentSettingsPage.messages.loadFailed'))
  }

  if (lifecycleResult.status === 'rejected' && !errorMessage.value) {
    errorMessage.value = getApiErrorMessage(lifecycleResult.reason, t('preschoolAssessmentSettingsPage.messages.loadFailed'))
  }

  loading.value = false
}

async function saveAssessmentSettingsDraft() {
  savingSettings.value = true
  errorMessage.value = ''

  try {
    const saved = await updateAssessmentSettings(assessmentSettings.value)
    normalizeCurrentSettings(saved)
    toast.add({
      severity: 'success',
      summary: t('preschoolAssessmentSettingsPage.messages.settingsSaved'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
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

async function saveGradeBandDraft() {
  const result = validateGradeBandDraft()
  gradeBandErrors.value = result.errors
  if (!result.isValid) return

  savingGradeBand.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...gradeBandDraft.value,
      name: String(gradeBandDraft.value.name || gradeBandDraft.value.grade || '').trim() || String(gradeBandDraft.value.grade || '').trim(),
    }

    const saved = gradeBandDialogMode.value === 'edit'
      ? await updateGradeBand(gradeBandDraft.value.id, payload)
      : await createGradeBand(payload)

    const next = [...gradeBands.value.filter((band) => String(band.id) !== String(saved.id)), saved]
    gradeBands.value = next.sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    gradeBandDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: gradeBandDialogMode.value === 'edit'
        ? t('preschoolAssessmentSettingsPage.messages.gradeBandUpdated')
        : t('preschoolAssessmentSettingsPage.messages.gradeBandCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingGradeBand.value = false
  }
}

async function removeGradeBand(band) {
  if (!band?.id || !window.confirm(t('preschoolAssessmentSettingsPage.messages.deleteGradeBandConfirm'))) {
    return
  }

  savingGradeBand.value = true
  try {
    await deleteGradeBand(band.id)
    gradeBands.value = gradeBands.value.filter((item) => String(item.id) !== String(band.id))
    toast.add({
      severity: 'success',
      summary: t('preschoolAssessmentSettingsPage.messages.gradeBandDeleted'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
  } finally {
    savingGradeBand.value = false
  }
}

async function saveCategoryDraft() {
  const result = validateCategoryDraft()
  categoryErrors.value = result.errors
  if (!result.isValid) return

  savingCategory.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...categoryDraft.value,
      name: String(categoryDraft.value.name || '').trim(),
    }
    const saved = categoryDialogMode.value === 'edit'
      ? await updateAssessmentCategory(categoryDraft.value.id, payload)
      : await createAssessmentCategory(payload)

    categories.value = [
      ...categories.value.filter((item) => String(item.id) !== String(saved.id)),
      saved,
    ].sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    syncWeightDrafts()
    categoryDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: categoryDialogMode.value === 'edit'
        ? t('preschoolAssessmentSettingsPage.messages.categoryUpdated')
        : t('preschoolAssessmentSettingsPage.messages.categoryCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingCategory.value = false
  }
}

async function archiveCategoryRow(category) {
  if (!category?.id || !window.confirm(t('preschoolAssessmentSettingsPage.messages.archiveCategoryConfirm'))) {
    return
  }

  savingCategory.value = true
  try {
    const saved = await archiveAssessmentCategory(category.id)
    categories.value = categories.value.map((item) => (String(item.id) === String(saved.id) ? saved : item))
    syncWeightDrafts()
    toast.add({
      severity: 'success',
      summary: t('preschoolAssessmentSettingsPage.messages.categoryArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
  } finally {
    savingCategory.value = false
  }
}

async function saveReportPeriodDraft() {
  const result = validateReportPeriodDraft()
  reportPeriodErrors.value = result.errors
  if (!result.isValid) return

  savingReportPeriod.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...reportPeriodDraft.value,
      name: String(reportPeriodDraft.value.name || '').trim(),
    }
    const saved = reportPeriodDialogMode.value === 'edit'
      ? await updateReportPeriod(reportPeriodDraft.value.id, payload)
      : await createReportPeriod(payload)

    reportPeriods.value = [
      ...reportPeriods.value.filter((item) => String(item.id) !== String(saved.id)),
      saved,
    ].sort((left, right) => String(left.startDate || '').localeCompare(String(right.startDate || '')))
    reportPeriodDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: reportPeriodDialogMode.value === 'edit'
        ? t('preschoolAssessmentSettingsPage.messages.reportPeriodUpdated')
        : t('preschoolAssessmentSettingsPage.messages.reportPeriodCreated'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingReportPeriod.value = false
  }
}

async function archiveReportPeriodRow(period) {
  if (!period?.id || !window.confirm(t('preschoolAssessmentSettingsPage.messages.archiveReportPeriodConfirm'))) {
    return
  }

  savingReportPeriod.value = true
  try {
    const saved = await archiveReportPeriod(period.id)
    reportPeriods.value = reportPeriods.value.map((item) => (String(item.id) === String(saved.id) ? saved : item))
    toast.add({
      severity: 'success',
      summary: t('preschoolAssessmentSettingsPage.messages.reportPeriodArchived'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
  } finally {
    savingReportPeriod.value = false
  }
}

async function saveWeightsDraft() {
  const result = validateWeightsDraft()
  if (!result.isValid) {
    errorMessage.value = t('preschoolAssessmentSettingsPage.messages.weightTotalInvalid')
    return
  }

  savingWeights.value = true
  errorMessage.value = ''

  try {
    const saved = await updateAssessmentWeights(weightDrafts.value)
    normalizeWeightList(saved)
    toast.add({
      severity: 'success',
      summary: t('preschoolAssessmentSettingsPage.messages.weightsSaved'),
      life: 3000,
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, t('preschoolAssessmentSettingsPage.messages.saveFailed'))
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: errorMessage.value,
      life: 4000,
    })
  } finally {
    savingWeights.value = false
  }
}

function weightRowLabel(category) {
  return category.name || category.code || `#${category.id}`
}

function weightRowStatus(category) {
  return category.isActive ? t('preschoolAssessmentSettingsPage.statuses.active') : t('preschoolAssessmentSettingsPage.statuses.archived')
}

onMounted(loadPage)
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolAssessmentSettingsPage.pageTitle')"
        :subtitle="t('preschoolAssessmentSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="grid gap-4 md:grid-cols-2"
        data-testid="assessment-settings-loading"
      >
        <div
          v-for="index in 4"
          :key="index"
          class="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-4 h-6 w-48 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-3 h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
          <div class="mt-6 space-y-3">
            <div class="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div class="h-4 w-11/12 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="assessment-settings-error"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{{ errorMessage }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('common.states.retry')"
              @click="loadPage"
            />
          </div>
        </div>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAssessmentSettingsPage.sections.settings.eyebrow')"
          :title="t('preschoolAssessmentSettingsPage.sections.settings.title')"
          :subtitle="t('preschoolAssessmentSettingsPage.sections.settings.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <label class="field">
              <span>{{ t('preschoolAssessmentSettingsPage.fields.passingScore') }}</span>
              <InputNumber
                v-model="assessmentSettings.passingScore"
                :min="0"
                :max="100"
                class="input-number"
              />
            </label>

            <label class="toggle">
              <div>
                <span>{{ t('preschoolAssessmentSettingsPage.fields.weightingEnabled') }}</span>
                <p>{{ t('preschoolAssessmentSettingsPage.help.weightingEnabled') }}</p>
              </div>
              <ToggleSwitch v-model="assessmentSettings.weightingEnabled" />
            </label>
          </div>

          <div class="mt-5 flex justify-end">
            <Button
              variant="primary"
              :loading="savingSettings"
              :label="t('preschoolAssessmentSettingsPage.actions.saveSettings')"
              @click="saveAssessmentSettingsDraft"
            />
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAssessmentSettingsPage.sections.gradingScale.eyebrow')"
          :title="t('preschoolAssessmentSettingsPage.sections.gradingScale.title')"
          :subtitle="t('preschoolAssessmentSettingsPage.sections.gradingScale.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">
              {{ t('preschoolAssessmentSettingsPage.sections.gradingScale.description') }}
            </p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolAssessmentSettingsPage.actions.addGradeBand')"
              @click="openCreateGradeBand"
            />
          </div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.grade') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.minimumScore') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.maximumScore') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.passing') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.color') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="band in gradeBands" :key="band.id">
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ band.grade || band.name }}</td>
                    <td class="px-4 py-3">{{ band.minimumScore }}</td>
                    <td class="px-4 py-3">{{ band.maximumScore }}</td>
                    <td class="px-4 py-3">
                      <span :class="band.isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ band.isPassing ? t('preschoolAssessmentSettingsPage.statuses.passing') : t('preschoolAssessmentSettingsPage.statuses.notPassing') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span v-if="band.color" class="inline-flex items-center gap-2">
                        <span class="h-3.5 w-3.5 rounded-full border border-slate-200" :style="{ backgroundColor: band.color }" />
                        <span>{{ band.color }}</span>
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.edit')" @click="openEditGradeBand(band)" />
                        <Button variant="ghost" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.delete')" :loading="savingGradeBand" @click="removeGradeBand(band)" />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!gradeBands.length">
                    <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
                      {{ t('preschoolAssessmentSettingsPage.emptyStates.gradingScale') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAssessmentSettingsPage.sections.categories.eyebrow')"
          :title="t('preschoolAssessmentSettingsPage.sections.categories.title')"
          :subtitle="t('preschoolAssessmentSettingsPage.sections.categories.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">
              {{ t('preschoolAssessmentSettingsPage.sections.categories.description') }}
            </p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolAssessmentSettingsPage.actions.addCategory')"
              @click="openCreateCategory"
            />
          </div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.categoryName') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.categoryCode') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.description') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.sortOrder') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="category in categories" :key="category.id">
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ category.name }}</td>
                    <td class="px-4 py-3">{{ category.code || '-' }}</td>
                    <td class="px-4 py-3">{{ category.description || '-' }}</td>
                    <td class="px-4 py-3">
                      <span :class="category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ category.isActive ? t('preschoolAssessmentSettingsPage.statuses.active') : t('preschoolAssessmentSettingsPage.statuses.archived') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">{{ category.sortOrder }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.edit')" @click="openEditCategory(category)" />
                        <Button variant="ghost" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.archive')" :loading="savingCategory" :disabled="!category.isActive" @click="archiveCategoryRow(category)" />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!categories.length">
                    <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
                      {{ t('preschoolAssessmentSettingsPage.emptyStates.categories') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAssessmentSettingsPage.sections.reportPeriods.eyebrow')"
          :title="t('preschoolAssessmentSettingsPage.sections.reportPeriods.title')"
          :subtitle="t('preschoolAssessmentSettingsPage.sections.reportPeriods.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">
              {{ t('preschoolAssessmentSettingsPage.sections.reportPeriods.description') }}
            </p>
            <Button
              variant="outline"
              size="sm"
              :label="t('preschoolAssessmentSettingsPage.actions.addReportPeriod')"
              @click="openCreateReportPeriod"
            />
          </div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.name') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.academicYear') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.term') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.startDate') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.endDate') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="period in reportPeriods" :key="period.id">
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ period.name }}</td>
                    <td class="px-4 py-3">{{ period.academicYearName || academicYearLabel(period.academicYearId) }}</td>
                    <td class="px-4 py-3">{{ period.termName || termLabel(period.termId) }}</td>
                    <td class="px-4 py-3">{{ formatDate(period.startDate) }}</td>
                    <td class="px-4 py-3">{{ formatDate(period.endDate) }}</td>
                    <td class="px-4 py-3">
                      <span :class="statusBadgeClass(period.status)" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ period.isActive ? t('preschoolAssessmentSettingsPage.statuses.active') : t('preschoolAssessmentSettingsPage.statuses.archived') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.edit')" @click="openEditReportPeriod(period)" />
                        <Button variant="ghost" size="sm" :label="t('preschoolAssessmentSettingsPage.actions.archive')" :loading="savingReportPeriod" :disabled="!period.isActive" @click="archiveReportPeriodRow(period)" />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!reportPeriods.length">
                    <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
                      {{ t('preschoolAssessmentSettingsPage.emptyStates.reportPeriods') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PreschoolSettingsSectionCard>

        <PreschoolSettingsSectionCard
          :eyebrow="t('preschoolAssessmentSettingsPage.sections.weights.eyebrow')"
          :title="t('preschoolAssessmentSettingsPage.sections.weights.title')"
          :subtitle="t('preschoolAssessmentSettingsPage.sections.weights.subtitle')"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-600">
              {{ t('preschoolAssessmentSettingsPage.sections.weights.description') }}
            </p>
            <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {{ t('preschoolAssessmentSettingsPage.summary.totalWeight') }}: {{ weightTotal }}%
            </div>
          </div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-100 text-sm">
                <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.categoryName') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.status') }}</th>
                    <th class="px-4 py-3 font-semibold">{{ t('preschoolAssessmentSettingsPage.fields.percentage') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="(category, index) in activeCategories" :key="category.id">
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ weightRowLabel(category) }}</p>
                      <p v-if="category.code" class="text-xs text-slate-500">{{ category.code }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-3 py-1 text-xs font-semibold">
                        {{ weightRowStatus(category) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <InputNumber
                        v-model="weightDrafts[index].percentage"
                        :min="0"
                        :max="100"
                        :use-grouping="false"
                        input-class="w-full"
                        class="input-number w-full"
                      />
                    </td>
                  </tr>
                  <tr v-if="!activeCategories.length">
                    <td colspan="3" class="px-4 py-8 text-center text-sm text-slate-500">
                      {{ t('preschoolAssessmentSettingsPage.emptyStates.weights') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p v-if="weightingEnabled && weightTotal !== 100" class="mt-3 text-sm font-medium text-rose-600">
            {{ t('preschoolAssessmentSettingsPage.messages.weightTotalInvalid') }}
          </p>

          <div class="mt-5 flex justify-end">
            <Button
              variant="primary"
              :loading="savingWeights"
              :label="t('preschoolAssessmentSettingsPage.actions.saveWeights')"
              @click="saveWeightsDraft"
            />
          </div>
        </PreschoolSettingsSectionCard>
      </div>
    </div>

    <Dialog
      v-model:visible="gradeBandDialogVisible"
      modal
      :closable="false"
      :style="{ width: 'min(92vw, 42rem)' }"
    >
      <template #header>
        <div>
          <h4 class="text-lg font-semibold text-slate-900">
            {{ gradeBandDialogMode === 'edit' ? t('preschoolAssessmentSettingsPage.dialogs.gradeBand.editTitle') : t('preschoolAssessmentSettingsPage.dialogs.gradeBand.createTitle') }}
          </h4>
          <p class="text-sm text-slate-500">{{ t('preschoolAssessmentSettingsPage.dialogs.gradeBand.subtitle') }}</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
        <label class="field md:col-span-2">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.grade') }}</span>
          <InputText v-model="gradeBandDraft.grade" class="w-full" />
          <small v-if="gradeBandErrors.grade" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${gradeBandErrors.grade}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.minimumScore') }}</span>
          <InputNumber v-model="gradeBandDraft.minimumScore" :min="0" :max="100" class="input-number" />
          <small v-if="gradeBandErrors.minimumScore" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${gradeBandErrors.minimumScore}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.maximumScore') }}</span>
          <InputNumber v-model="gradeBandDraft.maximumScore" :min="0" :max="100" class="input-number" />
          <small v-if="gradeBandErrors.maximumScore" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${gradeBandErrors.maximumScore}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.color') }}</span>
          <InputText v-model="gradeBandDraft.color" class="w-full" placeholder="#10b981" />
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.sortOrder') }}</span>
          <InputNumber v-model="gradeBandDraft.sortOrder" :min="0" class="input-number" />
        </label>

        <label class="toggle md:col-span-2">
          <div>
            <span>{{ t('preschoolAssessmentSettingsPage.fields.passing') }}</span>
            <p>{{ t('preschoolAssessmentSettingsPage.help.passing') }}</p>
          </div>
          <ToggleSwitch v-model="gradeBandDraft.isPassing" />
        </label>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" :label="t('preschoolAssessmentSettingsPage.actions.cancel')" @click="gradeBandDialogVisible = false" />
          <Button variant="primary" :loading="savingGradeBand" :label="t('preschoolAssessmentSettingsPage.actions.save')" @click="saveGradeBandDraft" />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="categoryDialogVisible"
      modal
      :closable="false"
      :style="{ width: 'min(92vw, 42rem)' }"
    >
      <template #header>
        <div>
          <h4 class="text-lg font-semibold text-slate-900">
            {{ categoryDialogMode === 'edit' ? t('preschoolAssessmentSettingsPage.dialogs.category.editTitle') : t('preschoolAssessmentSettingsPage.dialogs.category.createTitle') }}
          </h4>
          <p class="text-sm text-slate-500">{{ t('preschoolAssessmentSettingsPage.dialogs.category.subtitle') }}</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
        <label class="field md:col-span-2">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.categoryName') }}</span>
          <InputText v-model="categoryDraft.name" class="w-full" />
          <small v-if="categoryErrors.name" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${categoryErrors.name}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.categoryCode') }}</span>
          <InputText v-model="categoryDraft.code" class="w-full" />
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.sortOrder') }}</span>
          <InputNumber v-model="categoryDraft.sortOrder" :min="0" class="input-number" />
        </label>

        <label class="field md:col-span-2">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.description') }}</span>
          <Textarea v-model="categoryDraft.description" rows="3" auto-resize class="w-full" />
        </label>

        <label class="toggle md:col-span-2">
          <div>
            <span>{{ t('preschoolAssessmentSettingsPage.fields.status') }}</span>
            <p>{{ t('preschoolAssessmentSettingsPage.help.categoryStatus') }}</p>
          </div>
          <ToggleSwitch v-model="categoryDraft.isActive" />
        </label>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" :label="t('preschoolAssessmentSettingsPage.actions.cancel')" @click="categoryDialogVisible = false" />
          <Button variant="primary" :loading="savingCategory" :label="t('preschoolAssessmentSettingsPage.actions.save')" @click="saveCategoryDraft" />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="reportPeriodDialogVisible"
      modal
      :closable="false"
      :style="{ width: 'min(92vw, 44rem)' }"
    >
      <template #header>
        <div>
          <h4 class="text-lg font-semibold text-slate-900">
            {{ reportPeriodDialogMode === 'edit' ? t('preschoolAssessmentSettingsPage.dialogs.reportPeriod.editTitle') : t('preschoolAssessmentSettingsPage.dialogs.reportPeriod.createTitle') }}
          </h4>
          <p class="text-sm text-slate-500">{{ t('preschoolAssessmentSettingsPage.dialogs.reportPeriod.subtitle') }}</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
        <label class="field md:col-span-2">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.name') }}</span>
          <InputText v-model="reportPeriodDraft.name" class="w-full" />
          <small v-if="reportPeriodErrors.name" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${reportPeriodErrors.name}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.academicYear') }}</span>
          <Select
            v-model="reportPeriodDraft.academicYearId"
            :options="academicYearOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small v-if="reportPeriodErrors.academicYearId" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${reportPeriodErrors.academicYearId}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.term') }}</span>
          <Select
            v-model="reportPeriodDraft.termId"
            :options="filteredTermOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.startDate') }}</span>
          <input v-model="reportPeriodDraft.startDate" type="date" class="date-input">
          <small v-if="reportPeriodErrors.startDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${reportPeriodErrors.startDate}`) }}</small>
        </label>

        <label class="field">
          <span>{{ t('preschoolAssessmentSettingsPage.fields.endDate') }}</span>
          <input v-model="reportPeriodDraft.endDate" type="date" class="date-input">
          <small v-if="reportPeriodErrors.endDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolAssessmentSettingsPage.validation.${reportPeriodErrors.endDate}`) }}</small>
        </label>

        <label class="toggle md:col-span-2">
          <div>
            <span>{{ t('preschoolAssessmentSettingsPage.fields.status') }}</span>
            <p>{{ t('preschoolAssessmentSettingsPage.help.reportPeriodStatus') }}</p>
          </div>
          <ToggleSwitch v-model="reportPeriodDraft.isActive" />
        </label>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" :label="t('preschoolAssessmentSettingsPage.actions.cancel')" @click="reportPeriodDialogVisible = false" />
          <Button variant="primary" :loading="savingReportPeriod" :label="t('preschoolAssessmentSettingsPage.actions.save')" @click="saveReportPeriodDraft" />
        </div>
      </template>
    </Dialog>
  </MainLayout>
</template>

<style scoped>
.field,
.toggle {
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
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
}

.toggle p {
  font-size: 0.8rem;
  color: #64748b;
}

.input-number,
:deep(.input-number .p-inputnumber-input),
.date-input,
.field :deep(.p-inputtext),
.field :deep(.p-select),
.field :deep(.p-textarea) {
  width: 100%;
}

.date-input,
:deep(.input-number .p-inputnumber-input),
:deep(.p-inputtext),
:deep(.p-select .p-select-label),
:deep(.p-textarea) {
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
  font-size: 0.875rem;
}

.date-input {
  min-height: 2.75rem;
}
</style>
