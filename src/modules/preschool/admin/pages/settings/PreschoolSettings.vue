<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  createEmptyAcademicYearDraft,
  createDefaultClassConfiguration,
  createEmptyTermDraft,
  usePreschoolSettings,
  validatePreschoolAcademicYearDraft,
  validatePreschoolTermDraft,
} from '@/modules/preschool/composables/usePreschoolSettings'
import PreschoolAssessmentConfiguration from '@/modules/preschool/shared/components/settings/PreschoolAssessmentConfiguration.vue'
import PreschoolAcademicYearDialog from '@/modules/preschool/shared/components/settings/PreschoolAcademicYearDialog.vue'
import PreschoolAcademicYearManager from '@/modules/preschool/shared/components/settings/PreschoolAcademicYearManager.vue'
import PreschoolAttendanceConfiguration from '@/modules/preschool/shared/components/settings/PreschoolAttendanceConfiguration.vue'
import PreschoolClassConfiguration from '@/modules/preschool/shared/components/settings/PreschoolClassConfiguration.vue'
import PreschoolEnrollmentConfiguration from '@/modules/preschool/shared/components/settings/PreschoolEnrollmentConfiguration.vue'
import PreschoolPaymentConfiguration from '@/modules/preschool/shared/components/settings/PreschoolPaymentConfiguration.vue'
import PreschoolScheduleConfiguration from '@/modules/preschool/shared/components/settings/PreschoolScheduleConfiguration.vue'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import PreschoolTermDialog from '@/modules/preschool/shared/components/settings/PreschoolTermDialog.vue'
import PreschoolTermManager from '@/modules/preschool/shared/components/settings/PreschoolTermManager.vue'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
import {
  toDateOrNull,
  formatLifecycleDate,
  formatPreviewDate,
  formatLastSavedLabel,
  buildOperationalState,
  buildStatusOptions,
  buildClassLevelOptions,
  buildTeacherOptions,
  buildAbsenceRuleOptions,
  buildPaymentCycleOptions,
  buildLateFeeRuleOptions,
  buildAssessmentCycleOptions,
  buildFinalizationModeOptions,
  buildWeeklyModeOptions,
  buildPlanningWindowOptions,
  buildEnrollmentCycleOptions,
  buildTransferPolicyOptions,
  buildCapacityReviewOptions,
  buildAcademicYearOptions,
  syncBackboneAcademicDraft as performSyncBackboneAcademicDraft,
} from './utils/preschoolSettingsHelpers'

// Parent owns the full settings snapshot so the reusable section components can
// stay presentation-focused and preserve a single validation source of truth.
// This page is the admin-only academic backbone for Preschool reporting,
// assignments, attendance, schedules, and assessment defaults.
defineOptions({
  name: 'PreschoolSettings',
})

const { t, language } = useLanguage()
const {
  settings,
  validationErrors,
  lastSavedAt,
  issueCount,
  hasValidationIssues,
  loading,
  saving,
  reportPeriods,
  loadSettings,
  loadReportPeriods,
  saveSettings,
  resetSettings,
  addClassConfiguration,
  updateClassConfiguration,
  removeClassConfiguration,
} = usePreschoolSettings()

const {
  academicYears,
  terms,
  currentContext,
  loadAcademicLifecycle,
  createYear,
  updateYear,
  activateYear,
  closeYear,
  createTerm: createLifecycleTerm,
  updateTerm: updateLifecycleTerm,
  activateTerm: activateLifecycleTerm,
  closeTerm: closeLifecycleTerm,
} = usePreschoolAcademicLifecycle()

const yearDialogVisible = ref(false)
const yearDialogMode = ref('create')
const yearDraft = ref(createEmptyAcademicYearDraft())
const yearDraftErrors = ref({})
const editingYearIndex = ref(-1)

const termDialogVisible = ref(false)
const termDialogMode = ref('create')
const termDraft = ref(createEmptyTermDraft())
const termDraftErrors = ref({})
const editingTermIndex = ref(-1)

