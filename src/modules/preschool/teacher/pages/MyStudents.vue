<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { resolveAvatarSource } from '@/utils/avatar'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherMyStudentsPage',
})

const { t } = useLanguage()

const students = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const pagination = ref({ page: 1, perPage: 10, total: 0, totalPages: 1 })

// studentCode is intentionally omitted — it already appears inside the
// 'student' column template (avatar + name + code), so a separate column
// would duplicate it.
const tableColumns = computed(() => [
  { key: 'number', label: t('preschoolTeacherStudentsPage.columns.no'), align: 'left' },
  { key: 'student', label: t('preschoolTeacherStudentsPage.columns.student'), align: 'left' },
  { key: 'gender', label: t('preschoolTeacherStudentsPage.columns.gender'), align: 'left' },
  { key: 'status', label: t('preschoolTeacherStudentsPage.columns.status'), align: 'left' },
  { key: 'classesCount', label: t('preschoolTeacherStudentsPage.columns.classes'), align: 'left' },
])

const mappedStudents = computed(() =>
  students.value.map((student) => {
    const fullName =
      student.fullName ||
      `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
      student.name ||
      '-'
    return {
      ...student,
      name: fullName,
      avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
      classesCount: student.classesCount || student.classes?.length || 0,
    }
  }),
)

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return mappedStudents.value
  return mappedStudents.value.filter((s) => s.name.toLowerCase().includes(q))
})

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchMyPreschoolStudents({
      page: currentPage.value,
      perPage: pagination.value.perPage || 10,
    })

    students.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    students.value = []
    errorMessage.value = error?.message || t('preschoolTeacherStudentsPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

watch(currentPage, () => {
  loadStudents()
})

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="my-students-page">
      <HeaderSection
        :title="t('preschoolTeacherStudentsPage.title')"
        :subtitle="t('preschoolTeacherStudentsPage.subtitle')"
      />

      <div class="my-students-page__panel">

        <!-- toolbar: total count -->
        <div class="my-students-page__toolbar">
          <div class="my-students-page__toolbar-meta">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
              {{ t('preschoolTeacherStudentsPage.columns.student') }}
            </p>
            <p class="text-2xl font-bold text-slate-900 leading-none">
              {{ pagination.total ?? filteredStudents.length }}
            </p>
          </div>
        </div>

        <!-- search -->
        <div class="my-students-page__search-wrap">
          <svg class="my-students-page__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            class="my-students-page__input my-students-page__input--search"
            type="search"
            :placeholder="t('preschoolTeacherStudentsPage.searchPlaceholder')"
          />
        </div>

        <div v-if="errorMessage" class="my-students-page__error">
          {{ errorMessage }}
        </div>

        <Table
          :rows="filteredStudents"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('preschoolTeacherStudentsPage.messages.noResults')"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.my-students-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.my-students-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.my-students-page__toolbar {
  display: flex;
  align-items: center;
}

.my-students-page__toolbar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.my-students-page__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.my-students-page__search-icon {
  position: absolute;
  left: 0.7rem;
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.my-students-page__input {
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

.my-students-page__input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.my-students-page__input--search {
  padding-left: 2.2rem;
}

.my-students-page__error {
  padding: 0.65rem 1rem;
  border-radius: 0.7rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .my-students-page__panel {
    padding: 1.1rem;
  }
}
</style>
