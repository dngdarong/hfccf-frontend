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
  createEnglishTask,
  deleteEnglishTask,
  fetchEnglishSubmissions,
  fetchTeacherClasses,
  fetchTeacherTasks,
  updateEnglishSubmission,
  updateEnglishTask,
} from '@/modules/english/services/englishApi'

defineOptions({
  name: 'EnglishTeacherHomeworkPage',
})

const { t, te } = useLanguage()

const searchQuery = ref('')
const statusFilter = ref('')
const classFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const tasks = ref([])
const classes = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const submissions = ref([])
const submissionPagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const submissionCurrentPage = ref(1)
const submissionLoading = ref(false)
const submissionErrorMessage = ref('')
const submissionStatusFilter = ref('')
const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)
const reviewModalOpen = ref(false)
const reviewSaving = ref(false)
const reviewTarget = ref(null)
const reviewForm = reactive({
  submission_status: 'reviewed',
  score: '',
  feedback: '',
})

const form = reactive({
  class_id: '',
  title: '',
  description: '',
  due_date: '',
  task_status: 'draft',
})

const statusOptions = computed(() => [
  { value: 'draft', label: t('english.common.status.draft') },
  { value: 'assigned', label: t('english.common.status.assigned') },
  { value: 'submitted', label: t('english.common.status.submitted') },
  { value: 'reviewed', label: t('english.common.status.reviewed') },
  { value: 'completed', label: t('english.common.status.completed') },
])

const submissionStatusOptions = computed(() => [
  { value: 'pending', label: t('english.common.status.pending') },
  { value: 'submitted', label: t('english.common.status.submitted') },
  { value: 'late', label: t('english.common.status.late') },
  { value: 'reviewed', label: t('english.common.status.reviewed') },
])

const tableColumns = computed(() => [
  { key: 'number', label: t('english.tasks.table.number'), align: 'left' },
  { key: 'title', label: t('english.tasks.table.task'), align: 'left' },
  { key: 'className', label: t('english.tasks.table.class'), align: 'left' },
  { key: 'dueDate', label: t('english.tasks.table.dueDate'), align: 'left' },
  { key: 'taskStatus', label: t('english.tasks.table.status'), align: 'left' },
  { key: 'submissionsCount', label: t('english.tasks.table.submissions'), align: 'left' },
  { key: 'actions', label: t('english.common.actions.actions'), align: 'right' },
])

const submissionColumns = computed(() => [
  { key: 'number', label: t('english.submissions.table.number'), align: 'left' },
  { key: 'studentName', label: t('english.submissions.table.student'), align: 'left' },
  { key: 'taskTitle', label: t('english.submissions.table.task'), align: 'left' },
  { key: 'className', label: t('english.submissions.table.class'), align: 'left' },
  { key: 'submissionStatus', label: t('english.submissions.table.status'), align: 'left' },
  { key: 'score', label: t('english.submissions.table.score'), align: 'left' },
  { key: 'reviewedByName', label: t('english.submissions.table.reviewedBy'), align: 'left' },
  { key: 'actions', label: t('english.common.actions.actions'), align: 'right' },
])

function localizedStatus(value) {
  const key = String(value || '').toLowerCase()
  const statusKey = `english.common.status.${key}`
  return te(statusKey) ? t(statusKey) : value || '-'
}

const mappedTasks = computed(() =>
  tasks.value.map((item) => ({
    ...item,
    title: item.title || '-',
    className: item.class?.name || '-',
    dueDate: item.dueDate || '-',
    taskStatusCode: item.taskStatus || '',
    taskStatus: localizedStatus(item.taskStatus),
    submissionsCount: item.submissionsCount ?? 0,
  })),
)

const classOptions = computed(() =>
  classes.value.map((item) => ({
    value: item.id,
    label: `${item.name || item.classCode || item.id} (${item.classCode || '-'})`,
  })),
)

const mappedSubmissions = computed(() =>
  submissions.value.map((item) => ({
    ...item,
    taskTitle: item.task?.title || '-',
    className: item.task?.class?.name || '-',
    studentName: item.student?.fullName || '-',
    score: item.score ?? '-',
    reviewedByName: item.reviewedByName || '-',
    submissionStatusCode: item.submissionStatus || '',
    submissionStatus: localizedStatus(item.submissionStatus),
  })),
)

function resetForm() {
  Object.assign(form, {
    class_id: '',
    title: '',
    description: '',
    due_date: '',
    task_status: 'draft',
  })
}

function openCreateModal() {
  modalMode.value = 'create'
  resetForm()
  modalOpen.value = true
}

function openEditModal(item, mode = 'edit') {
  modalMode.value = mode
  Object.assign(form, {
    class_id: item?.classId || '',
    title: item?.title || '',
    description: item?.description || '',
    due_date: item?.dueDate || '',
    task_status: item?.taskStatusCode || item?.taskStatus || 'draft',
  })
  deleteTarget.value = item || null
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  saving.value = false
}