const statusOptions = computed(() => buildStatusOptions(t))
const classLevelOptions = computed(() => buildClassLevelOptions(t))
const teacherOptions = computed(() => buildTeacherOptions(t))
const absenceRuleOptions = computed(() => buildAbsenceRuleOptions(t))
const paymentCycleOptions = computed(() => buildPaymentCycleOptions(t))
const lateFeeRuleOptions = computed(() => buildLateFeeRuleOptions(t))
const assessmentCycleOptions = computed(() => buildAssessmentCycleOptions(t))
const finalizationModeOptions = computed(() => buildFinalizationModeOptions(t))
const weeklyModeOptions = computed(() => buildWeeklyModeOptions(t))
const planningWindowOptions = computed(() => buildPlanningWindowOptions(t))
const enrollmentCycleOptions = computed(() => buildEnrollmentCycleOptions(t))
const transferPolicyOptions = computed(() => buildTransferPolicyOptions(t))
const capacityReviewOptions = computed(() => buildCapacityReviewOptions(t))

const operationalState = computed(() => buildOperationalState(hasValidationIssues.value, lastSavedAt.value, t))
const lastSavedLabel = computed(() => formatLastSavedLabel(lastSavedAt.value, language.value, t))

const reportPeriodPreview = computed(() => reportPeriods.value.slice(0, 3))
const academicYearOptions = computed(() => buildAcademicYearOptions(academicYears.value))
const currentAcademicYearRecord = computed(() => academicYears.value.find((year) => year.isCurrent) || academicYears.value[0] || null)
const currentLifecycleTerms = computed(() => {
  const yearId = currentAcademicYearRecord.value?.id
  return terms.value.filter((term) => String(term.academicYearId || '') === String(yearId || ''))
})

function syncBackboneAcademicDraft() {
  performSyncBackboneAcademicDraft(settings.value, currentAcademicYearRecord.value, currentLifecycleTerms.value)
}

function openCreateYear() {
  yearDialogMode.value = 'create'
  yearDialogVisible.value = true
  yearDraft.value = createEmptyAcademicYearDraft()
  yearDraftErrors.value = {}
  editingYearIndex.value = -1
}

function openEditYear(index) {
  const nextYear = academicYears.value[index]

  if (!nextYear) return

  yearDialogMode.value = 'edit'
  yearDialogVisible.value = true
  editingYearIndex.value = index
  yearDraft.value = {
    ...createEmptyAcademicYearDraft(),
    ...nextYear,
    startDate: toDateOrNull(nextYear.startDate),
    endDate: toDateOrNull(nextYear.endDate),
  }
  yearDraftErrors.value = {}
}

function closeYearDialog() {
  yearDialogVisible.value = false
  yearDraftErrors.value = {}
}

async function saveYearDraft() {
  const result = validatePreschoolAcademicYearDraft(yearDraft.value)
  yearDraftErrors.value = result.errors

  if (!result.isValid) {
    return
  }

  const payload = {
    code: yearDraft.value.code,
    label: yearDraft.value.label,
    start_date: formatLifecycleDate(yearDraft.value.startDate),
    end_date: formatLifecycleDate(yearDraft.value.endDate),
    status: yearDraft.value.status,
    is_current: Boolean(yearDraft.value.isCurrent),
    notes: yearDraft.value.notes,
  }

  if (yearDialogMode.value === 'edit' && editingYearIndex.value > -1) {
    await updateYear(yearDraft.value.id, payload)
  } else {
    await createYear(payload)
  }

  syncBackboneAcademicDraft()
  closeYearDialog()
}

async function activateYearRow(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return

  await activateYear(nextYear.id)
  syncBackboneAcademicDraft()
}

async function closeYearRow(index) {
  const nextYear = academicYears.value[index]
  if (!nextYear) return

  await closeYear(nextYear.id)
  syncBackboneAcademicDraft()
}

