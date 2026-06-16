<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import { mapUsers } from '@/services/mappers/userMapper'
import {
  deletePreschoolTeacher,
  fetchPreschoolTeachers,
} from '@/modules/preschool/services/preschoolApi'
import { PAGE_SIZE, ADD_TEACHER_PATH, STATUS_OPTIONS, DEFAULT_PAGINATION } from './constants/teacherManagementConstants'
import { buildTableColumns } from './utils/teacherManagementHelpers'

defineOptions({
  name: 'PreschoolAdminTeachersPage',
})

const router = useRouter()
const { t } = useLanguage()

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const teachers = ref([])
const pagination = ref({ ...DEFAULT_PAGINATION })
const loading = ref(false)
const errorMessage = ref('')
const isDeleteOpen = ref(false)
const selectedTeacher = ref(null)
const showSuccess = ref(false)
const successMessage = ref('')

const tableColumns = computed(() => buildTableColumns(t))

const statusOptions = computed(() => STATUS_OPTIONS)

const addTeacherLabel = computed(() => t('preschoolTeachersManagement.addButtonLabel'))

const addTeacherCaption = computed(() => t('preschoolTeachersManagement.addButtonCaption'))

const mappedTeachers = computed(() =>
  mapUsers(teachers.value).map((teacher) => ({
    ...teacher,
    permissions: Array.isArray(teacher.permissions) ? teacher.permissions : [],
  })),
)

function goToAddTeacher() {
  router.push({ path: ADD_TEACHER_PATH })
}

async function loadTeachers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolTeachers({
      page: currentPage.value,
      perPage: PAGE_SIZE,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    teachers.value = Array.isArray(response.items) ? response.items : []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    teachers.value = []
    pagination.value = {
      page: 1,
      perPage: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    }
    errorMessage.value = error?.message || t('preschoolTeachersManagement.loadFailed')
  } finally {
    loading.value = false
  }
}

function onViewUser(user) {
  const id = String(user?.id || '').trim()
  if (!id) return
  router.push(`/module/preschool-admin/users/${id}`)
}

function onEditUser(user) {
  const id = String(user?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/preschool-admin/users/add', query: { mode: 'edit', id } })
}

function onDeleteUser(user) {
  selectedTeacher.value = user || null
  if (!selectedTeacher.value?.id) return
  isDeleteOpen.value = true
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedTeacher.value = null
}

async function onConfirmDelete() {
  const id = String(selectedTeacher.value?.id || '').trim()
  if (!id) return

  try {
    await deletePreschoolTeacher(id)
    successMessage.value = t('preschoolTeachersManagement.deletedSuccess')
    showSuccess.value = true
    onCancelDelete()
    await loadTeachers()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolTeachersManagement.deleteFailed')
  }
}

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  loadTeachers()
})

watch(currentPage, () => {
  loadTeachers()
})

onMounted(() => {
  loadTeachers()
})
</script>

<template>
  <MainLayout>
    <section class="preschool-users-page">
      <HeaderSection
        :title="t('preschoolTeachersManagement.title')"
        :subtitle="t('preschoolTeachersManagement.subtitle')"
      />

      <div class="preschool-users-page__panel">

        <!-- toolbar: count meta + add button -->
        <div class="preschool-users-page__toolbar">
          <div class="preschool-users-page__toolbar-meta">
            <p class="preschool-users-page__toolbar-eyebrow">
              {{ t('preschoolTeachersManagement.summary.total') }}
            </p>
            <p class="preschool-users-page__toolbar-count">
              {{ pagination.total }}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            rounded="xl"
            class="preschool-users-page__add-button"
            @click="goToAddTeacher"
          >
            <template #iconLeft>
              <span class="preschool-users-page__add-button-icon" aria-hidden="true">
                <i class="pi pi-user-plus text-sm" />
              </span>
            </template>
            <span class="preschool-users-page__add-button-content">
              <span class="preschool-users-page__add-button-label">{{ addTeacherLabel }}</span>
              <span class="preschool-users-page__add-button-caption">{{ addTeacherCaption }}</span>
            </span>
            <span class="preschool-users-page__add-button-trailing" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
          </Button>
        </div>

        <!-- search + status filter -->
        <div class="preschool-users-page__filters">
          <div class="preschool-users-page__search-wrap">
            <svg class="preschool-users-page__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              class="preschool-users-page__input preschool-users-page__input--search"
              type="search"
              :placeholder="t('preschoolTeachersManagement.searchPlaceholder')"
            />
          </div>
          <select
            v-model="statusFilter"
            class="preschool-users-page__input preschool-users-page__input--select"
          >
            <option value="">{{ t('common.allStatus') }}</option>
            <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedTeachers"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('preschoolTeachersManagement.tableEmpty')"
          @view="onViewUser"
          @edit="onEditUser"
          @delete="onDeleteUser"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <AlertQuestion
      :show="isDeleteOpen"
      :title="t('preschoolTeachersManagement.deleteConfirmTitle')"
      :message="t('preschoolTeachersManagement.deleteConfirmMessage', { name: selectedTeacher?.name || selectedTeacher?.fullName || 'this teacher' })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolTeachersManagement.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolTeachersManagement.closeButton')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.preschool-users-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.preschool-users-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.96) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.45);
}

.preschool-users-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.preschool-users-page__toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.preschool-users-page__toolbar-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0369a1;
  margin: 0;
}

.preschool-users-page__toolbar-count {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  margin: 0;
}

.preschool-users-page__filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preschool-users-page__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.preschool-users-page__search-icon {
  position: absolute;
  left: 0.7rem;
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.preschool-users-page__input {
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

.preschool-users-page__input:focus {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.preschool-users-page__input--search {
  padding-left: 2.2rem;
}

.preschool-users-page__input--select {
  width: auto;
  min-width: 10rem;
  cursor: pointer;
}

.preschool-users-page__add-button {
  min-width: 15rem;
  justify-content: space-between;
  padding-inline: 0.95rem 1rem;
  box-shadow: 0 20px 36px -24px rgba(0, 174, 239, 0.58);
}

.preschool-users-page__add-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.preschool-users-page__add-button-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  line-height: 1.15;
  text-align: left;
}

.preschool-users-page__add-button-label {
  font-weight: 800;
  letter-spacing: 0.01em;
}

.preschool-users-page__add-button-caption {
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.84;
}

.preschool-users-page__add-button-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.26);
}

.preschool-users-page__add-button-trailing svg {
  width: 0.9rem;
  height: 0.9rem;
}

.preschool-users-page__add-button :deep(.p-button-label) {
  width: 100%;
}

.preschool-users-page__add-button :deep(.p-button-icon) {
  margin-right: 0.75rem;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .preschool-users-page__toolbar {
    flex-wrap: wrap;
  }

  .preschool-users-page__add-button {
    width: 100%;
    min-width: 0;
  }

  .preschool-users-page__filters {
    flex-direction: column;
  }

  .preschool-users-page__input--select {
    width: 100%;
  }
}
</style>
