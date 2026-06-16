<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchTeacherStudents } from '@/modules/english/services/englishApi'

defineOptions({
  name: 'EnglishTeacherStudentsPage',
})

const { t, te } = useLanguage()

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const students = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })

const tableColumns = computed(() => [
  { key: 'number', label: t('english.students.table.number'), align: 'left' },
  { key: 'studentCode', label: t('english.students.table.code'), align: 'left' },
  { key: 'student', label: t('english.students.table.student'), align: 'left' },
  { key: 'gender', label: t('english.students.table.gender'), align: 'left' },
  { key: 'status', label: t('english.students.table.status'), align: 'left' },
  { key: 'classesCount', label: t('english.students.table.classes'), align: 'left' },
  { key: 'submissionsCount', label: t('english.students.table.submissions'), align: 'left' },
])

function localizedStatus(value) {
  const key = String(value || '').toLowerCase()
  const statusKey = `english.common.status.${key}`
  return te(statusKey) ? t(statusKey) : value || '-'
}

function localizedGender(value) {
  const key = String(value || '').toLowerCase()
  const genderKey = `english.common.status.${key}`
  return te(genderKey) ? t(genderKey) : value || '-'
}

const mappedStudents = computed(() =>
  students.value.map((item) => ({
    ...item,
    studentCode: item.studentCode || '-',
    student: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    classesCount: item.classesCount ?? 0,
    submissionsCount: item.submissionsCount ?? 0,
    genderCode: item.gender || '',
    statusCode: item.status || '',
    gender: localizedGender(item.gender),
    status: localizedStatus(item.status),
  })),
)

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTeacherStudents({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    students.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    students.value = []
    errorMessage.value = error?.message || t('english.students.messages.loadError')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  loadStudents()
})

watch(currentPage, () => {
  loadStudents()
})

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="english-teacher-students-page">
      <HeaderSection
        :title="t('english.students.teacherTitle')"
        :subtitle="t('english.students.teacherSubtitle')"
      />

      <div class="english-teacher-students-page__shell">
        <div class="english-teacher-students-page__filters">
          <input v-model="searchQuery" class="english-teacher-students-page__input" type="search" :placeholder="t('english.students.placeholders.search')" />
          <select v-model="statusFilter" class="english-teacher-students-page__input">
            <option value="">{{ t('english.common.filters.allStatus') }}</option>
            <option value="active">{{ t('english.common.status.active') }}</option>
            <option value="inactive">{{ t('english.common.status.inactive') }}</option>
            <option value="archived">{{ t('english.common.status.archived') }}</option>
          </select>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedStudents"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('english.students.teacherEmpty')"
          :show-view-action="false"
          :show-edit-action="false"
          :show-delete-action="false"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.english-teacher-students-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-teacher-students-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-teacher-students-page__filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.english-teacher-students-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

@media (max-width: 900px) {
  .english-teacher-students-page__filters {
    grid-template-columns: 1fr;
  }
}
</style>