function openReviewModal(item) {
  reviewTarget.value = item || null
  Object.assign(reviewForm, {
    submission_status: item?.submissionStatusCode || item?.submissionStatus || 'reviewed',
    score: item?.score ?? '',
    feedback: item?.feedback || '',
  })
  reviewModalOpen.value = true
}

function closeReviewModal() {
  reviewModalOpen.value = false
  reviewSaving.value = false
}

function normalizePayload() {
  return {
    class_id: form.class_id,
    title: form.title.trim(),
    description: form.description.trim() || null,
    due_date: form.due_date || null,
    task_status: form.task_status,
  }
}

async function loadClasses() {
  try {
    const response = await fetchTeacherClasses({ perPage: 100, status: 'active' })
    classes.value = response.items || []
  } catch {
    classes.value = []
  }
}

async function loadTasks() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTeacherTasks({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
      class_id: classFilter.value,
    })

    tasks.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    tasks.value = []
    errorMessage.value = error?.message || t('english.tasks.messages.loadError')
  } finally {
    loading.value = false
  }
}

async function loadSubmissions() {
  submissionLoading.value = true
  submissionErrorMessage.value = ''

  try {
    const response = await fetchEnglishSubmissions({
      page: submissionCurrentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: submissionStatusFilter.value,
      class_id: classFilter.value,
    })

    submissions.value = response.items || []
    submissionPagination.value = response.pagination || submissionPagination.value
  } catch (error) {
    submissions.value = []
    submissionErrorMessage.value = error?.message || t('english.submissions.messages.loadError')
  } finally {
    submissionLoading.value = false
  }
}

async function onSaveTask() {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload = normalizePayload()
    if (modalMode.value === 'edit' && deleteTarget.value?.id) {
      await updateEnglishTask(deleteTarget.value.id, payload)
      successMessage.value = t('english.tasks.messages.updateSuccess')
    } else {
      await createEnglishTask(payload)
      successMessage.value = t('english.tasks.messages.createSuccess')
    }

    showSuccess.value = true
    closeModal()
    await loadTasks()
  } catch (error) {
    errorMessage.value = error?.message || t('english.tasks.messages.saveError')
  } finally {
    saving.value = false
  }
}

async function onSaveReview() {
  reviewSaving.value = true
  submissionErrorMessage.value = ''

  try {
    const submissionId = String(reviewTarget.value?.id || '').trim()
    if (!submissionId) return

    await updateEnglishSubmission(submissionId, {
      submission_status: reviewForm.submission_status,
      score: reviewForm.score === '' ? null : Number(reviewForm.score),
      feedback: reviewForm.feedback.trim() || null,
    })

    successMessage.value = t('english.submissions.messages.reviewSuccess')
    showSuccess.value = true
    closeReviewModal()
    await loadSubmissions()
  } catch (error) {
    submissionErrorMessage.value = error?.message || t('english.submissions.messages.reviewError')
  } finally {
    reviewSaving.value = false
  }
}

function onViewTask(item) {
  openEditModal(item, 'view')
}

function onEditTask(item) {
  openEditModal(item, 'edit')
}

function onDeleteTask(item) {
  deleteTarget.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  const id = String(deleteTarget.value?.id || '').trim()
  if (!id) return

  try {
    await deleteEnglishTask(id)
    successMessage.value = t('english.tasks.messages.deleteSuccess')
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadTasks()
  } catch (error) {
    errorMessage.value = error?.message || t('english.tasks.messages.deleteError')
  }
}

watch([searchQuery, classFilter], () => {
  currentPage.value = 1
  loadTasks()
  submissionCurrentPage.value = 1
  loadSubmissions()
})

watch(statusFilter, () => {
  currentPage.value = 1
  loadTasks()
})

watch(currentPage, () => {
  loadTasks()
})

watch([submissionCurrentPage, submissionStatusFilter], () => {
  loadSubmissions()
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadTasks(), loadSubmissions()])
})
</script>

