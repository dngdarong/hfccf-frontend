<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'

import EnrollmentSummaryCards from '@/modules/preschool/admin/components/enrollment/EnrollmentSummaryCards.vue'
import EnrollmentFilterBar from '@/modules/preschool/admin/components/enrollment/EnrollmentFilterBar.vue'
import EnrollmentApplicationTable from '@/modules/preschool/admin/components/enrollment/EnrollmentApplicationTable.vue'
import EnrollmentApplicationDialog from '@/modules/preschool/admin/components/enrollment/EnrollmentApplicationDialog.vue'
import EnrollmentDecisionDialog from '@/modules/preschool/admin/components/enrollment/EnrollmentDecisionDialog.vue'
import EnrollmentReviewPanel from '@/modules/preschool/admin/components/enrollment/EnrollmentReviewPanel.vue'
import EnrollmentGuardianSection from '@/modules/preschool/admin/components/enrollment/EnrollmentGuardianSection.vue'
import EnrollmentDocumentChecklist from '@/modules/preschool/admin/components/enrollment/EnrollmentDocumentChecklist.vue'
import EnrollmentTimeline from '@/modules/preschool/admin/components/enrollment/EnrollmentTimeline.vue'

import {
  fetchEnrollmentSummary,
  fetchEnrollments,
  fetchEnrollment,
  createEnrollment,
  updateEnrollment,
  submitEnrollment,
  reviewEnrollment,
  approveEnrollment,
  rejectEnrollment,
  waitlistEnrollment,
  cancelEnrollment,
  enrollStudent,
  updateEnrollmentDocument,
} from '@/modules/preschool/services/api/preschoolEnrollmentApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import http from '@/services/http'
import { unwrapApiData } from '@/services/api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  DEFAULT_SUMMARY,
  DECISION_MESSAGE_KEYS,
} from './constants/enrollmentManagementConstants'
import {
  formatPaginationFromResponse,
  extractApplicationsFromResponse,
  canShowDecisionActions,
  canShowEditButton,
  canShowSubmitButton,
  canShowReviewButton,
  canShowApproveButton,
  canShowWaitlistButton,
  canShowEnrollButton,
  canShowRejectButton,
  canShowCancelButton,
  applyUpdate,
  resetFilters,
  buildPaymentToast,
  extractApplicationFromResponse,
} from './utils/enrollmentManagementHelpers'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
// Route access is restricted to ADMIN scope; all users who reach this page are admins.
const canManage = true

// ─── State ───────────────────────────────────────────────────────────────────
const summary = ref({ ...DEFAULT_SUMMARY })
const applications = ref([])
const loadingSummary = ref(false)
const loadingList = ref(false)
const pagination = ref({ ...DEFAULT_PAGINATION })

const academicYears = ref([])
const terms = ref([])
const classes = ref([])

const filters = ref({ ...DEFAULT_FILTERS })

// Active application detail (side panel / dialog view)
const selected = ref(null)
const loadingDetail = ref(false)

// Dialog state
const showAppDialog = ref(false)
const appDialogReadonly = ref(false)
const editingApp = ref(null)
const savingApp = ref(false)
const appValidationErrors = ref({})

const showDecision = ref(false)
const decisionAction = ref('')
const decisionLoading = ref(false)

const showDetail = ref(false)

// ─── Lifecycle references ──────────────────────────────────────────────────
onMounted(() => {
  loadSummary()
  loadList()
  loadLifecycle()
})

watch(filters, () => loadList(), { deep: true })

// ─── Data loaders ─────────────────────────────────────────────────────────
async function loadSummary() {
  loadingSummary.value = true
  try {
    const data = await fetchEnrollmentSummary()
    summary.value = data ?? {}
  } catch {
    // non-critical
  } finally {
    loadingSummary.value = false
  }
}

async function loadList(page = 1) {
  loadingList.value = true
  try {
    const res = await fetchEnrollments({ ...filters.value, page })
    applications.value = extractApplicationsFromResponse(res)
    pagination.value = formatPaginationFromResponse(res)
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolEnrollmentPage.messages.errorLoad'), life: 4000 })
  } finally {
    loadingList.value = false
  }
}

