<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchTeacherClasses } from '@/modules/english/services/englishApi'

defineOptions({
  name: 'EnglishTeacherClassesPage',
})

const { t, te } = useLanguage()

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const classes = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })

const tableColumns = computed(() => [
  { key: 'number', label: t('english.classes.table.number'), align: 'left' },
  { key: 'classCode', label: t('english.classes.table.code'), align: 'left' },
  { key: 'name', label: t('english.classes.table.class'), align: 'left' },
  { key: 'level', label: t('english.classes.table.level'), align: 'left' },
  { key: 'studentsCount', label: t('english.classes.table.students'), align: 'left' },
  { key: 'taskCount', label: t('english.classes.table.tasks'), align: 'left' },
  { key: 'status', label: t('english.classes.table.status'), align: 'left' },
])

function localizedStatus(value) {
  const key = String(value || '').toLowerCase()
  const statusKey = `english.common.status.${key}`
  return te(statusKey) ? t(statusKey) : value || '-'
}

function localizedLevel(value) {
  const normalized = String(value || '').toLowerCase().replace(/[^a-z]+/g, '')
  const levelMap = {
    beginner: 'english.classes.levels.beginner',
    elementary: 'english.classes.levels.elementary',
    preintermediate: 'english.classes.levels.preIntermediate',
    intermediate: 'english.classes.levels.intermediate',
    upperintermediate: 'english.classes.levels.upperIntermediate',
  }
  const key = levelMap[normalized]
  return key && te(key) ? t(key) : value || '-'
}

const mappedClasses = computed(() =>
  classes.value.map((item) => ({
    ...item,
    classCode: item.classCode || '-',
    studentsCount: item.studentsCount ?? 0,
    taskCount: item.tasksCount ?? 0,
    levelCode: item.level || '',
    statusCode: item.status || '',
    level: localizedLevel(item.level),
    status: localizedStatus(item.status),
  })),
)

async function loadClasses() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTeacherClasses({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    classes.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    classes.value = []
    errorMessage.value = error?.message || t('english.classes.messages.loadError')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  loadClasses()
})

watch(currentPage, () => {
  loadClasses()
})

onMounted(() => {
  loadClasses()
})
</script>

<template>
  <MainLayout>
    <section class="english-teacher-classes-page">
      <HeaderSection
        :title="t('english.classes.teacherTitle')"
        :subtitle="t('english.classes.teacherSubtitle')"
      />

      <div class="english-teacher-classes-page__shell">
        <div class="english-teacher-classes-page__filters">
          <input v-model="searchQuery" class="english-teacher-classes-page__input" type="search" :placeholder="t('english.classes.placeholders.search')" />
          <select v-model="statusFilter" class="english-teacher-classes-page__input">
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
          :rows="mappedClasses"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('english.classes.teacherEmpty')"
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
.english-teacher-classes-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.english-teacher-classes-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.english-teacher-classes-page__filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.english-teacher-classes-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

@media (max-width: 900px) {
  .english-teacher-classes-page__filters {
    grid-template-columns: 1fr;
  }
}
</style>