function openCreateTerm() {
  termDialogMode.value = 'create'
  termDialogVisible.value = true
  termDraft.value = createEmptyTermDraft()
  if (currentAcademicYearRecord.value) {
    termDraft.value.academicYearId = currentAcademicYearRecord.value.id
  }
  termDraftErrors.value = {}
  editingTermIndex.value = -1
}

function openEditTerm(index) {
  const nextTerm = terms.value[index]

  if (!nextTerm) return

  termDialogMode.value = 'edit'
  termDialogVisible.value = true
  editingTermIndex.value = index
  termDraft.value = {
    ...createEmptyTermDraft(),
    ...nextTerm,
    academicYearId: nextTerm.academicYearId,
    startDate: toDateOrNull(nextTerm.startDate),
    endDate: toDateOrNull(nextTerm.endDate),
  }
  termDraftErrors.value = {}
}

function closeTermDialog() {
  termDialogVisible.value = false
  termDraftErrors.value = {}
}

async function saveTermDraft() {
  const result = validatePreschoolTermDraft(termDraft.value)
  termDraftErrors.value = result.errors

  if (!result.isValid) {
    return
  }

  const payload = {
    academic_year_id: termDraft.value.academicYearId,
    code: termDraft.value.code,
    name: termDraft.value.name,
    start_date: formatLifecycleDate(termDraft.value.startDate),
    end_date: formatLifecycleDate(termDraft.value.endDate),
    status: termDraft.value.status,
    is_current: Boolean(termDraft.value.isCurrent),
    sort_order: Number(termDraft.value.sortOrder ?? 0),
    notes: termDraft.value.notes,
  }

  if (termDialogMode.value === 'edit' && editingTermIndex.value > -1) {
    await updateLifecycleTerm(termDraft.value.id, payload)
  } else {
    await createLifecycleTerm(payload)
  }

  syncBackboneAcademicDraft()
  closeTermDialog()
}

async function activateTermRow(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return

  await activateLifecycleTerm(nextTerm.id)
  syncBackboneAcademicDraft()
}

async function closeTermRow(index) {
  const nextTerm = terms.value[index]
  if (!nextTerm) return

  await closeLifecycleTerm(nextTerm.id)
  syncBackboneAcademicDraft()
}

function handleReset() {
  resetSettings()
  yearDialogVisible.value = false
  yearDraftErrors.value = {}
  editingYearIndex.value = -1
  termDialogVisible.value = false
  termDraftErrors.value = {}
  editingTermIndex.value = -1
}

function addClass() {
  addClassConfiguration(createDefaultClassConfiguration(`class-${settings.value.classConfigurations.length + 1}`))
}

function updateClass(item) {
  updateClassConfiguration(item.index, item.field, item.value)
}

async function handleSave() {
  syncBackboneAcademicDraft()
  await saveSettings()
}

onMounted(async () => {
  try {
    await loadSettings()
  } catch {
    // Keep the local draft visible if the backbone endpoint is temporarily
    // unavailable. Preschool admins can still review the fallback config.
  }

  try {
    await loadAcademicLifecycle()
    syncBackboneAcademicDraft()
  } catch {
    // Academic lifecycle records are the operational source of truth for the
    // current year and term, but the configuration fallback keeps the page
    // usable if the lifecycle endpoint is temporarily unavailable.
  }

  try {
    await loadReportPeriods()
  } catch {
    // Report periods are read-only context, so loading failures should not
    // block the rest of the settings backbone UI.
  }
})
</script>