async function loadLifecycle() {
  try {
    const [lifecycle, classRes] = await Promise.all([
      fetchAcademicLifecycle(),
      http.get('/preschool/classes?per_page=100').then((r) => unwrapApiData(r)),
    ])
    academicYears.value = lifecycle?.academicYears ?? []
    terms.value = lifecycle?.terms ?? []
    classes.value = Array.isArray(classRes) ? classRes : (classRes?.data ?? [])
  } catch {
    // non-critical
  }
}

async function openDetail(app) {
  showDetail.value = true
  selected.value = app
  loadingDetail.value = true
  try {
    const data = await fetchEnrollment(app.id)
    selected.value = data
  } catch {
    // keep partial data
  } finally {
    loadingDetail.value = false
  }
}

// ─── Application form ─────────────────────────────────────────────────────
function openNew() {
  router.push({ name: 'dashboard-preschool-admin-enrollments-create' })
}

function openEdit(app) {
  editingApp.value = app
  appDialogReadonly.value = false
  appValidationErrors.value = {}
  showAppDialog.value = true
}

function openView(app) {
  openDetail(app)
}

async function saveApplication(payload) {
  savingApp.value = true
  appValidationErrors.value = {}
  try {
    if (editingApp.value) {
      await updateEnrollment(editingApp.value.id, payload)
      toast.add({ severity: 'success', summary: t('preschoolEnrollmentPage.messages.updateSuccess'), life: 3000 })
    } else {
      await createEnrollment(payload)
      toast.add({ severity: 'success', summary: t('preschoolEnrollmentPage.messages.createSuccess'), life: 3000 })
    }
    showAppDialog.value = false
    loadSummary()
    loadList()
  } catch (error) {
    appValidationErrors.value = error?.validationErrors || error?.details?.errors || {}
    toast.add({ severity: 'error', summary: t('preschoolEnrollmentPage.messages.errorSave'), life: 4000 })
  } finally {
    savingApp.value = false
  }
}

// ─── Decision workflow ────────────────────────────────────────────────────
function openDecision(type, app) {
  selected.value = app
  decisionAction.value = type
  showDecision.value = true
}

function onTableAction({ type, application }) {
  if (type === 'submit') return handleQuickAction(submitEnrollment, application, 'submitSuccess')
  openDecision(type, application)
}

async function handleQuickAction(fn, app, msgKey) {
  try {
    await fn(app.id)
    toast.add({ severity: 'success', summary: t(`preschoolEnrollmentPage.messages.${msgKey}`), life: 3000 })
    selected.value = applyUpdate(applications.value, selected.value, app.id, null)
    loadSummary()
    loadList()
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolEnrollmentPage.messages.errorDecision'), life: 4000 })
  }
}

/**
 * Handle a confirmed decision from EnrollmentDecisionDialog.
 * Routes to the correct API handler, applies the response to local state,
 * and — for the 'enroll' action — shows a second toast with the auto-created
 * pending payment amount and term so the admin has immediate confirmation.
 *
 * @param {{ action: string, payload: Object }} param0
 *   action  — one of: approve | reject | waitlist | cancel | enroll | review
 *   payload — request body forwarded to the API handler
 * @returns {Promise<void>}
 */
async function confirmDecision({ action, payload }) {
  decisionLoading.value = true
  const handlerMap = {
    approve: approveEnrollment,
    reject: rejectEnrollment,
    waitlist: waitlistEnrollment,
    cancel: cancelEnrollment,
    enroll: enrollStudent,
    review: reviewEnrollment,
  }
  try {
    const fn = handlerMap[action]
    if (!fn) return

    const updated = await fn(selected.value.id, payload)
    toast.add({ severity: 'success', summary: t(`preschoolEnrollmentPage.messages.${DECISION_MESSAGE_KEYS[action]}`), life: 3000 })

    const paymentToast = buildPaymentToast(t, action === 'enroll' ? updated?.payment : null)
    if (paymentToast) toast.add(paymentToast)

    showDecision.value = false
    selected.value = applyUpdate(applications.value, selected.value, selected.value.id, extractApplicationFromResponse(updated))
    loadSummary()
    if (action === 'enroll') loadList()
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolEnrollmentPage.messages.errorDecision'), life: 4000 })
  } finally {
    decisionLoading.value = false
  }
}

