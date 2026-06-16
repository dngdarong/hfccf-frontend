<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

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
  editingApp.value = null
  appDialogReadonly.value = false
  showAppDialog.value = true
}

function openEdit(app) {
  editingApp.value = app
  appDialogReadonly.value = false
  showAppDialog.value = true
}

function openView(app) {
  openDetail(app)
}

async function saveApplication(payload) {
  savingApp.value = true
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
  } catch {
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
</script>

<template>
  <div class="enr-page">
    <Toast />

    <!-- Header -->
    <header class="enr-page__header">
      <div>
        <h1 class="enr-page__title">{{ t('preschoolEnrollmentPage.title') }}</h1>
        <p class="enr-page__subtitle">{{ t('preschoolEnrollmentPage.subtitle') }}</p>
      </div>
      <button v-if="canManage" class="enr-page__new-btn" @click="openNew">
        <i class="pi pi-plus" />
        {{ t('preschoolEnrollmentPage.actions.newApplication') }}
      </button>
    </header>

    <div class="enr-page__layout">
      <div class="enr-page__main">
        <!-- Summary Cards -->
        <EnrollmentSummaryCards :summary="summary" :loading="loadingSummary" />

        <!-- Filters -->
        <EnrollmentFilterBar
          v-model="filters"
          :academic-years="academicYears"
          @clear="clearFilters"
        />

        <!-- Table -->
        <EnrollmentApplicationTable
          :applications="applications"
          :loading="loadingList"
          :can-manage="canManage"
          @view="openView"
          @edit="openEdit"
          @action="onTableAction"
        />
      </div>

      <!-- Right Sidebar -->
      <aside class="enr-page__sidebar">
        <div class="enr-sidebar-card">
          <h3 class="enr-sidebar-card__title">{{ t('preschoolEnrollmentPage.sidebar.title') || 'Enrollment Status' }}</h3>
          <div class="enr-sidebar-card__content">
            <div class="enr-sidebar-stat">
              <span class="enr-sidebar-stat__label">Total Applications</span>
              <span class="enr-sidebar-stat__value">{{ summary.total || 0 }}</span>
            </div>
            <div class="enr-sidebar-stat">
              <span class="enr-sidebar-stat__label">Pending Review</span>
              <span class="enr-sidebar-stat__value enr-sidebar-stat__value--warning">{{ summary.pending || 0 }}</span>
            </div>
            <div class="enr-sidebar-stat">
              <span class="enr-sidebar-stat__label">Approved</span>
              <span class="enr-sidebar-stat__value enr-sidebar-stat__value--success">{{ summary.approved || 0 }}</span>
            </div>
            <div class="enr-sidebar-stat">
              <span class="enr-sidebar-stat__label">Enrolled</span>
              <span class="enr-sidebar-stat__value enr-sidebar-stat__value--info">{{ summary.enrolled || 0 }}</span>
            </div>
            <div class="enr-sidebar-stat">
              <span class="enr-sidebar-stat__label">Rejected</span>
              <span class="enr-sidebar-stat__value enr-sidebar-stat__value--danger">{{ summary.rejected || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="enr-sidebar-card">
          <h3 class="enr-sidebar-card__title">{{ t('preschoolEnrollmentPage.sidebar.checklist') || 'Quick Actions' }}</h3>
          <div class="enr-sidebar-card__content">
            <div class="enr-sidebar-action">
              <i class="pi pi-plus-circle" />
              <button @click="openNew" class="enr-sidebar-action__btn">
                New Application
              </button>
            </div>
            <div class="enr-sidebar-action">
              <i class="pi pi-filter" />
              <button @click="clearFilters" class="enr-sidebar-action__btn">
                Clear Filters
              </button>
            </div>
            <div class="enr-sidebar-action">
              <i class="pi pi-refresh" />
              <button @click="() => { loadSummary(); loadList() }" class="enr-sidebar-action__btn">
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

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
            <i class="pi pi-spin pi-spinner" /> Loading…
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
  </div>
</template>

<style scoped>
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

.enr-page__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.enr-page__new-btn:hover { background: #4f46e5; }

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
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.enr-sidebar-card__title {
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  margin: 0;
}

.enr-sidebar-card__content {
  padding: 1rem 1.25rem;
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
  border-radius: 0.5rem;
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
  border-radius: 0.5rem;
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
  .enr-page__layout {
    grid-template-columns: 1fr;
  }

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
  .enr-page__sidebar {
    flex-direction: column;
  }

  .enr-sidebar-card {
    min-width: auto;
  }
}
</style>