<template>
  <MainLayout>
    <section class="english-homework-page">
      <HeaderSection
        :title="t('english.tasks.teacherTitle')"
        :subtitle="t('english.tasks.teacherSubtitle')"
      />

      <div class="english-homework-page__shell">
        <div class="english-homework-page__toolbar">
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            {{ t('english.tasks.actions.add') }}
          </Button>
        </div>

        <div class="english-homework-page__filters">
          <input v-model="searchQuery" class="english-homework-page__input" type="search" :placeholder="t('english.tasks.placeholders.search')" />
          <select v-model="classFilter" class="english-homework-page__input">
            <option value="">{{ t('english.common.filters.allClasses') }}</option>
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="statusFilter" class="english-homework-page__input">
            <option value="">{{ t('english.common.filters.allStatus') }}</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedTasks"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('english.tasks.empty')"
          @view="onViewTask"
          @edit="onEditTask"
          @delete="onDeleteTask"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>

      <div class="english-homework-page__shell">
        <div class="english-homework-page__panel-header">
          <h2 class="english-homework-page__panel-title">{{ t('english.submissions.panel.title') }}</h2>
          <span class="english-homework-page__panel-caption">{{ t('english.submissions.panel.caption') }}</span>
        </div>

        <div class="english-homework-page__filters">
          <input v-model="searchQuery" class="english-homework-page__input" type="search" :placeholder="t('english.submissions.placeholders.search')" />
          <select v-model="classFilter" class="english-homework-page__input">
            <option value="">{{ t('english.common.filters.allClasses') }}</option>
            <option v-for="option in classOptions" :key="`submission-class-${option.value}`" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="submissionStatusFilter" class="english-homework-page__input">
            <option value="">{{ t('english.common.filters.allStatus') }}</option>
            <option v-for="option in submissionStatusOptions" :key="`submission-status-${option.value}`" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div
          v-if="submissionErrorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ submissionErrorMessage }}
        </div>

        <Table
          :rows="mappedSubmissions"
          :columns="submissionColumns"
          :loading="submissionLoading"
          :empty-text="t('english.submissions.empty')"
          :show-view-action="false"
          :show-delete-action="false"
          @edit="openReviewModal"
        />

        <div v-if="submissionPagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="submissionCurrentPage" :total-pages="submissionPagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="modalOpen"
      :header="modalMode === 'view' ? t('english.tasks.dialogs.viewTitle') : modalMode === 'edit' ? t('english.tasks.dialogs.editTitle') : t('english.tasks.dialogs.createTitle')"
      modal
      class="english-homework-page__dialog"
    >
      <div class="english-homework-page__dialog-grid">
        <select v-model="form.class_id" class="english-homework-page__input" :disabled="modalMode === 'view'">
          <option value="">{{ t('english.tasks.placeholders.class') }}</option>
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input v-model="form.title" class="english-homework-page__input" type="text" :placeholder="t('english.tasks.placeholders.title')" :disabled="modalMode === 'view'" />
        <input v-model="form.due_date" class="english-homework-page__input" type="date" :disabled="modalMode === 'view'" />
        <select v-model="form.task_status" class="english-homework-page__input" :disabled="modalMode === 'view'">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <textarea v-model="form.description" class="english-homework-page__input english-homework-page__dialog-full" rows="4" :placeholder="t('english.tasks.placeholders.description')" :disabled="modalMode === 'view'"></textarea>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">{{ t('english.common.actions.close') }}</Button>
        <Button v-if="modalMode !== 'view'" type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="onSaveTask">
          {{ t('english.common.actions.save') }}
        </Button>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="reviewModalOpen"
      :header="t('english.submissions.dialogs.reviewTitle')"
      modal
      class="english-homework-page__dialog"
    >
      <div class="english-homework-page__dialog-grid">
        <input
          v-model="reviewForm.score"
          class="english-homework-page__input"
          type="number"
          min="0"
          max="100"
          step="1"
          :placeholder="t('english.submissions.placeholders.score')"
        >
        <select v-model="reviewForm.submission_status" class="english-homework-page__input">
          <option v-for="option in submissionStatusOptions" :key="`review-status-${option.value}`" :value="option.value">{{ option.label }}</option>
        </select>
        <textarea
          v-model="reviewForm.feedback"
          class="english-homework-page__input english-homework-page__dialog-full"
          rows="4"
          :placeholder="t('english.submissions.placeholders.feedback')"
        ></textarea>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeReviewModal">{{ t('english.common.actions.close') }}</Button>
        <Button type="button" variant="primary" rounded="xl" :loading="reviewSaving" :disabled="reviewSaving" @click="onSaveReview">
          {{ t('english.submissions.actions.saveReview') }}
        </Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="deleteOpen"
      :title="t('english.tasks.confirm.deleteTitle')"
      :message="t('english.tasks.confirm.deleteMessage', { name: deleteTarget?.title || t('english.tasks.confirm.fallbackName') })"
      :confirm-text="t('english.common.actions.delete')"
      :cancel-text="t('english.common.actions.cancel')"
      type="danger"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('english.common.feedback.success')"
      :message="successMessage"
      :button-text="t('english.common.actions.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.english-homework-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-homework-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-homework-page__panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.english-homework-page__panel-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.english-homework-page__panel-caption {
  font-size: 0.85rem;
  color: #64748b;
}

.english-homework-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.english-homework-page__filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.english-homework-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.english-homework-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 48rem);
}

.english-homework-page__dialog-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .english-homework-page__filters,
  .english-homework-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}
</style>
