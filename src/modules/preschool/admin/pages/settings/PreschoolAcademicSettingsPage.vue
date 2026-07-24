<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
import PreschoolAcademicYearDialog from '@/modules/preschool/shared/components/settings/PreschoolAcademicYearDialog.vue'
import PreschoolAcademicYearManager from '@/modules/preschool/shared/components/settings/PreschoolAcademicYearManager.vue'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import PreschoolTermDialog from '@/modules/preschool/shared/components/settings/PreschoolTermDialog.vue'
import PreschoolTermManager from '@/modules/preschool/shared/components/settings/PreschoolTermManager.vue'
import { formatLifecycleDate } from './utils/preschoolSettingsHelpers'

defineOptions({
  name: 'PreschoolAcademicSettingsPage',
})

const { t } = useLanguage()
const {
  academicYears,
  terms,
  currentContext,
  currentAcademicYear,
  currentTerm,
  loading,
  saving,
  loadAcademicLifecycle,
  createYear,
  updateYear,
  activateYear,
  closeYear,
  archiveYear,
  createTerm,
  updateTerm,
  activateTerm,
  closeTerm,
  archiveTerm,
} = usePreschoolAcademicLifecycle()

const errorMessage = ref('')
const yearDialogVisible = ref(false)
const yearDialogMode = ref('create')
const yearDraft = ref(createAcademicYearDraft())
const yearDraftErrors = ref({})
const editingYearIndex = ref(-1)

const termDialogVisible = ref(false)
const termDialogMode = ref('create')
const termDraft = ref(createTermDraft())
const termDraftErrors = ref({})
const editingTermIndex = ref(-1)

const statusOptions = computed(() => [
  { label: t('preschoolAcademicSettingsPage.statuses.active'), value: 'active' },
  { label: t('preschoolAcademicSettingsPage.statuses.closed'), value: 'closed' },
  { label: t('preschoolAcademicSettingsPage.statuses.archived'), value: 'archived' },
])

const academicYearOptions = computed(() => academicYears.value.map((year) => ({
  label: year.name || year.label || year.code || t('preschoolAcademicSettingsPage.emptyStates.yearFallback'),
  value: String(year.id || ''),
})))

const activeAcademicYearRecord = computed(() => currentAcademicYear.value || academicYears.value[0] || null)
const activeTermRecord = computed(() => currentTerm.value || terms.value[0] || null)

function createAcademicYearDraft() {
  return {
    id: '',
    code: '',
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    status: 'active',
    isCurrent: false,
  }
}

function createTermDraft() {
  return {
    id: '',
    academicYearId: '',
    code: '',
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    status: 'active',
    isCurrent: false,
  }
}

function formatDate(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start === '—' && end === '—') {
    return '—'
  }

  return `${start} - ${end}`
}