<template>
  <MainLayout>
    <section class="preschool-settings">
      <HeaderSection
        :title="t('preschoolSettingsPage.pageTitle')"
        :subtitle="t('preschoolSettingsPage.pageSubtitle')"
      />

      <!-- status strip -->
      <div class="preschool-settings__strip">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            {{ t('preschoolSettingsPage.statusEyebrow') }}
          </p>
          <h2 class="text-base font-semibold text-slate-900">{{ operationalState.label }}</h2>
          <p class="text-sm text-slate-500">{{ t('preschoolSettingsPage.statusDescription') }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="{
              'bg-emerald-100 text-emerald-700': operationalState.tone === 'success',
              'bg-amber-100 text-amber-700': operationalState.tone === 'warning',
              'bg-sky-100 text-sky-700': operationalState.tone === 'info',
            }"
          >
            {{ operationalState.label }}
          </span>
          <p class="text-sm text-slate-500">{{ lastSavedLabel }}</p>
        </div>
      </div>

      <!-- summary stat cards -->
      <PreschoolSettingsSectionCard
        :eyebrow="t('preschoolSettingsPage.sections.summary.eyebrow')"
        :title="t('preschoolSettingsPage.sections.summary.title')"
        :subtitle="t('preschoolSettingsPage.sections.summary.subtitle')"
      >
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div class="preschool-settings__stat-card">
            <p class="preschool-settings__stat-label">{{ t('preschoolSettingsPage.summary.academicYear') }}</p>
            <p class="preschool-settings__stat-value">{{ settings.academicYear.currentAcademicYear || '-' }}</p>
          </div>
          <div class="preschool-settings__stat-card">
            <p class="preschool-settings__stat-label">{{ t('preschoolSettingsPage.summary.terms') }}</p>
            <p class="preschool-settings__stat-value">{{ settings.terms.length }}</p>
          </div>
          <div class="preschool-settings__stat-card">
            <p class="preschool-settings__stat-label">{{ t('preschoolSettingsPage.summary.reportPeriods') }}</p>
            <p class="preschool-settings__stat-value">{{ reportPeriods.length }}</p>
          </div>
          <div class="preschool-settings__stat-card">
            <p class="preschool-settings__stat-label">{{ t('preschoolSettingsPage.summary.classes') }}</p>
            <p class="preschool-settings__stat-value">{{ settings.classConfigurations.length }}</p>
          </div>
          <div
            class="preschool-settings__stat-card"
            :class="issueCount > 0 ? 'preschool-settings__stat-card--warn' : ''"
          >
            <p class="preschool-settings__stat-label">{{ t('preschoolSettingsPage.summary.issues') }}</p>
            <p class="preschool-settings__stat-value">{{ issueCount }}</p>
          </div>
        </div>
      </PreschoolSettingsSectionCard>

      <!-- reporting context -->
      <PreschoolSettingsSectionCard
        :eyebrow="t('preschoolSettingsPage.sections.reporting.eyebrow')"
        :title="t('preschoolSettingsPage.sections.reporting.title')"
        :subtitle="t('preschoolSettingsPage.sections.reporting.subtitle')"
      >
        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="period in reportPeriodPreview"
            :key="period.label"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-sm font-semibold text-slate-900">{{ period.label }}</p>
            <p class="mt-1 text-sm text-slate-600">
              {{ formatPreviewDate(period.fromDate) }} - {{ formatPreviewDate(period.toDate) }}
            </p>
            <p v-if="period.academicYear || period.termLabel" class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ period.academicYear || '-' }}<span v-if="period.termLabel"> · {{ period.termLabel }}</span>
            </p>
            <p class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ period.assessmentCount }} {{ t('preschoolSettingsPage.reporting.assessments') }}
            </p>
          </article>

          <div v-if="!reportPeriodPreview.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500 md:col-span-3">
            {{ t('preschoolSettingsPage.emptyStates.reportPeriods') }}
          </div>
        </div>
      </PreschoolSettingsSectionCard>

      <!-- two-column section grid -->
      <div class="grid gap-6 xl:grid-cols-2">
        <PreschoolAcademicYearManager
          :academic-years="academicYears"
          :current-context="currentContext"
          :loading="loading"
          :saving="saving"
          @open-add="openCreateYear"
          @open-edit="openEditYear"
          @activate="activateYearRow"
          @close="closeYearRow"
        />

        <PreschoolTermManager
          :terms="terms"
          :loading="loading"
          :saving="saving"
          @open-add="openCreateTerm"
          @open-edit="openEditTerm"
          @activate="activateTermRow"
          @close="closeTermRow"
        />

        <PreschoolEnrollmentConfiguration
          :model-value="settings.enrollment"
          :cycle-options="enrollmentCycleOptions"
          :class-level-options="classLevelOptions"
          :transfer-policy-options="transferPolicyOptions"
          :capacity-review-options="capacityReviewOptions"
          :errors="validationErrors.enrollment"
          @update:model-value="settings.enrollment = $event"
        />

        <PreschoolClassConfiguration
          :items="settings.classConfigurations"
          :level-options="classLevelOptions"
          :teacher-options="teacherOptions"
          :status-options="statusOptions"
          :errors="validationErrors.classConfigurations"
          @add="addClass"
          @update:item="updateClass"
          @remove="removeClassConfiguration"
        />

        <PreschoolAttendanceConfiguration
          :model-value="settings.attendance"
          :absence-rule-options="absenceRuleOptions"
          :errors="validationErrors.attendance"
          @update:model-value="settings.attendance = $event"
        />

        <PreschoolAssessmentConfiguration
          :model-value="settings.assessment"
          :cycle-options="assessmentCycleOptions"
          :finalization-options="finalizationModeOptions"
          :errors="validationErrors.assessment"
          @update:model-value="settings.assessment = $event"
        />

        <PreschoolScheduleConfiguration
          :model-value="settings.schedule"
          :weekly-mode-options="weeklyModeOptions"
          :planning-window-options="planningWindowOptions"
          :errors="validationErrors.schedule"
          @update:model-value="settings.schedule = $event"
        />

        <PreschoolPaymentConfiguration
          class="xl:col-span-2"
          :model-value="settings.payment"
          :payment-cycle-options="paymentCycleOptions"
          :late-fee-rule-options="lateFeeRuleOptions"
          :errors="validationErrors.payment"
          @update:model-value="settings.payment = $event"
        />
      </div>

      <PreschoolAcademicYearDialog
        :visible="yearDialogVisible"
        :title="yearDialogMode === 'edit'
          ? t('preschoolLifecyclePage.dialogs.academicYear.editTitle')
          : t('preschoolLifecyclePage.dialogs.academicYear.createTitle')"
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
          ? t('preschoolLifecyclePage.dialogs.term.editTitle')
          : t('preschoolLifecyclePage.dialogs.term.createTitle')"
        :draft="termDraft"
        :year-options="academicYearOptions"
        :status-options="statusOptions"
        :errors="termDraftErrors"
        @cancel="closeTermDialog"
        @save="saveTermDraft"
        @update:draft="termDraft = $event"
      />

      <!-- save / reset footer -->
      <div class="preschool-settings__footer">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-slate-900">{{ t('preschoolSettingsPage.footer.title') }}</p>
          <p class="text-sm text-slate-500">{{ t('preschoolSettingsPage.footer.subtitle') }}</p>
          <p v-if="hasValidationIssues" class="text-xs font-medium text-rose-600">
            {{ t('preschoolSettingsPage.footer.validationNotice') }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button variant="ghost" rounded="xl" @click="handleReset">
            {{ t('preschoolSettingsPage.actions.reset') }}
          </Button>
          <Button variant="primary" rounded="xl" :disabled="loading || saving" @click="handleSave">
            {{ t('preschoolSettingsPage.actions.saveChanges') }}
          </Button>
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* status strip */
.preschool-settings__strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe4ef;
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(255, 255, 255, 0.95));
  box-shadow: 0 18px 45px -34px rgba(15, 23, 42, 0.45);
}

/* summary stat cards */
.preschool-settings__stat-card {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #e2eaf3;
  background: #f8fafc;
}

.preschool-settings__stat-card--warn {
  border-color: #fde68a;
  background: #fffbeb;
}

.preschool-settings__stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.preschool-settings__stat-value {
  margin-top: 0.4rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

/* save / reset footer */
.preschool-settings__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe4ef;
  background: #fff;
  box-shadow: 0 18px 45px -34px rgba(15, 23, 42, 0.45);
}
</style>
