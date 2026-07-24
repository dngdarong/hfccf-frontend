<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import ActionsButton from '@/components/buttons/ActionsButton.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { deleteStudentMedicalProfile } from '@/modules/preschool/services/api/preschoolHealthApi'
import { resolveAvatarSource } from '@/utils/avatar'

defineOptions({
  name: 'PreschoolHealthRecordsPage',
})

const router = useRouter()
const { t } = useLanguage()

const students = ref([])
const search = ref('')
const classFilter = ref('all')
const currentPage = ref(1)
const PAGE_SIZE = 10

const pagination = ref({
  page: 1,
  perPage: PAGE_SIZE,
  total: 0,
  totalPages: 1,
})

const loading = ref(false)
const errorMessage = ref('')

const confirmDeleteDialogOpen = ref(false)
const selectedStudent = ref(null)
const deleteLoading = ref(false)

const filteredClasses = computed(() => {
  const classSet = new Set()
  students.value.forEach(student => {
    if (Array.isArray(student.classes)) {
      student.classes.forEach(cls => {
        if (cls?.code) classSet.add(JSON.stringify({ code: cls.code, name: cls.name || cls.code }))
      })
    }
  })
  return Array.from(classSet).map(cls => JSON.parse(cls))
})

const studentRows = computed(() => {
  let filtered = students.value

  if (classFilter.value !== 'all') {
    filtered = filtered.filter(student => {
      if (!Array.isArray(student.classes)) return false
      return student.classes.some(cls => cls?.code === classFilter.value)
    })
  }

  return filtered.map((student, index) => ({
    ...student,
    rowNumber: (pagination.value.page - 1) * PAGE_SIZE + index + 1,
    avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
    fullName: student.fullName || student.name || '-',
    className: Array.isArray(student.classes) && student.classes.length
      ? student.classes.map(item => item?.name || item?.code || '').filter(Boolean).join(', ')
      : student.className || student.class?.name || student.class?.code || '-',
    hasHealthProfile: !!student.hasHealthProfile,
  }))
})

const hasStudentPages = computed(() => Number(pagination.value.totalPages || 1) > 1)

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolStudents({
      page: currentPage.value,
      perPage: PAGE_SIZE,
      search: search.value,
      status: 'active',
    })

    students.value = response.items || []

    pagination.value = {
      page: response.pagination?.page || currentPage.value,
      perPage: response.pagination?.perPage || PAGE_SIZE,
      total: response.pagination?.total || students.value.length || 0,
      totalPages: Math.max(Number(response.pagination?.totalPages || 1), 1),
    }
  } catch (error) {
    students.value = []
    pagination.value = {
      page: currentPage.value,
      perPage: PAGE_SIZE,
      total: 0,
      totalPages: 1,
    }
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function openAddPage(student) {
  router.push({
    name: 'preschool-health-records-create',
    params: { studentId: student.id },
  })
}

function openDetailPage(student) {
  router.push({
    name: 'preschool-health-records-detail',
    params: { studentId: student.id },
  })
}

function openEditPage(student) {
  router.push({
    name: 'preschool-health-records-edit',
    params: { studentId: student.id },
  })
}


function openDeleteDialog(student) {
  selectedStudent.value = student
  confirmDeleteDialogOpen.value = true
}

async function handleDeleteConfirm() {
  if (!selectedStudent.value?.id) return

  deleteLoading.value = true
  try {
    await deleteStudentMedicalProfile(selectedStudent.value.id)
    confirmDeleteDialogOpen.value = false
    await loadStudents()
  } finally {
    deleteLoading.value = false
  }
}

watch(search, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    return
  }
  loadStudents()
})

watch(currentPage, () => {
  loadStudents()
})

