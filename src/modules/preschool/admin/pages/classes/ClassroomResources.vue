<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchClassroomResources,
  createClassroomResource,
  updateClassroomResource,
  deleteClassroomResource,
  fetchClassroomResourceRequests,
  approveClassroomResourceRequest,
  rejectClassroomResourceRequest,
} from '@/modules/preschool/services/preschoolApi'
import {
  PAGE_SIZE,
  DEFAULT_PAGINATION,
  DEFAULT_FORM,
  MODAL_MODES,
} from './constants/classroomResourcesConstants'
import {
  buildCategoryOptions,
  buildConditionOptions,
  buildTableColumns,
  mapResources,
  calculateSummaries,
  validateForm,
  buildPayload,
  loadResourceFormIntoFormObject,
  resetFormState,
  extractResourcesFromResponse,
  extractPaginationFromResponse,
} from './utils/classroomResourcesHelpers'

defineOptions({
  name: 'PreschoolAdminClassroomResourcesPage',
})

const { t } = useLanguage()

const searchQuery = ref('')
const categoryFilter = ref('')
const conditionFilter = ref('')
const currentPage = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const resources = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION })

const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const editingId = ref(null)

const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)

const form = reactive({ ...DEFAULT_FORM })

const formError = ref('')

const activeTab = ref('resources')
const requests = ref([])
const requestsLoading = ref(false)
const requestsErrorMessage = ref('')
const requestStatusFilter = ref('')
const selectedRequest = ref(null)
const requestActionDialogOpen = ref(false)
const requestActionMode = ref('approve')
const requestActionLoading = ref(false)
const requestActionNotes = reactive({ notes: '' })

const categoryOptions = computed(() => buildCategoryOptions(t))

const conditionOptions = computed(() => buildConditionOptions(t))

const tableColumns = computed(() => buildTableColumns(t))

const mappedResources = computed(() => mapResources(resources.value, t, currentPage.value))

const summaries = computed(() => calculateSummaries(resources.value))
const summaryTotal = computed(() => pagination.value.total || summaries.value.total)
const summaryGood = computed(() => summaries.value.good)
const summaryAttention = computed(() => summaries.value.attention)

const requestTableColumns = computed(() => [
  { key: 'number', label: t('preschoolResourceRequests.columns.resource'), align: 'left' },
  { key: 'resource_name', label: t('preschoolResourceRequests.columns.resource'), align: 'left' },
  { key: 'teacher_name', label: t('preschoolResourceRequests.columns.teacher'), align: 'left' },
  { key: 'class_name', label: t('preschoolResourceRequests.columns.class'), align: 'left' },
  { key: 'statusLabel', label: t('preschoolResourceRequests.columns.status'), align: 'left' },
  { key: 'requestedAtLabel', label: t('preschoolResourceRequests.columns.requestedDate'), align: 'left' },
  { key: 'action', label: t('preschoolResourceRequests.columns.action'), align: 'center' },
])

const mappedRequests = computed(() =>
  requests.value.map((req, i) => ({
    ...req,
    number: i + 1,
    statusLabel: t(`preschoolResourceRequests.statuses.${req.status}`),
    requestedAtLabel: req.requested_at ? new Date(req.requested_at).toLocaleDateString() : '—',
  })),
)

