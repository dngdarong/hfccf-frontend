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
import { createEnglishTask, deleteEnglishTask, fetchEnglishClasses, fetchEnglishTasks, updateEnglishTask } from '@/modules/english/services/englishApi'

defineOptions({
  name: 'EnglishTaskManagementPage',
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
const modalOpen = ref(false)
const modalMode = ref('create')
const saving = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)

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

const tableColumns = computed(() => [
  { key: 'number', label: t('english.tasks.table.number'), align: 'left' },
  { key: 'title', label: t('english.tasks.table.task'), align: 'left' },
  { key: 'className', label: t('english.tasks.table.class'), align: 'left' },
  { key: 'assignedByName', label: t('english.tasks.table.assignedBy'), align: 'left' },
  { key: 'dueDate', label: t('english.tasks.table.dueDate'), align: 'left' },
  { key: 'taskStatus', label: t('english.tasks.table.status'), align: 'left' },
  { key: 'submissionsCount', label: t('english.tasks.table.submissions'), align: 'left' },
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
    assignedByName: item.assignedByName || '-',
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
    const response = await fetchEnglishClasses({ perPage: 100, status: 'active' })
    classes.value = response.items || []
  } catch {
    classes.value = []
  }
}

async function loadTasks() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchEnglishTasks({
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

watch([searchQuery, statusFilter, classFilter], () => {
  currentPage.value = 1
  loadTasks()
})

watch(currentPage, () => {
  loadTasks()
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadTasks()])
})
</script>

<template>
  <MainLayout>
    <section class="english-tasks-page">
      <HeaderSection
        :title="t('english.tasks.title')"
        :subtitle="t('english.tasks.subtitle')"
      />

      <div class="english-tasks-page__panel">
        <div class="english-tasks-page__toolbar">
          <Button type="button" variant="primary" size="md" rounded="xl" @click="openCreateModal">
            {{ t('english.tasks.actions.add') }}
          </Button>
        </div>

        <div class="english-tasks-page__filters">
          <input v-model="searchQuery" class="english-tasks-page__input" type="search" :placeholder="t('english.tasks.placeholders.search')" />
          <select v-model="classFilter" class="english-tasks-page__input">
            <option value="">{{ t('english.common.filters.allClasses') }}</option>
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="statusFilter" class="english-tasks-page__input">
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
    </section>

    <Dialog
      v-model:visible="modalOpen"
      :header="modalMode === 'view' ? t('english.tasks.dialogs.viewTitle') : modalMode === 'edit' ? t('english.tasks.dialogs.editTitle') : t('english.tasks.dialogs.createTitle')"
      modal
      class="english-tasks-page__dialog"
    >
      <div class="english-tasks-page__dialog-grid">
        <select v-model="form.class_id" class="english-tasks-page__input" :disabled="modalMode === 'view'">
          <option value="">{{ t('english.tasks.placeholders.class') }}</option>
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <input v-model="form.title" class="english-tasks-page__input" type="text" :placeholder="t('english.tasks.placeholders.title')" :disabled="modalMode === 'view'" />
        <input v-model="form.due_date" class="english-tasks-page__input" type="date" :disabled="modalMode === 'view'" />
        <select v-model="form.task_status" class="english-tasks-page__input" :disabled="modalMode === 'view'">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <textarea v-model="form.description" class="english-tasks-page__input english-tasks-page__dialog-full" rows="4" :placeholder="t('english.tasks.placeholders.description')" :disabled="modalMode === 'view'"></textarea>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">{{ t('english.common.actions.close') }}</Button>
        <Button v-if="modalMode !== 'view'" type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="onSaveTask">
          {{ t('english.common.actions.save') }}
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
.english-tasks-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-tasks-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-tasks-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.english-tasks-page__filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.english-tasks-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.english-tasks-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 48rem);
}

.english-tasks-page__dialog-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .english-tasks-page__filters,
  .english-tasks-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }
}
</style>