watch(classFilter, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
})

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="health-records-page">
      <HeaderSection
        :title="t('preschoolHealthPage.records.title')"
        :subtitle="t('preschoolHealthPage.records.subtitle')"
      />

      <div class="health-records-page__content">
        <!-- Search and Filter Row -->
        <div class="health-records-page__controls">
          <div class="health-records-page__search-group">
            <input
              v-model="search"
              class="health-records-page__search"
              type="search"
              :placeholder="t('preschoolHealthPage.records.searchPlaceholder')"
            />
          </div>
          <div class="health-records-page__filter-group" v-if="filteredClasses.length">
            <select v-model="classFilter" class="health-records-page__filter">
              <option value="all">{{ t('preschoolHealthPage.records.allClasses') }}</option>
              <option v-for="cls in filteredClasses" :key="cls.code" :value="cls.code">
                {{ cls.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="health-records-page__error">
          {{ errorMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="health-records-page__state">
          <i class="pi pi-spin pi-spinner" />
        </div>

        <!-- Student Table -->
        <template v-else-if="studentRows.length">
          <div class="health-records-page__table-container">
            <table class="health-records-page__table">
              <thead>
                <tr>
                  <th class="health-records-page__th health-records-page__th--number">{{ t('common.table.number') }}</th>
                  <th class="health-records-page__th">{{ t('preschoolHealthPage.records.student') }}</th>
                  <th class="health-records-page__th">{{ t('preschoolHealthPage.records.gender') }}</th>
                  <th class="health-records-page__th">{{ t('preschoolHealthPage.records.dateOfBirth') }}</th>
                  <th class="health-records-page__th">{{ t('preschoolHealthPage.records.class') }}</th>
                  <th class="health-records-page__th">{{ t('preschoolHealthPage.records.healthRecord') }}</th>
                  <th class="health-records-page__th health-records-page__th--actions">{{ t('common.table.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in studentRows" :key="student.id" class="health-records-page__tr">
                  <td class="health-records-page__td health-records-page__td--number">{{ student.rowNumber }}</td>
                  <td class="health-records-page__td health-records-page__td--student">
                    <div class="health-records-page__student-cell">
                      <img
                        v-if="student.avatarUrl"
                        :src="student.avatarUrl"
                        :alt="student.fullName"
                        class="health-records-page__avatar"
                      />
                      <div v-else class="health-records-page__avatar health-records-page__avatar--fallback">
                        {{ (student.fullName || '?').charAt(0) }}
                      </div>
                      <div class="health-records-page__student-info">
                        <div class="health-records-page__student-name">{{ student.fullName }}</div>
                        <div class="health-records-page__student-code">{{ student.publicId || student.studentCode || '-' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="health-records-page__td">{{ student.gender || '-' }}</td>
                  <td class="health-records-page__td">{{ student.dateOfBirth || '-' }}</td>
                  <td class="health-records-page__td">{{ student.className }}</td>
                  <td class="health-records-page__td">
                    <span v-if="student.hasHealthProfile" class="health-records-page__badge health-records-page__badge--available">
                      {{ t('preschoolHealthPage.records.available') }}
                    </span>
                    <span v-else class="health-records-page__badge health-records-page__badge--notAdded">
                      {{ t('preschoolHealthPage.records.notAdded') }}
                    </span>
                  </td>
                  <td class="health-records-page__td health-records-page__td--actions">
                    <Button
                      v-if="!student.hasHealthProfile"
                      type="button"
                      variant="primary"
                      size="sm"
                      rounded="lg"
                      :label="`+ ${t('preschoolHealthPage.records.add')}`"
                      @click="openAddPage(student)"
                    />
                    <ActionsButton
                      v-else
                      :item="student"
                      :show-view="true"
                      :show-edit="true"
                      :show-delete="true"
                      @view="openDetailPage(student)"
                      @edit="openEditPage(student)"
                      @delete="openDeleteDialog(student)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="hasStudentPages" class="health-records-page__pagination">
            <Pagination v-model="currentPage" :total-pages="pagination.totalPages" />
          </div>
        </template>

        <!-- Empty State -->
        <template v-else>
          <div class="health-records-page__empty">
            {{ search ? t('preschoolHealthPage.records.noResults') : t('preschoolHealthPage.records.noStudents') }}
          </div>
        </template>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div v-if="confirmDeleteDialogOpen" class="health-records-page__delete-overlay" @click="confirmDeleteDialogOpen = false">
        <div class="health-records-page__delete-dialog" @click.stop>
          <div class="health-records-page__delete-header">
            <h3>{{ t('preschoolHealthPage.records.confirmDelete') }}</h3>
            <button class="health-records-page__delete-close" @click="confirmDeleteDialogOpen = false">&times;</button>
          </div>
          <div class="health-records-page__delete-body">
            <p>{{ t('preschoolHealthPage.records.deleteWarning') }}</p>
            <p class="health-records-page__delete-student">
              {{ selectedStudent?.fullName || '-' }}
            </p>
          </div>
          <div class="health-records-page__delete-footer">
            <Button
              type="button"
              variant="secondary"
              size="md"
              rounded="lg"
              :label="t('common.cancel')"
              @click="confirmDeleteDialogOpen = false"
            />
            <Button
              type="button"
              variant="danger"
              size="md"
              rounded="lg"
              :label="t('common.delete')"
              :loading="deleteLoading"
              @click="handleDeleteConfirm"
            />
          </div>
        </div>
      </div>

    </section>
  </MainLayout>
</template>

<style scoped>
.health-records-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.health-records-page__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #fff;
  border: 1px solid #dbe3ef;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.health-records-page__controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.health-records-page__search-group {
  flex: 1;
  min-width: 12rem;
}

.health-records-page__search {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  font-size: 0.95rem;
}

.health-records-page__filter-group {
  flex: 0 1 auto;
}

.health-records-page__filter {
  min-width: 10rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.95rem;
}

.health-records-page__error {
  padding: 1rem;
  background: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 0.9rem;
  color: #b91c1c;
  font-size: 0.95rem;
}

.health-records-page__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  color: #64748b;
}

.health-records-page__table-container {
  overflow-x: auto;
}

.health-records-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.health-records-page__th {
  padding: 0.85rem;
  background: #f8fafc;
  border-bottom: 2px solid #cbd5e1;
  text-align: left;
  font-weight: 700;
  color: #0f172a;
}

.health-records-page__th--number {
  width: 3rem;
  text-align: center;
}

.health-records-page__th--actions {
  width: 16rem;
  text-align: right;
}

.health-records-page__tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s;
}

.health-records-page__tr:hover {
  background: #f8fafc;
}

.health-records-page__td {
  padding: 0.85rem;
  color: #0f172a;
}

.health-records-page__td--number {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.health-records-page__td--student {
  min-width: 12rem;
}

.health-records-page__td--actions {
  text-align: right;
}

.health-records-page__student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.health-records-page__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
  background: #e2e8f0;
  flex-shrink: 0;
}

.health-records-page__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-weight: 800;
}

.health-records-page__student-info {
  min-width: 0;
}

.health-records-page__student-name {
  font-weight: 600;
  color: #0f172a;
}

.health-records-page__student-code {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.health-records-page__badge {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.health-records-page__badge--available {
  background: #dcfce7;
  color: #166534;
}

.health-records-page__badge--notAdded {
  background: #f3f4f6;
  color: #6b7280;
}

.health-records-page__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.health-records-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.health-records-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8rem;
  color: #64748b;
  font-size: 0.95rem;
}

.health-records-page__dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.health-records-page__dialog {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.3);
  max-width: 28rem;
  width: 90%;
}

.health-records-page__dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.health-records-page__dialog-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.health-records-page__dialog-body {
  padding: 1.5rem;
  color: #0f172a;
  font-size: 0.95rem;
}

.health-records-page__dialog-body p {
  margin: 0 0 0.75rem 0;
}

.health-records-page__dialog-body p:last-child {
  margin-bottom: 0;
}

.health-records-page__delete-note {
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

.health-records-page__dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.health-records-page__delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.health-records-page__delete-dialog {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.3);
  max-width: 28rem;
  width: 90%;
}

.health-records-page__delete-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-records-page__delete-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.health-records-page__delete-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  line-height: 1;
}

.health-records-page__delete-close:hover {
  color: #0f172a;
}

.health-records-page__delete-body {
  padding: 1.5rem;
  color: #0f172a;
  font-size: 0.95rem;
}

.health-records-page__delete-body p {
  margin: 0 0 0.75rem 0;
}

.health-records-page__delete-body p:last-child {
  margin-bottom: 0;
}

.health-records-page__delete-student {
  font-weight: 600;
  color: #dc2626;
  margin-top: 1rem !important;
}

.health-records-page__delete-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .health-records-page__controls {
    flex-direction: column;
  }

  .health-records-page__search-group,
  .health-records-page__filter-group {
    width: 100%;
  }

  .health-records-page__search,
  .health-records-page__filter {
    width: 100%;
  }

  .health-records-page__table {
    font-size: 0.85rem;
  }

  .health-records-page__th,
  .health-records-page__td {
    padding: 0.6rem;
  }

  .health-records-page__actions {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