async function loadResources() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchClassroomResources({
      page: currentPage.value,
      perPage: PAGE_SIZE,
      search: searchQuery.value,
      category: categoryFilter.value,
      condition: conditionFilter.value,
    })
    resources.value = extractResourcesFromResponse(response)
    pagination.value = extractPaginationFromResponse(response, pagination.value)
  } catch (error) {
    resources.value = []
    errorMessage.value = error?.message || t('preschoolClassroomResources.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

async function loadRequests() {
  requestsLoading.value = true
  requestsErrorMessage.value = ''

  try {
    const response = await fetchClassroomResourceRequests({
      page: 1,
      perPage: 100,
      status: requestStatusFilter.value,
    })
    requests.value = response.items || []
  } catch (error) {
    requests.value = []
    console.error('Failed to load classroom resource requests:', error)
    if (error?.response?.status === 500) {
      console.error('Server error - the resource requests endpoint may have a configuration issue')
      requestsErrorMessage.value = 'Server error loading requests. Please check the server logs.'
    } else {
      requestsErrorMessage.value = error?.message || t('preschoolResourceRequests.messages.actionFailed')
    }
  } finally {
    requestsLoading.value = false
  }
}

function openApproveDialog(request) {
  selectedRequest.value = request
  requestActionMode.value = 'approve'
  requestActionNotes.notes = ''
  requestActionDialogOpen.value = true
}

function openRejectDialog(request) {
  selectedRequest.value = request
  requestActionMode.value = 'reject'
  requestActionNotes.notes = ''
  requestActionDialogOpen.value = true
}

async function submitRequestAction() {
  if (!selectedRequest.value) return

  requestActionLoading.value = true

  try {
    if (requestActionMode.value === 'approve') {
      await approveClassroomResourceRequest(selectedRequest.value.id, {
        notes: requestActionNotes.notes,
      })
      successMessage.value = t('preschoolResourceRequests.messages.approvedSuccess')
    } else {
      await rejectClassroomResourceRequest(selectedRequest.value.id, {
        rejection_reason: requestActionNotes.notes,
      })
      successMessage.value = t('preschoolResourceRequests.messages.rejectedSuccess')
    }

    showSuccess.value = true
    requestActionDialogOpen.value = false
    selectedRequest.value = null

    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    await loadRequests()
  } catch (error) {
    requestsErrorMessage.value = error?.message || t('preschoolResourceRequests.messages.actionFailed')
  } finally {
    requestActionLoading.value = false
  }
}

function resetForm() {
  resetFormState(form)
  formError.value = ''
}

function checkFormValidity() {
  const result = validateForm(form, t)
  formError.value = result.error
  return result.valid
}

function openCreateModal() {
  modalMode.value = MODAL_MODES.CREATE
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEditModal(resource) {
  modalMode.value = MODAL_MODES.EDIT
  editingId.value = resource.id
  loadResourceFormIntoFormObject(resource, form)
  formError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  saving.value = false
}

async function onSave() {
  if (!checkFormValidity()) return

  saving.value = true
  errorMessage.value = ''

  try {
    const payload = buildPayload(form)

    if (modalMode.value === MODAL_MODES.EDIT) {
      await updateClassroomResource(editingId.value, payload)
      successMessage.value = t('preschoolClassroomResources.messages.updateSuccess')
    } else {
      await createClassroomResource(payload)
      successMessage.value = t('preschoolClassroomResources.messages.createSuccess')
    }

    showSuccess.value = true
    closeModal()
    await loadResources()
  } catch (error) {
    formError.value = error?.message || t('preschoolClassroomResources.messages.saveFailed')
  } finally {
    saving.value = false
  }
}

function onDelete(resource) {
  deleteTarget.value = resource
  deleteOpen.value = true
}

async function confirmDelete() {
  try {
    await deleteClassroomResource(deleteTarget.value?.id)
    successMessage.value = t('preschoolClassroomResources.messages.deleteSuccess')
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadResources()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolClassroomResources.messages.deleteFailed')
  }
}

watch([searchQuery, categoryFilter, conditionFilter], () => {
  currentPage.value = 1
  loadResources()
})

watch(currentPage, () => {
  loadResources()
})

watch(requestStatusFilter, () => {
  loadRequests()
})

onMounted(async () => {
  await loadResources()
  await loadRequests()
})
</script>

<template>
  <MainLayout>
    <section class="classroom-resources">
      <HeaderSection
        :title="t('preschoolClassroomResources.title')"
        :subtitle="t('preschoolClassroomResources.subtitle')"
      />

      <!-- summary strip -->
      <div v-if="activeTab === 'resources'" class="classroom-resources__summary">
        <div class="classroom-resources__summary-card">
          <span class="classroom-resources__summary-value">{{ summaryTotal }}</span>
          <span class="classroom-resources__summary-label">{{ t('preschoolClassroomResources.summary.total') }}</span>
        </div>
        <div class="classroom-resources__summary-card classroom-resources__summary-card--good">
          <span class="classroom-resources__summary-value">{{ summaryGood }}</span>
          <span class="classroom-resources__summary-label">{{ t('preschoolClassroomResources.summary.goodCondition') }}</span>
        </div>
        <div class="classroom-resources__summary-card classroom-resources__summary-card--warn">
          <span class="classroom-resources__summary-value">{{ summaryAttention }}</span>
          <span class="classroom-resources__summary-label">{{ t('preschoolClassroomResources.summary.needsAttention') }}</span>
        </div>
      </div>

      <!-- tabs -->
      <div class="classroom-resources__tabs">
        <button
          :class="['classroom-resources__tab', { 'classroom-resources__tab--active': activeTab === 'resources' }]"
          @click="activeTab = 'resources'"
        >
          {{ t('preschoolClassroomResources.title') }}
        </button>
        <button
          :class="['classroom-resources__tab', { 'classroom-resources__tab--active': activeTab === 'requests' }]"
          @click="activeTab = 'requests'"
        >
          {{ t('preschoolResourceRequests.title') }}
        </button>
      </div>

      <!-- main panel -->
      <div v-if="activeTab === 'resources'" class="classroom-resources__panel">

        <!-- toolbar -->
        <div class="classroom-resources__toolbar">
          <div class="classroom-resources__toolbar-meta">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
              {{ t('preschoolClassroomResources.summary.total') }}
            </p>
            <p class="text-2xl font-bold text-slate-900 leading-none">{{ summaryTotal }}</p>
          </div>
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            {{ t('preschoolClassroomResources.addButton') }}
          </Button>
        </div>

        <!-- filters -->
        <div class="classroom-resources__filters">
          <div class="classroom-resources__search-wrap">
            <svg class="classroom-resources__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              class="classroom-resources__input classroom-resources__input--search"
              type="search"
              :placeholder="t('preschoolClassroomResources.searchPlaceholder')"
            />
          </div>
          <select v-model="categoryFilter" class="classroom-resources__input">
            <option value="">{{ t('preschoolClassroomResources.filters.allCategories') }}</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select v-model="conditionFilter" class="classroom-resources__input">
            <option value="">{{ t('preschoolClassroomResources.filters.allConditions') }}</option>
            <option v-for="opt in conditionOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- page-level error -->
        <div v-if="errorMessage && !modalOpen" class="classroom-resources__error">
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedResources"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="searchQuery || categoryFilter || conditionFilter
            ? t('preschoolClassroomResources.messages.noResults')
            : t('preschoolClassroomResources.messages.empty')"
          @edit="openEditModal"
          @delete="onDelete"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>

      <!-- requests tab panel -->
      <div v-if="activeTab === 'requests'" class="classroom-resources__panel">
        <div class="classroom-resources__filters">
          <select v-model="requestStatusFilter" class="classroom-resources__input">
            <option value="">{{ t('preschoolResourceRequests.title') }} - All Statuses</option>
            <option value="pending">{{ t('preschoolResourceRequests.statuses.pending') }}</option>
            <option value="approved">{{ t('preschoolResourceRequests.statuses.approved') }}</option>
            <option value="rejected">{{ t('preschoolResourceRequests.statuses.rejected') }}</option>
          </select>
        </div>

        <div v-if="requestsErrorMessage" class="classroom-resources__error">
          {{ requestsErrorMessage }}
        </div>

        <Table
          :rows="mappedRequests"
          :columns="requestTableColumns"
          :loading="requestsLoading"
          :empty-text="t('preschoolResourceRequests.messages.empty')"
        >
          <template #action="{ row }">
            <div v-if="row.status === 'pending'" class="flex gap-2">
              <Button
                size="sm"
                variant="success"
                :label="t('preschoolResourceRequests.actions.approve')"
                @click="openApproveDialog(row)"
              />
              <Button
                size="sm"
                variant="danger"
                :label="t('preschoolResourceRequests.actions.reject')"
                @click="openRejectDialog(row)"
              />
            </div>
            <span v-else class="text-sm font-semibold" :class="{
              'text-green-600': row.status === 'approved',
              'text-red-600': row.status === 'rejected'
            }">
              {{ row.statusLabel }}
            </span>
          </template>
        </Table>
      </div>
    </section>

    <!-- add / edit dialog -->
    <Dialog
      v-model:visible="modalOpen"
      :header="modalMode === MODAL_MODES.EDIT
        ? t('preschoolClassroomResources.dialog.editTitle')
        : t('preschoolClassroomResources.dialog.createTitle')"
      modal
      class="classroom-resources__dialog"
    >
      <div class="classroom-resources__form">

        <!-- name -->
        <div class="classroom-resources__field">
          <label class="classroom-resources__label">{{ t('preschoolClassroomResources.dialog.name') }}</label>
          <input
            v-model="form.name"
            class="classroom-resources__input"
            type="text"
            :placeholder="t('preschoolClassroomResources.dialog.namePlaceholder')"
          />
        </div>

        <!-- category + condition -->
        <div class="classroom-resources__row">
          <div class="classroom-resources__field">
            <label class="classroom-resources__label">{{ t('preschoolClassroomResources.dialog.category') }}</label>
            <select v-model="form.category" class="classroom-resources__input">
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="classroom-resources__field">
            <label class="classroom-resources__label">{{ t('preschoolClassroomResources.dialog.condition') }}</label>
            <select v-model="form.condition" class="classroom-resources__input">
              <option v-for="opt in conditionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- quantity -->
        <div class="classroom-resources__field">
          <label class="classroom-resources__label">{{ t('preschoolClassroomResources.dialog.quantity') }}</label>
          <input
            v-model.number="form.quantity"
            class="classroom-resources__input"
            type="number"
            min="0"
          />
        </div>

        <!-- notes -->
        <div class="classroom-resources__field">
          <label class="classroom-resources__label">{{ t('preschoolClassroomResources.dialog.notes') }}</label>
          <textarea
            v-model="form.notes"
            class="classroom-resources__input"
            rows="3"
            :placeholder="t('preschoolClassroomResources.dialog.notesPlaceholder')"
          />
        </div>

        <p v-if="formError" class="classroom-resources__form-error">{{ formError }}</p>
      </div>

      <template #footer>
        <Button type="button" variant="ghost" rounded="xl" @click="closeModal">
          {{ t('preschoolClassroomResources.dialog.cancel') }}
        </Button>
        <Button type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="onSave">
          {{ t('preschoolClassroomResources.dialog.save') }}
        </Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="deleteOpen"
      :title="t('preschoolClassroomResources.alerts.deleteTitle')"
      :message="t('preschoolClassroomResources.alerts.deleteMessage', {
        name: deleteTarget?.name || t('preschoolClassroomResources.alerts.deleteFallback'),
      })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolClassroomResources.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolClassroomResources.alerts.close')"
      @close="showSuccess = false"
    />

    <!-- request action dialog -->
    <Dialog
      v-model:visible="requestActionDialogOpen"
      :header="requestActionMode === 'approve' ? t('preschoolResourceRequests.dialogs.approveTitle') : t('preschoolResourceRequests.dialogs.rejectTitle')"
      modal
      :closable="true"
    >
      <div v-if="selectedRequest" class="space-y-4">
        <p><strong>{{ t('preschoolResourceRequests.columns.resource') }}:</strong> {{ selectedRequest.resource_name }}</p>
        <p><strong>{{ t('preschoolResourceRequests.columns.teacher') }}:</strong> {{ selectedRequest.teacher_name }}</p>
        <p><strong>{{ t('preschoolResourceRequests.columns.class') }}:</strong> {{ selectedRequest.class_name }}</p>

        <div class="space-y-2">
          <label class="block font-semibold text-sm">
            {{ requestActionMode === 'approve' ? t('preschoolResourceRequests.dialogs.approvalNotes') : t('preschoolResourceRequests.dialogs.rejectionReason') }}
          </label>
          <textarea
            v-model="requestActionNotes.notes"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            rows="3"
            :placeholder="requestActionMode === 'approve' ? 'Optional notes...' : 'Please provide a reason...'"
          />
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('common.cancel')"
          variant="secondary"
          @click="requestActionDialogOpen = false"
        />
        <Button
          :label="requestActionMode === 'approve' ? t('preschoolResourceRequests.actions.approve') : t('preschoolResourceRequests.actions.reject')"
          :variant="requestActionMode === 'approve' ? 'success' : 'danger'"
          :loading="requestActionLoading"
          @click="submitRequestAction"
        />
      </template>
    </Dialog>
  </MainLayout>
