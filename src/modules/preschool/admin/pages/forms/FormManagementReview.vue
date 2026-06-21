<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  approveAssessmentFormReview,
  fetchAssessmentFormReviewHistory,
  fetchAssessmentFormReviewQueue,
  rejectAssessmentFormReview,
  startAssessmentFormReview,
} from '@/modules/preschool/services/api/preschoolAssessmentApi'

defineOptions({
  name: 'PreschoolAdminFormManagementReviewPage',
})

const { t, te } = useLanguage()
const router = useRouter()
const toast = useToast()

const reviewQueue = ref([])
const reviewSummary = ref({
  pendingReview: 0,
  inReview: 0,
  approved: 0,
  rejected: 0,
})
const pagination = ref({
  page: 1,
  perPage: 20,
  total: 0,
  totalPages: 0,
})
const filters = ref({
  search: '',
  status: '',
})
const isLoading = ref(false)
const queueError = ref('')
const selectedForm = ref(null)
const selectedHistory = ref([])
const isDetailOpen = ref(false)
const isHistoryLoading = ref(false)
const isActionDialogOpen = ref(false)
const actionMode = ref('approve')
const actionForm = ref(null)
const actionNotes = ref('')
const actionReason = ref('')
const isActionSubmitting = ref(false)

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

const pageTitle = computed(() =>
  safeText('preschoolReviewForms.page.title', 'Review Forms'),
)

const pageSubtitle = computed(() =>
  safeText(
    'preschoolReviewForms.page.subtitle',
    'Review pending form templates, approve them, or send them back for corrections.',
  ),
)

const hasActiveFilters = computed(() => Boolean(filters.value.search.trim() || filters.value.status))
const detailSectionCount = computed(() => selectedForm.value?.sections?.length || 0)
const detailQuestionCount = computed(() =>
  (selectedForm.value?.sections || []).reduce((total, section) => total + (section.questions?.length || 0), 0),
)

const statusOptions = computed(() => [
  { label: safeText('preschoolReviewForms.reviewQueue.statuses.all', 'All statuses'), value: '' },
  { label: safeText('preschoolReviewForms.reviewQueue.statuses.submitted', 'Pending review'), value: 'submitted' },
  { label: safeText('preschoolReviewForms.reviewQueue.statuses.inReview', 'In review'), value: 'in_review' },
  { label: safeText('preschoolReviewForms.reviewQueue.statuses.approved', 'Approved'), value: 'approved' },
  { label: safeText('preschoolReviewForms.reviewQueue.statuses.rejected', 'Rejected'), value: 'rejected' },
])

function reviewStatusLabel(status) {
  const key = `preschoolReviewForms.reviewQueue.statuses.${status}`
  return safeText(key, status || 'Draft')
}

function reviewStatusTone(status) {
  if (status === 'submitted') return 'pending'
  if (status === 'in_review') return 'review'
  if (status === 'approved') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'draft'
}

