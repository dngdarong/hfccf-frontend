<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { resolveAvatarSource } from '@/utils/avatar'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolStudents, fetchMyPreschoolClasses } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherMyStudentsPage',
})

const { t } = useLanguage()

const students = ref([])
const classes = ref([])
const selectedClass = ref(null)
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
  { key: 'dateOfBirth', label: t('preschoolTeacherStudentsPage.columns.dob'), align: 'left' },
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
    const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'
    const allClassNames = student.classes?.map((c) => c.name) || []
    const displayedClasses = allClassNames.slice(0, 3)
    const classNames = displayedClasses.length === 0 ? '-' : displayedClasses.join(', ') + (allClassNames.length > 3 ? '...' : '')
    return {
      ...student,
      name: fullName,
      avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
      dateOfBirth: dob,
      classesCount: classNames,
    }
  }),
)

const filteredStudents = computed(() => {
  let result = mappedStudents.value

  // Filter by class
  if (selectedClass.value) {
    result = result.filter((s) =>
      s.classes?.some((c) => c.id === selectedClass.value || c.classId === selectedClass.value),
    )
  }

  // Filter by search query
  const q = searchQuery.value.toLowerCase()
  if (!q) return result
  return result.filter((s) => s.name.toLowerCase().includes(q))
})

async function loadClasses() {
  try {
    const response = await fetchMyPreschoolClasses({ perPage: 1000 })
    classes.value = response.items || []
  } catch (error) {
    classes.value = []
  }
}

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
  loadClasses()
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

        <!-- filters -->
        <div class="my-students-page__filters">
          <!-- class selector -->
          <div class="my-students-page__filter-item">
            <label class="my-students-page__filter-label">{{ t('preschoolTeacherStudentsPage.filterByClass') || 'Class' }}</label>
            <Select
              v-model="selectedClass"
              :options="classes"
              option-label="name"
              option-value="id"
              :placeholder="t('preschoolTeacherStudentsPage.selectClass') || 'Select a class'"
              class="my-students-page__dropdown"
              show-clear
            />
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

        <div class="flex justify-center">
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

.my-students-page__filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.my-students-page__filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 180px;
}

.my-students-page__filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.my-students-page__dropdown {
  width: 100%;
}

.my-students-page__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
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

@media (max-width: 768px) {
  .my-students-page__filters {
    flex-direction: column;
  }

  .my-students-page__filter-item {
    width: 100%;
  }

  .my-students-page__search-wrap {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .my-students-page__panel {
    padding: 1.1rem;
  }

  .my-students-page__filters {
    flex-direction: column;
  }

  .my-students-page__filter-item {
    width: 100%;
  }
}
</style>