</template>

<style scoped>
.classroom-resources {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

/* summary strip */
.classroom-resources__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.classroom-resources__summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
}

.classroom-resources__summary-card--good {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, rgba(240,253,244,0.95) 0%, rgba(220,252,231,0.6) 100%);
}

.classroom-resources__summary-card--warn {
  border-color: #fde68a;
  background: linear-gradient(180deg, rgba(255,251,235,0.95) 0%, rgba(254,243,199,0.6) 100%);
}

.classroom-resources__summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.classroom-resources__summary-label {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

/* main panel */
.classroom-resources__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.classroom-resources__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.classroom-resources__toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.classroom-resources__filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.75rem;
}

.classroom-resources__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.classroom-resources__search-icon {
  position: absolute;
  left: 0.7rem;
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.classroom-resources__input--search {
  padding-left: 2.2rem;
}

.classroom-resources__error {
  padding: 0.65rem 1rem;
  border-radius: 0.7rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
}

/* shared input */
.classroom-resources__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.classroom-resources__input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

/* dialog form */
.classroom-resources__form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: min(100vw - 2rem, 30rem);
}

.classroom-resources__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.classroom-resources__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.classroom-resources__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.classroom-resources__form-error {
  font-size: 0.8rem;
  color: #e11d48;
  margin: 0;
}

.classroom-resources__tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #dce6f2;
  margin: 0;
  padding: 0;
}

.classroom-resources__tab {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.classroom-resources__tab:hover {
  color: #0f172a;
}

.classroom-resources__tab--active {
  color: #0f172a;
  border-bottom-color: #7c3aed;
}

@media (max-width: 768px) {
  .classroom-resources__filters,
  .classroom-resources__summary {
    grid-template-columns: 1fr;
  }

  .classroom-resources__row {
    grid-template-columns: 1fr;
  }
}
</style>