// ─── Document updates ─────────────────────────────────────────────────────
async function handleDocumentUpdate({ documentId, payload }) {
  if (!selected.value) return
  try {
    await updateEnrollmentDocument(selected.value.id, documentId, payload)
    toast.add({ severity: 'success', summary: t('preschoolEnrollmentPage.messages.documentUpdateSuccess'), life: 3000 })
    const fresh = await fetchEnrollment(selected.value.id)
    selected.value = fresh
  } catch {
    toast.add({ severity: 'error', summary: t('preschoolEnrollmentPage.messages.errorSave'), life: 4000 })
  }
}

function clearFilters() {
  filters.value = resetFilters()
}

function refreshData() {
  loadSummary()
  loadList()
}
</script>

<template>
  <MainLayout>
    <Toast />

    <section class="preschool-enrollment-page">
      <HeaderSection
        :title="t('preschoolEnrollmentPage.title')"
        :subtitle="t('preschoolEnrollmentPage.subtitle')"
      />

      <div class="preschool-enrollment-page__toolbar">
        <div class="preschool-enrollment-page__toolbar-meta">
          <p class="preschool-enrollment-page__toolbar-eyebrow">
            {{ t('preschoolEnrollmentPage.cards.total') }}
          </p>
          <p class="preschool-enrollment-page__toolbar-count">
            {{ summary.total || 0 }}
          </p>
        </div>

        <Button
          v-if="canManage"
          type="button"
          variant="primary"
          size="lg"
          rounded="xl"
          class="preschool-enrollment-page__toolbar-action"
          @click="openNew"
        >
          <template #iconLeft>
            <i class="pi pi-plus" aria-hidden="true" />
          </template>
          {{ t('preschoolEnrollmentPage.actions.newApplication') }}
        </Button>
      </div>

      <div class="preschool-enrollment-page__layout">
        <div class="preschool-enrollment-page__main">
          <EnrollmentSummaryCards :summary="summary" :loading="loadingSummary" />

          <EnrollmentFilterBar
            v-model="filters"
            :academic-years="academicYears"
            @clear="clearFilters"
          />

          <EnrollmentApplicationTable
            :applications="applications"
            :loading="loadingList"
            :can-manage="canManage"
            @view="openView"
            @edit="openEdit"
            @action="onTableAction"
          />
        </div>

        <aside class="preschool-enrollment-page__sidebar">
          <div class="enr-sidebar-card">
            <h3 class="enr-sidebar-card__title">{{ t('preschoolEnrollmentPage.sidebar.title') }}</h3>
            <div class="enr-sidebar-card__content">
              <div class="enr-sidebar-stat">
                <span class="enr-sidebar-stat__label">{{ t('preschoolEnrollmentPage.cards.total') }}</span>
                <span class="enr-sidebar-stat__value">{{ summary.total || 0 }}</span>
              </div>
              <div class="enr-sidebar-stat">
                <span class="enr-sidebar-stat__label">{{ t('preschoolEnrollmentPage.cards.underReview') }}</span>
                <span class="enr-sidebar-stat__value enr-sidebar-stat__value--warning">{{ summary.pending || 0 }}</span>
              </div>
              <div class="enr-sidebar-stat">
                <span class="enr-sidebar-stat__label">{{ t('preschoolEnrollmentPage.cards.approved') }}</span>
                <span class="enr-sidebar-stat__value enr-sidebar-stat__value--success">{{ summary.approved || 0 }}</span>
              </div>
              <div class="enr-sidebar-stat">
                <span class="enr-sidebar-stat__label">{{ t('preschoolEnrollmentPage.cards.enrolled') }}</span>
                <span class="enr-sidebar-stat__value enr-sidebar-stat__value--info">{{ summary.enrolled || 0 }}</span>
              </div>
              <div class="enr-sidebar-stat">
                <span class="enr-sidebar-stat__label">{{ t('preschoolEnrollmentPage.cards.rejected') }}</span>
                <span class="enr-sidebar-stat__value enr-sidebar-stat__value--danger">{{ summary.rejected || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="enr-sidebar-card">
            <h3 class="enr-sidebar-card__title">{{ t('preschoolEnrollmentPage.sidebar.checklist') }}</h3>
            <div class="enr-sidebar-card__content">
              <div class="enr-sidebar-action">
                <i class="pi pi-plus-circle" aria-hidden="true" />
                <button type="button" class="enr-sidebar-action__btn" @click="openNew">
                  {{ t('preschoolEnrollmentPage.actions.newApplication') }}
                </button>
              </div>
              <div class="enr-sidebar-action">
                <i class="pi pi-filter" aria-hidden="true" />
                <button type="button" class="enr-sidebar-action__btn" @click="clearFilters">
                  {{ t('preschoolEnrollmentPage.filters.clearFilters') }}
                </button>
              </div>
              <div class="enr-sidebar-action">
                <i class="pi pi-refresh" aria-hidden="true" />
                <button type="button" class="enr-sidebar-action__btn" @click="refreshData">
                  {{ t('common.refresh') }}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Detail side panel -->
    <Teleport to="body">
      <div v-if="showDetail" class="enr-detail-overlay" @click.self="showDetail = false">
        <aside class="enr-detail-panel">
          <div class="enr-detail-panel__header">
            <h2 class="enr-detail-panel__title">
              {{ selected?.fullName ?? t('preschoolEnrollmentPage.applicationDialog.titleView') }}
            </h2>
            <div class="enr-detail-panel__header-actions">
              <button
                v-if="canManage && selected && canShowEditButton(selected.status)"
                class="enr-detail-action enr-detail-action--edit"
                @click="openEdit(selected)"
              >
                <i class="pi pi-pencil" /> {{ t('preschoolEnrollmentPage.actions.edit') }}
              </button>
              <button class="enr-detail-panel__close" @click="showDetail = false">
                <i class="pi pi-times" />
              </button>
            </div>
          </div>

          <div v-if="loadingDetail" class="enr-detail-panel__loading">
            <i class="pi pi-spin pi-spinner" /> {{ t('common.loading') }}
          </div>

          <div v-else-if="selected" class="enr-detail-panel__body">
            <EnrollmentReviewPanel :application="selected" />
            <EnrollmentGuardianSection :application="selected" />
            <EnrollmentDocumentChecklist
              :documents="selected.documents ?? []"
              :can-edit="canManage"
              :application-id="selected.id"
              @update="handleDocumentUpdate"
            />
            <EnrollmentTimeline :logs="selected.decisionLogs ?? []" />

            <!-- Decision actions panel -->
            <div v-if="canManage && selected && canShowDecisionActions(selected.status)" class="enr-detail-actions">
              <button
                v-if="canShowSubmitButton(selected.status)"
                class="enr-detail-action enr-detail-action--primary"
                @click="handleQuickAction(submitEnrollment, selected, 'submitSuccess')"
              >
                {{ t('preschoolEnrollmentPage.actions.submit') }}
              </button>
              <button
                v-if="canShowReviewButton(selected.status)"
                class="enr-detail-action enr-detail-action--primary"
                @click="openDecision('review', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.review') }}
              </button>
              <button
                v-if="canShowApproveButton(selected.status)"
                class="enr-detail-action enr-detail-action--success"
                @click="openDecision('approve', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.approve') }}
              </button>
              <button
                v-if="canShowWaitlistButton(selected.status)"
                class="enr-detail-action enr-detail-action--warning"
                @click="openDecision('waitlist', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.waitlist') }}
              </button>
              <button
                v-if="canShowEnrollButton(selected.status)"
                class="enr-detail-action enr-detail-action--success"
                @click="openDecision('enroll', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.enroll') }}
              </button>
              <button
                v-if="canShowRejectButton(selected.status)"
                class="enr-detail-action enr-detail-action--danger"
                @click="openDecision('reject', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.reject') }}
              </button>
              <button
                v-if="canShowCancelButton(selected.status)"
                class="enr-detail-action enr-detail-action--muted"
                @click="openDecision('cancel', selected)"
              >
                {{ t('preschoolEnrollmentPage.actions.cancel') }}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Teleport>

    <!-- Application create/edit dialog -->
    <EnrollmentApplicationDialog
      v-model:visible="showAppDialog"
      :application="editingApp"
      :readonly="appDialogReadonly"
      :academic-years="academicYears"
      :terms="terms"
      :classes="classes"
      :loading="savingApp"
      :validation-errors="appValidationErrors"
      @save="saveApplication"
    />

    <!-- Decision dialog -->
    <EnrollmentDecisionDialog
      v-model:visible="showDecision"
      :action="decisionAction"
      :application="selected ?? {}"
      :classes="classes"
      :academic-years="academicYears"
      :terms="terms"
      :loading="decisionLoading"
      @confirm="confirmDecision"
    />
  </MainLayout>
</template>

<style scoped>
.preschool-enrollment-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.preschool-enrollment-page__toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.preschool-enrollment-page__toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preschool-enrollment-page__toolbar-eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.preschool-enrollment-page__toolbar-count {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 800;
  color: #0f172a;
}

.preschool-enrollment-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.95fr);
  gap: 1.5rem;
  align-items: start;
}