function formatDate(value) {
  if (!value) {
    return safeText('preschoolReviewForms.reviewQueue.notAvailable', 'N/A')
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function userLabel(user) {
  if (!user) {
    return safeText('preschoolReviewForms.reviewQueue.system', 'System')
  }

  if (typeof user === 'object') {
    return user.name || user.id || safeText('preschoolReviewForms.reviewQueue.system', 'System')
  }

  return String(user)
}

function sectionSummary(section) {
  const questionCount = section.questions?.length || 0
  return `${section.title || section.code || safeText('preschoolReviewForms.reviewQueue.section', 'Section')} (${questionCount})`
}

async function loadReviewQueue() {
  isLoading.value = true
  queueError.value = ''

  try {
    const response = await fetchAssessmentFormReviewQueue({
      page: pagination.value.page,
      perPage: pagination.value.perPage,
      search: filters.value.search,
      status: filters.value.status,
    })

    reviewQueue.value = response.items || []
    reviewSummary.value = response.summary || reviewSummary.value
    pagination.value = response.pagination || pagination.value

    if (selectedForm.value) {
      const refreshed = reviewQueue.value.find(item => String(item.id) === String(selectedForm.value.id))
      if (refreshed) {
        selectedForm.value = refreshed
      }
    }
  } catch (error) {
    queueError.value = error?.response?.data?.message || error?.message || safeText('preschoolReviewForms.reviewQueue.errors.load', 'Unable to load the review queue.')
  } finally {
    isLoading.value = false
  }
}

async function loadReviewHistory(formId) {
  if (!formId) {
    selectedHistory.value = []
    return
  }

  isHistoryLoading.value = true
  try {
    selectedHistory.value = await fetchAssessmentFormReviewHistory(formId)
  } catch (error) {
    selectedHistory.value = []
    toast.add({
      severity: 'warn',
      summary: safeText('preschoolReviewForms.reviewQueue.errors.historySummary', 'Review history'),
      detail: error?.response?.data?.message || error?.message || safeText('preschoolReviewForms.reviewQueue.errors.history', 'Unable to load review history.'),
      life: 4000,
    })
  } finally {
    isHistoryLoading.value = false
  }
}

async function openFormDetails(form) {
  selectedForm.value = form
  isDetailOpen.value = true
  await loadReviewHistory(form.id)
}

function closeDetails() {
  isDetailOpen.value = false
}

function openActionDialog(mode, form) {
  actionMode.value = mode
  actionForm.value = form
  actionNotes.value = form?.reviewNotes || ''
  actionReason.value = form?.reviewNotes || ''
  isActionDialogOpen.value = true
}

function closeActionDialog() {
  isActionDialogOpen.value = false
  actionForm.value = null
  actionNotes.value = ''
  actionReason.value = ''
}

async function runStartReview(form) {
  isActionSubmitting.value = true
  try {
    const updated = await startAssessmentFormReview(form.id)
    toast.add({
      severity: 'success',
      summary: safeText('preschoolReviewForms.reviewQueue.actions.started', 'Review started'),
      detail: safeText('preschoolReviewForms.reviewQueue.messages.started', 'The form moved into review.'),
      life: 3000,
    })
    await loadReviewQueue()
    if (isDetailOpen.value && selectedForm.value?.id === form.id) {
      selectedForm.value = updated
      await loadReviewHistory(form.id)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: safeText('preschoolReviewForms.reviewQueue.actions.started', 'Review started'),
      detail: error?.response?.data?.message || error?.message || safeText('preschoolReviewForms.reviewQueue.errors.action', 'Unable to update the review state.'),
      life: 4500,
    })
  } finally {
    isActionSubmitting.value = false
  }
}

async function submitAction() {
  if (!actionForm.value) {
    return
  }

  isActionSubmitting.value = true
  try {
    const updated = actionMode.value === 'approve'
      ? await approveAssessmentFormReview(actionForm.value.id, { reviewNotes: actionNotes.value })
      : await rejectAssessmentFormReview(actionForm.value.id, {
          rejectionReason: actionReason.value,
          reviewNotes: actionNotes.value,
        })

    toast.add({
      severity: 'success',
      summary: actionMode.value === 'approve'
        ? safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve')
        : safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject'),
      detail: actionMode.value === 'approve'
        ? safeText('preschoolReviewForms.reviewQueue.messages.approved', 'The form was approved.')
        : safeText('preschoolReviewForms.reviewQueue.messages.rejected', 'The form was rejected.'),
      life: 3000,
    })

    await loadReviewQueue()

    if (isDetailOpen.value && selectedForm.value?.id === actionForm.value.id) {
      selectedForm.value = updated
      await loadReviewHistory(actionForm.value.id)
    }

    closeActionDialog()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: actionMode.value === 'approve'
        ? safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve')
        : safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject'),
      detail: error?.response?.data?.message || error?.message || safeText('preschoolReviewForms.reviewQueue.errors.action', 'Unable to update the review state.'),
      life: 4500,
    })
  } finally {
    isActionSubmitting.value = false
  }
}

function goToBuilder(form) {
  router.push({
    name: 'dashboard-preschool-admin-forms-build',
    query: { templateId: form.id },
  })
}

async function handleFiltersSubmit() {
  pagination.value.page = 1
  await loadReviewQueue()
}

async function resetFilters() {
  filters.value.search = ''
  filters.value.status = ''
  pagination.value.page = 1
  await loadReviewQueue()
}

async function handlePageChange(pageNumber) {
  pagination.value.page = pageNumber
  await loadReviewQueue()
}

onMounted(() => {
  loadReviewQueue()
})
</script>