function validateAcademicYearDraft(draft) {
  const errors = {}
  if (!String(draft.name || '').trim()) errors.name = 'required'
  if (!draft.startDate) errors.startDate = 'required'
  if (!draft.endDate) errors.endDate = 'required'

  if (draft.startDate && draft.endDate) {
    const start = new Date(draft.startDate)
    const end = new Date(draft.endDate)
    if (Number.isNaN(start.getTime())) errors.startDate = 'required'
    if (Number.isNaN(end.getTime())) errors.endDate = 'required'
    if (!errors.startDate && !errors.endDate && start.getTime() >= end.getTime()) {
      errors.endDate = 'range'
    }
  }

  if (!String(draft.status || '').trim()) errors.status = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateTermDraft(draft) {
  const errors = {}
  const selectedYear = academicYears.value.find((year) => String(year.id) === String(draft.academicYearId || ''))

  if (!String(draft.academicYearId || '').trim()) errors.academicYearId = 'required'
  if (!String(draft.name || '').trim()) errors.name = 'required'
  if (!draft.startDate) errors.startDate = 'required'
  if (!draft.endDate) errors.endDate = 'required'

  if (draft.startDate && draft.endDate) {
    const start = new Date(draft.startDate)
    const end = new Date(draft.endDate)

    if (Number.isNaN(start.getTime())) errors.startDate = 'required'
    if (Number.isNaN(end.getTime())) errors.endDate = 'required'

    if (!errors.startDate && !errors.endDate && start.getTime() >= end.getTime()) {
      errors.endDate = 'range'
    }

    if (selectedYear) {
      const yearStart = selectedYear.startDate ? new Date(selectedYear.startDate) : null
      const yearEnd = selectedYear.endDate ? new Date(selectedYear.endDate) : null

      if (yearStart && !Number.isNaN(yearStart.getTime()) && start.getTime() < yearStart.getTime()) {
        errors.startDate = 'outsideYear'
      }

      if (yearEnd && !Number.isNaN(yearEnd.getTime()) && end.getTime() > yearEnd.getTime()) {
        errors.endDate = 'outsideYear'
      }
    }
  }

  if (!String(draft.status || '').trim()) errors.status = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function openCreateYear() {
  yearDialogMode.value = 'create'
  yearDraft.value = createAcademicYearDraft()
  yearDraftErrors.value = {}
  yearDialogVisible.value = true
  editingYearIndex.value = -1
}

function openEditYear(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return

  yearDialogMode.value = 'edit'
  editingYearIndex.value = index
  yearDraft.value = {
    id: nextYear.id || '',
    code: nextYear.code || '',
    name: nextYear.name || nextYear.label || '',
    description: nextYear.description || nextYear.notes || '',
    startDate: nextYear.startDate ? new Date(nextYear.startDate) : null,
    endDate: nextYear.endDate ? new Date(nextYear.endDate) : null,
    status: nextYear.status || 'active',
    isCurrent: Boolean(nextYear.isCurrent),
  }
  yearDraftErrors.value = {}
  yearDialogVisible.value = true
}

function closeYearDialog() {
  yearDialogVisible.value = false
  yearDraftErrors.value = {}
  editingYearIndex.value = -1
}

async function saveYearDraft() {
  const result = validateAcademicYearDraft(yearDraft.value)
  yearDraftErrors.value = result.errors
  if (!result.isValid) return

  errorMessage.value = ''

  const payload = {
    code: String(yearDraft.value.code || '').trim(),
    name: String(yearDraft.value.name || '').trim(),
    description: String(yearDraft.value.description || '').trim(),
    start_date: formatLifecycleDate(yearDraft.value.startDate),
    end_date: formatLifecycleDate(yearDraft.value.endDate),
    status: yearDraft.value.status,
    is_current: Boolean(yearDraft.value.isCurrent),
  }

  try {
    if (yearDialogMode.value === 'edit' && editingYearIndex.value > -1) {
      await updateYear(yearDraft.value.id, payload)
    } else {
      await createYear(payload)
    }

    closeYearDialog()
  } catch (error) {
    const validationErrors = mapBackendValidationErrors(error, {
      code: 'code',
      name: 'name',
      description: 'description',
      start_date: 'startDate',
      end_date: 'endDate',
      status: 'status',
      is_current: 'isCurrent',
    })

    if (Object.keys(validationErrors).length > 0) {
      yearDraftErrors.value = validationErrors
      return
    }

    errorMessage.value = error?.response?.data?.message || error?.message || 'Unable to save academic year.'
  }
}

async function activateYearRow(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return
  await activateYear(nextYear.id)
}

async function closeYearRow(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return
  await closeYear(nextYear.id)
}

async function archiveYearRow(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return
  await archiveYear(nextYear.id)
}

function openCreateTerm() {
  termDialogMode.value = 'create'
  termDraft.value = createTermDraft()
  if (activeAcademicYearRecord.value) {
    termDraft.value.academicYearId = String(activeAcademicYearRecord.value.id || '')
  }
  termDraftErrors.value = {}
  termDialogVisible.value = true
  editingTermIndex.value = -1
}

function openEditTerm(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return

  termDialogMode.value = 'edit'
  editingTermIndex.value = index
  termDraft.value = {
    id: nextTerm.id || '',
    academicYearId: String(nextTerm.academicYearId || ''),
    code: nextTerm.code || '',
    name: nextTerm.name || '',
    description: nextTerm.description || nextTerm.notes || '',
    startDate: nextTerm.startDate ? new Date(nextTerm.startDate) : null,
    endDate: nextTerm.endDate ? new Date(nextTerm.endDate) : null,
    status: nextTerm.status || 'active',
    isCurrent: Boolean(nextTerm.isCurrent),
  }
  termDraftErrors.value = {}
  termDialogVisible.value = true
}

function closeTermDialog() {
  termDialogVisible.value = false
  termDraftErrors.value = {}
  editingTermIndex.value = -1
}

async function saveTermDraft() {
  const result = validateTermDraft(termDraft.value)
  termDraftErrors.value = result.errors
  if (!result.isValid) return

  errorMessage.value = ''

  const payload = {
    academic_year_id: termDraft.value.academicYearId,
    code: String(termDraft.value.code || '').trim(),
    name: String(termDraft.value.name || '').trim(),
    description: String(termDraft.value.description || '').trim(),
    start_date: formatLifecycleDate(termDraft.value.startDate),
    end_date: formatLifecycleDate(termDraft.value.endDate),
    status: termDraft.value.status,
    is_current: Boolean(termDraft.value.isCurrent),
  }

  try {
    if (termDialogMode.value === 'edit' && editingTermIndex.value > -1) {
      await updateTerm(termDraft.value.id, payload)
    } else {
      await createTerm(payload)
    }

    closeTermDialog()
  } catch (error) {
    const validationErrors = mapBackendValidationErrors(error, {
      academic_year_id: 'academicYearId',
      code: 'code',
      name: 'name',
      description: 'description',
      start_date: 'startDate',
      end_date: 'endDate',
      status: 'status',
      is_current: 'isCurrent',
      sort_order: 'sortOrder',
    })

    if (Object.keys(validationErrors).length > 0) {
      termDraftErrors.value = validationErrors
      return
    }

    errorMessage.value = error?.response?.data?.message || error?.message || 'Unable to save term.'
  }
}

async function activateTermRow(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return
  await activateTerm(nextTerm.id)
}

async function closeTermRow(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return
  await closeTerm(nextTerm.id)
}

async function archiveTermRow(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return
  await archiveTerm(nextTerm.id)
}

function statusLabel(record) {
  if (!record) return t('preschoolAcademicSettingsPage.emptyStates.noAcademicYears')
  const key = record.isCurrent ? 'current' : String(record.status || 'active').toLowerCase()
  return t(`preschoolAcademicSettingsPage.statuses.${key}`)
}

function mapBackendValidationErrors(error, fieldMap = {}) {
  const responseErrors = error?.validationErrors
    || error?.response?.data?.data?.errors
    || error?.response?.data?.errors
    || {}

  const mapped = {}

  Object.entries(responseErrors).forEach(([field, messages]) => {
    const value = Array.isArray(messages) ? messages[0] : messages
    const mappedField = fieldMap[field] || field
    mapped[mappedField] = String(value || '')
  })

  return mapped
}

onMounted(async () => {
  errorMessage.value = ''

  try {
    await loadAcademicLifecycle()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolAcademicSettingsPage.messages.loadFailed')
  }
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolAcademicSettingsPage.pageTitle')"
        :subtitle="t('preschoolAcademicSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="grid gap-4 md:grid-cols-2"
        data-testid="academic-settings-loading"
      >
        <div
          v-for="index in 2"
          :key="index"
          class="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-4 h-6 w-48 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-3 h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
          <div class="mt-6 space-y-3">
            <div class="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div class="h-4 w-11/12 animate-pulse rounded-full bg-slate-100" />
            <div class="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="space-y-6"
      >
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="academic-settings-error"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{{ errorMessage }}</p>
            <Button
              variant="outline"
              size="sm"
              :label="t('common.states.retry')"
              @click="loadAcademicLifecycle"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <PreschoolSettingsSectionCard
            :eyebrow="t('preschoolAcademicSettingsPage.activeCards.academicYear.eyebrow')"
            :title="t('preschoolAcademicSettingsPage.activeCards.academicYear.title')"
            :subtitle="t('preschoolAcademicSettingsPage.activeCards.academicYear.subtitle')"
          >
            <div class="space-y-2">
              <p class="text-lg font-semibold text-slate-900">
                {{ activeAcademicYearRecord ? activeAcademicYearRecord.name || activeAcademicYearRecord.label || activeAcademicYearRecord.code : t('preschoolAcademicSettingsPage.emptyStates.noAcademicYears') }}
              </p>
              <p class="text-sm text-slate-600">
                {{ activeAcademicYearRecord ? formatDateRange(activeAcademicYearRecord.startDate, activeAcademicYearRecord.endDate) : t('preschoolAcademicSettingsPage.emptyStates.noAcademicYears') }}
              </p>
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                :class="activeAcademicYearRecord ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ statusLabel(activeAcademicYearRecord) }}
              </span>
            </div>
          </PreschoolSettingsSectionCard>

          <PreschoolSettingsSectionCard
            :eyebrow="t('preschoolAcademicSettingsPage.activeCards.term.eyebrow')"
            :title="t('preschoolAcademicSettingsPage.activeCards.term.title')"
            :subtitle="t('preschoolAcademicSettingsPage.activeCards.term.subtitle')"
          >
            <div class="space-y-2">
              <p class="text-lg font-semibold text-slate-900">
                {{ activeTermRecord ? activeTermRecord.name : t('preschoolAcademicSettingsPage.emptyStates.noTerms') }}
              </p>
              <p class="text-sm text-slate-600">
                {{ activeTermRecord ? formatDateRange(activeTermRecord.startDate, activeTermRecord.endDate) : t('preschoolAcademicSettingsPage.emptyStates.noTerms') }}
              </p>
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                :class="activeTermRecord ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ statusLabel(activeTermRecord) }}
              </span>
            </div>
          </PreschoolSettingsSectionCard>
        </div>

        <div
          v-if="!academicYears.length && !terms.length"
          class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600"
        >
          {{ t('preschoolAcademicSettingsPage.emptyStates.dashboard') }}
        </div>

        <PreschoolAcademicYearManager
          :academic-years="academicYears"
          :current-context="currentContext"
          :loading="loading"
          :saving="saving"
          @open-add="openCreateYear"
          @open-edit="openEditYear"
          @activate="activateYearRow"
          @close="closeYearRow"
          @archive="archiveYearRow"
        />

        <PreschoolTermManager
          :terms="terms"
          :loading="loading"
          :saving="saving"
          @open-add="openCreateTerm"
          @open-edit="openEditTerm"
          @activate="activateTermRow"
          @close="closeTermRow"
          @archive="archiveTermRow"
        />
      </div>

      <PreschoolAcademicYearDialog
        :visible="yearDialogVisible"
        :title="yearDialogMode === 'edit'
          ? t('preschoolAcademicSettingsPage.dialogs.academicYear.editTitle')
          : t('preschoolAcademicSettingsPage.dialogs.academicYear.createTitle')"
        :draft="yearDraft"
        :status-options="statusOptions"
        :errors="yearDraftErrors"
        @cancel="closeYearDialog"
        @save="saveYearDraft"
        @update:draft="yearDraft = $event"
      />

      <PreschoolTermDialog
        :visible="termDialogVisible"
        :title="termDialogMode === 'edit'
          ? t('preschoolAcademicSettingsPage.dialogs.term.editTitle')
          : t('preschoolAcademicSettingsPage.dialogs.term.createTitle')"
        :draft="termDraft"
        :year-options="academicYearOptions"
        :status-options="statusOptions"
        :errors="termDraftErrors"
        @cancel="closeTermDialog"
        @save="saveTermDraft"
        @update:draft="termDraft = $event"
      />
    </div>
  </MainLayout>
</template>