.preschool-enrollment-page__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preschool-enrollment-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
}

.enr-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.enr-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.enr-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.enr-page__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.preschool-enrollment-page__toolbar-action {
  min-width: 15rem;
  justify-content: space-between;
  padding-inline: 0.95rem 1rem;
  box-shadow: 0 20px 36px -24px rgba(99, 102, 241, 0.58);
}

.preschool-enrollment-page__toolbar-action :deep(.p-button-label) {
  width: 100%;
}

.preschool-enrollment-page__toolbar-action :deep(.p-button-icon) {
  margin-right: 0.75rem;
  font-size: 0.95rem;
}

/* Detail side panel */
.enr-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  z-index: 900;
  display: flex;
  justify-content: flex-end;
}

.enr-detail-panel {
  width: min(640px, 100vw);
  height: 100%;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

.enr-detail-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
  flex-shrink: 0;
}

.enr-detail-panel__title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.enr-detail-panel__header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.enr-detail-panel__close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.4rem;
}

.enr-detail-panel__close:hover { color: #0f172a; }

.enr-detail-panel__loading {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.enr-detail-panel__body {
  overflow-y: auto;
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Decision action buttons in detail panel */
.enr-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.enr-detail-action {
  padding: 0.5rem 1rem;
  border-radius: 0.55rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.enr-detail-action--primary { background: #6366f1; color: #fff; }
.enr-detail-action--primary:hover { background: #4f46e5; }
.enr-detail-action--success { background: #16a34a; color: #fff; }
.enr-detail-action--success:hover { background: #15803d; }
.enr-detail-action--warning { background: #f59e0b; color: #fff; }
.enr-detail-action--warning:hover { background: #d97706; }
.enr-detail-action--danger { background: #ef4444; color: #fff; }
.enr-detail-action--danger:hover { background: #dc2626; }
.enr-detail-action--muted { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
.enr-detail-action--muted:hover { background: #e2e8f0; }
.enr-detail-action--edit { background: #f1f5f9; color: #475569; border-color: #e2e8f0; font-size: 0.8rem; padding: 0.35rem 0.75rem; }
.enr-detail-action--edit:hover { background: #e2e8f0; }

/* Sidebar Layout */
.enr-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.95fr);
  gap: 1.5rem;
  align-items: start;
}

.enr-page__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.enr-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
}

.enr-sidebar-card {
  background: #fff;
  border-radius: 1.125rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.28);
}

.enr-sidebar-card__title {
  padding: 1rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  margin: 0;
}

.enr-sidebar-card__content {
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.enr-sidebar-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border-left: 3px solid #e2e8f0;
}

.enr-sidebar-stat__label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.enr-sidebar-stat__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.enr-sidebar-stat__value--success { color: #16a34a; }
.enr-sidebar-stat__value--warning { color: #f59e0b; }
.enr-sidebar-stat__value--danger { color: #ef4444; }
.enr-sidebar-stat__value--info { color: #0284c7; }

.enr-sidebar-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.enr-sidebar-action:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.enr-sidebar-action i {
  color: #64748b;
  font-size: 0.95rem;
}

.enr-sidebar-action__btn {
  flex: 1;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.enr-sidebar-action__btn:hover {
  color: #1e293b;
}

@media (max-width: 1200px) {
  .preschool-enrollment-page__layout,
  .enr-page__layout {
    grid-template-columns: 1fr;
  }

  .preschool-enrollment-page__sidebar,
  .enr-page__sidebar {
    grid-column: 1;
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .enr-sidebar-card {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .preschool-enrollment-page__toolbar-action {
    width: 100%;
    min-width: 0;
  }

  .preschool-enrollment-page__sidebar,
  .enr-page__sidebar {
    flex-direction: column;
  }

  .enr-sidebar-card {
    min-width: auto;
  }
}
</style>