<template>
  <MainLayout>
    <section class="preschool-review-page">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <section class="review-summary-grid" aria-label="Summary">
        <article class="review-summary-card">
          <p>{{ safeText('preschoolReviewForms.reviewQueue.summary.pendingReview', 'Pending review') }}</p>
          <strong>{{ reviewSummary.pendingReview }}</strong>
        </article>
        <article class="review-summary-card">
          <p>{{ safeText('preschoolReviewForms.reviewQueue.summary.inReview', 'In review') }}</p>
          <strong>{{ reviewSummary.inReview }}</strong>
        </article>
        <article class="review-summary-card">
          <p>{{ safeText('preschoolReviewForms.reviewQueue.summary.approved', 'Approved') }}</p>
          <strong>{{ reviewSummary.approved }}</strong>
        </article>
        <article class="review-summary-card">
          <p>{{ safeText('preschoolReviewForms.reviewQueue.summary.rejected', 'Rejected') }}</p>
          <strong>{{ reviewSummary.rejected }}</strong>
        </article>
      </section>

      <section class="review-toolbar" aria-label="Filters">
        <form class="review-toolbar__filters" @submit.prevent="handleFiltersSubmit">
          <label class="review-field">
            <span>{{ safeText('preschoolReviewForms.reviewQueue.filters.search', 'Search') }}</span>
            <input
              v-model="filters.search"
              type="search"
              :placeholder="safeText('preschoolReviewForms.reviewQueue.placeholders.search', 'Search by name or code')"
            >
          </label>

          <label class="review-field">
            <span>{{ safeText('preschoolReviewForms.reviewQueue.filters.status', 'Status') }}</span>
            <select v-model="filters.status">
              <option v-for="option in statusOptions" :key="option.value || 'all'" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="review-toolbar__actions">
            <button type="submit" class="review-action review-action--primary">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.applyFilters', 'Apply filters') }}
            </button>
            <button type="button" class="review-action" @click="resetFilters">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.resetFilters', 'Reset') }}
            </button>
          </div>
        </form>
      </section>

      <section class="review-table-card">
        <div v-if="isLoading" class="review-state">
          <i class="pi pi-spin pi-spinner" />
          <span>{{ safeText('preschoolReviewForms.reviewQueue.loading', 'Loading review queue...') }}</span>
        </div>

        <div v-else-if="queueError" class="review-state review-state--error">
          <i class="pi pi-exclamation-triangle" />
          <span>{{ queueError }}</span>
        </div>

        <div v-else-if="!reviewQueue.length" class="review-empty-state">
          <h3>
            {{ hasActiveFilters
              ? safeText('preschoolReviewForms.reviewQueue.empty.filteredTitle', 'No forms found for filter')
              : safeText('preschoolReviewForms.reviewQueue.empty.title', 'No forms pending review') }}
          </h3>
          <p>
            {{ hasActiveFilters
              ? safeText('preschoolReviewForms.reviewQueue.empty.filteredDescription', 'Adjust the filters or clear them to see other forms.')
              : safeText('preschoolReviewForms.reviewQueue.empty.description', 'Submitted forms will appear here when they are ready for review.') }}
          </p>
        </div>

        <div v-else class="review-table-wrap">
          <table class="review-table">
            <thead>
              <tr>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.template', 'Template') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.version', 'Version') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.status', 'Status') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.sections', 'Sections') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.questions', 'Questions') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.submittedBy', 'Submitted by') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.submittedAt', 'Submitted at') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.updatedAt', 'Updated at') }}</th>
                <th>{{ safeText('preschoolReviewForms.reviewQueue.columns.actions', 'Actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="form in reviewQueue" :key="form.id">
                <td>
                  <div class="review-template-cell">
                    <strong>{{ form.name }}</strong>
                    <span>{{ form.code }}</span>
                  </div>
                </td>
                <td>v{{ form.currentVersion || 1 }}</td>
                <td>
                  <span class="review-pill" :data-tone="reviewStatusTone(form.reviewStatus)">
                    {{ reviewStatusLabel(form.reviewStatus) }}
                  </span>
                </td>
                <td>{{ form.sections?.length || 0 }}</td>
                <td>{{ (form.sections || []).reduce((total, section) => total + (section.questions?.length || 0), 0) }}</td>
                <td>{{ userLabel(form.submittedBy || form.createdBy || form.created_by) }}</td>
                <td>{{ formatDate(form.submittedAt || form.createdAt || form.updatedAt) }}</td>
                <td>{{ formatDate(form.updatedAt || form.publishedAt) }}</td>
                <td>
                  <div class="review-row-actions">
                    <button type="button" class="review-row-link" @click="openFormDetails(form)">
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.details', 'Details') }}
                    </button>
                    <button
                      v-if="form.reviewStatus === 'submitted'"
                      type="button"
                      class="review-row-link"
                      @click="runStartReview(form)"
                    >
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.startReview', 'Start review') }}
                    </button>
                    <button
                      v-if="['submitted', 'in_review'].includes(form.reviewStatus)"
                      type="button"
                      class="review-row-link"
                      @click="openActionDialog('approve', form)"
                    >
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve') }}
                    </button>
                    <button
                      v-if="['submitted', 'in_review'].includes(form.reviewStatus)"
                      type="button"
                      class="review-row-link"
                      @click="openActionDialog('reject', form)"
                    >
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject') }}
                    </button>
                    <button type="button" class="review-row-link" @click="goToBuilder(form)">
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.openBuilder', 'Open Builder') }}
                    </button>
                    <button type="button" class="review-row-link" @click="goToBuilder(form)">
                      {{ safeText('preschoolReviewForms.reviewQueue.actions.openVersions', 'Open Version History') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="review-pagination" v-if="pagination.totalPages > 1">
            <button
              type="button"
              class="review-action"
              :disabled="pagination.page <= 1 || isLoading"
              @click="handlePageChange(Math.max(1, pagination.page - 1))"
            >
              {{ safeText('preschoolReviewForms.reviewQueue.pagination.previous', 'Previous') }}
            </button>
            <span>
              {{ safeText('preschoolReviewForms.reviewQueue.pagination.page', 'Page') }}
              {{ pagination.page }} / {{ pagination.totalPages }}
            </span>
            <button
              type="button"
              class="review-action"
              :disabled="pagination.page >= pagination.totalPages || isLoading"
              @click="handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))"
            >
              {{ safeText('preschoolReviewForms.reviewQueue.pagination.next', 'Next') }}
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="isDetailOpen && selectedForm"
        class="review-dialog-backdrop"
        role="presentation"
        @click.self="closeDetails"
      >
        <section class="review-dialog" role="dialog" aria-modal="true" :aria-label="selectedForm.name">
          <header class="review-dialog__header">
            <div>
              <p class="review-dialog__eyebrow">{{ safeText('preschoolReviewForms.reviewQueue.detail.eyebrow', 'Review details') }}</p>
              <h3>{{ selectedForm.name }}</h3>
              <p>{{ selectedForm.code }}</p>
            </div>
            <button type="button" class="review-dialog__close" @click="closeDetails">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.close', 'Close') }}
            </button>
          </header>

          <div class="review-dialog__grid">
            <section class="review-dialog__card">
              <h4>{{ safeText('preschoolReviewForms.reviewQueue.detail.metadata', 'Metadata') }}</h4>
              <dl>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.version', 'Version') }}</dt>
                  <dd>v{{ selectedForm.currentVersion || 1 }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.status', 'Status') }}</dt>
                  <dd><span class="review-pill" :data-tone="reviewStatusTone(selectedForm.reviewStatus)">{{ reviewStatusLabel(selectedForm.reviewStatus) }}</span></dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.sections', 'Sections') }}</dt>
                  <dd>{{ detailSectionCount }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.questions', 'Questions') }}</dt>
                  <dd>{{ detailQuestionCount }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.submittedBy', 'Submitted by') }}</dt>
                  <dd>{{ userLabel(selectedForm.submittedBy || selectedForm.createdBy || selectedForm.created_by) }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.submittedAt', 'Submitted at') }}</dt>
                  <dd>{{ formatDate(selectedForm.submittedAt || selectedForm.createdAt) }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.reviewedBy', 'Reviewed by') }}</dt>
                  <dd>{{ userLabel(selectedForm.reviewedBy) }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.reviewedAt', 'Reviewed at') }}</dt>
                  <dd>{{ formatDate(selectedForm.reviewedAt) }}</dd>
                </div>
                <div>
                  <dt>{{ safeText('preschoolReviewForms.reviewQueue.columns.notes', 'Review notes') }}</dt>
                  <dd>{{ selectedForm.reviewNotes || safeText('preschoolReviewForms.reviewQueue.empty.notes', 'No notes provided') }}</dd>
                </div>
              </dl>
            </section>

            <section class="review-dialog__card">
              <h4>{{ safeText('preschoolReviewForms.reviewQueue.detail.summary', 'Section summary') }}</h4>
              <div v-if="selectedForm.sections?.length" class="review-section-list">
                <article v-for="section in selectedForm.sections" :key="section.id || section.code" class="review-section-item">
                  <strong>{{ section.title || section.code }}</strong>
                  <span>{{ sectionSummary(section) }}</span>
                </article>
              </div>
              <p v-else class="review-dialog__empty">
                {{ safeText('preschoolReviewForms.reviewQueue.empty.sections', 'No sections found.') }}
              </p>
            </section>

            <section class="review-dialog__card review-dialog__card--history">
              <div class="review-dialog__card-header">
                <h4>{{ safeText('preschoolReviewForms.reviewQueue.detail.history', 'Review history') }}</h4>
                <button type="button" class="review-row-link" @click="loadReviewHistory(selectedForm.id)">
                  {{ safeText('preschoolReviewForms.reviewQueue.actions.refreshHistory', 'Refresh history') }}
                </button>
              </div>

              <div v-if="isHistoryLoading" class="review-state review-state--compact">
                <i class="pi pi-spin pi-spinner" />
                <span>{{ safeText('preschoolReviewForms.reviewQueue.loadingHistory', 'Loading review history...') }}</span>
              </div>

              <div v-else-if="!selectedHistory.length" class="review-dialog__empty">
                {{ safeText('preschoolReviewForms.reviewQueue.empty.history', 'No review history yet.') }}
              </div>

              <ul v-else class="review-history-list">
                <li v-for="entry in selectedHistory" :key="entry.id">
                  <strong>{{ entry.action }}</strong>
                  <span>{{ userLabel(entry.actor) }}</span>
                  <span>{{ formatDate(entry.createdAt) }}</span>
                  <p>{{ entry.description }}</p>
                </li>
              </ul>
            </section>
          </div>

          <footer class="review-dialog__footer">
            <button type="button" class="review-action" @click="goToBuilder(selectedForm)">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.openBuilder', 'Open Builder') }}
            </button>
            <button
              v-if="selectedForm.reviewStatus === 'submitted'"
              type="button"
              class="review-action"
              :disabled="isActionSubmitting"
              @click="runStartReview(selectedForm)"
            >
              {{ safeText('preschoolReviewForms.reviewQueue.actions.startReview', 'Start review') }}
            </button>
            <button
              v-if="['submitted', 'in_review'].includes(selectedForm.reviewStatus)"
              type="button"
              class="review-action review-action--primary"
              @click="openActionDialog('approve', selectedForm)"
            >
              {{ safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve') }}
            </button>
            <button
              v-if="['submitted', 'in_review'].includes(selectedForm.reviewStatus)"
              type="button"
              class="review-action"
              @click="openActionDialog('reject', selectedForm)"
            >
              {{ safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject') }}
            </button>
          </footer>
        </section>
      </div>

      <div
        v-if="isActionDialogOpen && actionForm"
        class="review-dialog-backdrop"
        role="presentation"
        @click.self="closeActionDialog"
      >
        <section class="review-dialog review-dialog--small" role="dialog" aria-modal="true">
          <header class="review-dialog__header">
            <div>
              <p class="review-dialog__eyebrow">
                {{ actionMode === 'approve'
                  ? safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve')
                  : safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject') }}
              </p>
              <h3>{{ actionForm.name }}</h3>
            </div>
            <button type="button" class="review-dialog__close" @click="closeActionDialog">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.close', 'Close') }}
            </button>
          </header>

          <div class="review-dialog__form">
            <label class="review-field">
              <span>{{ safeText('preschoolReviewForms.reviewQueue.fields.reviewNotes', 'Review notes') }}</span>
              <textarea
                v-model="actionNotes"
                rows="4"
                :placeholder="safeText('preschoolReviewForms.reviewQueue.placeholders.reviewNotes', 'Add an optional review note')"
              />
            </label>

            <label v-if="actionMode === 'reject'" class="review-field">
              <span>{{ safeText('preschoolReviewForms.reviewQueue.fields.rejectionReason', 'Rejection reason') }}</span>
              <textarea
                v-model="actionReason"
                rows="4"
                :placeholder="safeText('preschoolReviewForms.reviewQueue.placeholders.rejectionReason', 'Explain what needs to change')"
              />
            </label>
          </div>

          <footer class="review-dialog__footer">
            <button type="button" class="review-action" @click="closeActionDialog">
              {{ safeText('preschoolReviewForms.reviewQueue.actions.cancel', 'Cancel') }}
            </button>
            <button
              type="button"
              class="review-action review-action--primary"
              :disabled="isActionSubmitting || (actionMode === 'reject' && !actionReason.trim())"
              @click="submitAction"
            >
              {{ isActionSubmitting
                ? safeText('preschoolReviewForms.reviewQueue.loadingAction', 'Saving...')
                : (actionMode === 'approve'
                  ? safeText('preschoolReviewForms.reviewQueue.actions.approve', 'Approve')
                  : safeText('preschoolReviewForms.reviewQueue.actions.reject', 'Reject')) }}
            </button>
          </footer>
        </section>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.preschool-review-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.review-summary-card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 1rem;
}

.review-summary-card p {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  color: #64748b;
}

.review-summary-card strong {
  font-size: 1.55rem;
  color: #0f172a;
}

.review-toolbar,
.review-table-card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  padding: 1rem;
}

.review-toolbar__filters {
  display: grid;
  gap: 0.85rem;
}

.review-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.review-field > span {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.02em;
}

.review-field input,
.review-field select,
.review-field textarea {
  width: 100%;
  border-radius: 0.85rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 0.75rem 0.85rem;
  font: inherit;
}

.review-field input:focus,
.review-field select:focus,
.review-field textarea:focus {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.review-toolbar__actions,
.review-dialog__footer,
.review-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-action,
.review-row-link,
.review-dialog__close {
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  padding: 0.55rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1;
}

.review-action--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.review-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.review-state,
.review-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 220px;
  text-align: center;
  color: #475569;
}

.review-state {
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: #eff6ff;
}

.review-state--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.review-table-wrap {
  overflow-x: auto;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.review-table th,
.review-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 0.65rem;
  vertical-align: top;
  text-align: left;
}

.review-table th {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.review-template-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.review-template-cell strong {
  color: #0f172a;
}

.review-template-cell span {
  font-size: 0.78rem;
  color: #64748b;
}

.review-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #e2e8f0;
  color: #334155;
}

.review-pill[data-tone='pending'] {
  background: #fef3c7;
  color: #92400e;
}

.review-pill[data-tone='review'] {
  background: #dbeafe;
  color: #1d4ed8;
}

.review-pill[data-tone='approved'] {
  background: #dcfce7;
  color: #166534;
}

.review-pill[data-tone='rejected'] {
  background: #fee2e2;
  color: #b91c1c;
}

.review-pill[data-tone='draft'] {
  background: #e2e8f0;
  color: #475569;
}

.review-row-link {
  padding-inline: 0.15rem;
  border: none;
  background: transparent;
  color: #2563eb;
}

.review-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.35);
  padding: 1rem;
}

.review-dialog {
  width: min(760px, 100%);
  height: 100%;
  border-radius: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
  overflow: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-dialog--small {
  width: min(560px, 100%);
  height: auto;
  align-self: center;
}

.review-dialog__header,
.review-dialog__card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.review-dialog__eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
}

.review-dialog__header h3,
.review-dialog__card h4 {
  margin: 0;
  color: #0f172a;
}

.review-dialog__header p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.review-dialog__grid {
  display: grid;
  gap: 0.85rem;
}

.review-dialog__card {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.95rem;
}

.review-dialog__card dl {
  display: grid;
  gap: 0.65rem;
  margin: 0.75rem 0 0;
}

.review-dialog__card dl div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.review-dialog__card dt {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.review-dialog__card dd {
  margin: 0;
  color: #0f172a;
  font-weight: 600;
}

.review-section-list,
.review-history-list {
  display: grid;
  gap: 0.65rem;
  margin: 0.75rem 0 0;
}

.review-section-item,
.review-history-list li {
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem;
}

.review-section-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.review-section-item span,
.review-history-list span,
.review-history-list p {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.review-dialog__empty {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.review-history-list li strong {
  display: block;
  color: #0f172a;
  margin-bottom: 0.15rem;
}

.review-dialog__form {
  display: grid;
  gap: 0.85rem;
}

.review-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .review-summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .review-toolbar__filters {
    grid-template-columns: minmax(0, 1fr) 260px auto;
    align-items: end;
  }

  .review-dialog__grid {
    grid-template-columns: 1.1fr 1fr;
  }

  .review-dialog__card--history {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .review-dialog-backdrop {
    padding: 0.5rem;
  }

  .review-dialog {
    height: calc(100vh - 1rem);
  }

  .review-table {
    min-width: 980px;
  }
}
</style>
