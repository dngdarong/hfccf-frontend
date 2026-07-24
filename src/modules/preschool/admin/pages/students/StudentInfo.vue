<script setup>
// Keep student management text locale-driven so EN/KH parity is testable and
// hardcoded English labels do not reappear in a production page.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveAvatarSource } from '@/utils/avatar'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  deletePreschoolStudent,
} from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolAdminStudentInfoPage',
})

const { t } = useLanguage()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const statusFilter = ref('')
const genderFilter = ref('')
const classFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const loading = ref(false)
const errorMessage = ref('')
const students = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })
const classOptions = ref([])
const showSuccess = ref(false)
const successMessage = ref('')
const deleteTarget = ref(null)
const deleteOpen = ref(false)
const isResettingFilters = ref(false)

const genderOptions = computed(() => [
  { label: t('preschoolStudentInfoPage.options.male'), value: 'male' },
  { label: t('preschoolStudentInfoPage.options.female'), value: 'female' },
  { label: t('preschoolStudentInfoPage.options.other'), value: 'other' },
])

const statusOptions = computed(() => [
  { label: t('preschoolStudentInfoPage.options.active'), value: 'active' },
  { label: t('preschoolStudentInfoPage.options.pending'), value: 'pending' },
  { label: t('preschoolStudentInfoPage.options.inactive'), value: 'inactive' },
  { label: t('preschoolStudentInfoPage.options.graduated'), value: 'graduated' },
])

const hasActiveFilters = computed(() =>
  Boolean(
    searchQuery.value.trim()
    || statusFilter.value
    || genderFilter.value
    || classFilter.value,
  ),
)

const tableColumns = computed(() => [
  { key: 'number', label: t('preschoolStudentInfoPage.columns.no'), align: 'left' },
  { key: 'student', label: t('preschoolStudentInfoPage.columns.student'), align: 'left' },
  { key: 'dateOfBirth', label: t('preschoolStudentInfoPage.columns.dob'), align: 'left' },
  { key: 'gender', label: t('preschoolStudentInfoPage.columns.gender'), align: 'left' },
  { key: 'status', label: t('preschoolStudentInfoPage.columns.status'), align: 'left' },
  { key: 'className', label: t('preschoolStudentInfoPage.columns.className'), align: 'left' },
  { key: 'guardianPhone', label: t('preschoolStudentInfoPage.columns.guardianPhone'), align: 'left' },
  { key: 'actions', label: t('preschoolStudentInfoPage.columns.actions'), align: 'right' },
])

function resolveClassName(student) {
  const fallbackLabel = t('preschoolStudentInfoPage.messages.noClassAssigned')
  const classNames = Array.isArray(student?.classes)
    ? student.classes
        .map((item) => String(item?.name || item?.code || '').trim())
        .filter(Boolean)
    : []
  const directClassName = String(
    student?.className ||
      student?.class?.name ||
      student?.class?.code ||
      '',
  ).trim()

  if (classNames.length > 1) {
    return {
      className: classNames[0],
      classNames,
      classCount: classNames.length,
      extraClassCount: classNames.length - 1,
      classTooltip: classNames.join(', '),
    }
  }

  if (classNames.length === 1) {
    return {
      className: classNames[0],
      classNames,
      classCount: 1,
      extraClassCount: 0,
      classTooltip: classNames[0],
    }
  }

  if (directClassName) {
    return {
      className: directClassName,
      classNames: [directClassName],
      classCount: 1,
      extraClassCount: 0,
      classTooltip: directClassName,
    }
  }

  return {
    className: fallbackLabel,
    classNames: [],
    classCount: 0,
    extraClassCount: 0,
    classTooltip: fallbackLabel,
  }
}

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
      dateOfBirth: student.dateOfBirth || '-',
      ...resolveClassName(student),
      guardianPhone: student.guardianPhone || '-',
    }
  }),
)

async function loadClasses() {
  try {
    const response = await fetchPreschoolClasses({ perPage: 100 })
    classOptions.value = (response.items || []).map((item) => ({
      label: `${item.code} - ${item.name}`,
      value: item.id,
    }))
  } catch {
    classOptions.value = []
  }
}

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolStudents({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      status: statusFilter.value,
      gender: genderFilter.value,
      classId: classFilter.value,
    })

    students.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    students.value = []
    errorMessage.value = error?.message || t('preschoolStudentInfoPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function goToCreateStudent() {
  router.push({ name: 'dashboard-preschool-admin-students-add' })
}

function onViewStudent(student) {
  const studentId = String(student?.id || '').trim()
  if (!studentId) return
  router.push({ name: 'dashboard-preschool-admin-student-profile', params: { id: studentId } })
}

function onEditStudent(student) {
  const studentId = String(student?.id || '').trim()
  if (!studentId) return
  router.push({ name: 'dashboard-preschool-admin-students-edit', params: { id: studentId } })
}

function onDeleteStudent(student) {
  deleteTarget.value = student
  deleteOpen.value = true
}

async function clearFilters() {
  if (!hasActiveFilters.value) return

  isResettingFilters.value = true
  searchQuery.value = ''
  statusFilter.value = ''
  genderFilter.value = ''
  classFilter.value = ''
  currentPage.value = 1

  await nextTick()

  isResettingFilters.value = false
  await loadStudents()
}

async function confirmDelete() {
  const id = String(deleteTarget.value?.id || '').trim()
  if (!id) return

  try {
    await deletePreschoolStudent(id)
    successMessage.value = t('preschoolStudentInfoPage.messages.deleteSuccess')
    showSuccess.value = true
    deleteOpen.value = false
    deleteTarget.value = null
    await loadStudents()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolStudentInfoPage.messages.saveFailed')
  }
}

watch([searchQuery, statusFilter, genderFilter, classFilter], () => {
  if (isResettingFilters.value) return
  currentPage.value = 1
  loadStudents()
})

watch(currentPage, () => {
  if (isResettingFilters.value) return
  loadStudents()
})

onMounted(async () => {
  await loadClasses()
  await loadStudents()

  const saved = String(route.query.saved || '').trim()
  if (saved) {
    successMessage.value =
      saved === 'updated'
        ? t('preschoolStudentInfoPage.messages.updateSuccess')
        : t('preschoolStudentInfoPage.messages.createSuccess')
    showSuccess.value = true
    router.replace({ name: route.name, query: {} })
  }
})
</script>

<template>
  <MainLayout>
    <section class="student-info-page">
      <HeaderSection
        :title="t('preschoolStudentInfoPage.title')"
        :subtitle="t('preschoolStudentInfoPage.subtitle')"
      />

      <div class="student-info-page__shell">
        <div class="student-info-page__toolbar">
          <div class="student-info-page__toolbar-meta">
            <p class="student-info-page__toolbar-label">
              {{ t('preschoolStudentInfoPage.summary.total') }}
            </p>
            <p class="student-info-page__toolbar-value">
              {{ pagination.total ?? mappedStudents.length }}
            </p>
          </div>

          <Button type="button" variant="primary" size="md" rounded="xl" @click="goToCreateStudent">
            {{ t('preschoolStudentInfoPage.addButton') }}
          </Button>
        </div>

        <div class="student-info-page__filters">
          <div class="student-info-page__search-wrap">
            <svg class="student-info-page__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              class="student-info-page__input student-info-page__input--search"
              type="search"
              :placeholder="t('preschoolStudentInfoPage.searchPlaceholder')"
            />
          </div>

          <select v-model="statusFilter" class="student-info-page__input">
            <option value="">{{ t('preschoolStudentInfoPage.filters.allStatus') }}</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <select v-model="genderFilter" class="student-info-page__input">
            <option value="">{{ t('preschoolStudentInfoPage.filters.allGenders') }}</option>
            <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <select v-model="classFilter" class="student-info-page__input">
            <option value="">{{ t('preschoolStudentInfoPage.filters.allClasses') }}</option>
            <option v-for="opt in classOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <div class="student-info-page__filters-action">
            <Button
              type="button"
              variant="outline"
              size="md"
              rounded="xl"
              :disabled="!hasActiveFilters"
              @click="clearFilters"
            >
              {{ t('preschoolStudentInfoPage.filters.clear') }}
            </Button>
          </div>
        </div>

        <div v-if="errorMessage" class="student-info-page__state student-info-page__state--error">
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedStudents"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('preschoolStudentInfoPage.messages.noResults')"
          @view="onViewStudent"
          @edit="onEditStudent"
          @delete="onDeleteStudent"
        />

        <div v-if="pagination.totalPages > 1" class="student-info-page__pagination">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" />
        </div>
      </div>
    </section>

    <AlertQuestion
      :show="deleteOpen"
      :title="t('preschoolStudentInfoPage.alerts.deleteTitle')"
      :message="t('preschoolStudentInfoPage.alerts.deleteMessage', { name: deleteTarget?.fullName || deleteTarget?.name || t('preschoolStudentInfoPage.alerts.deleteFallback') })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolStudentInfoPage.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolStudentInfoPage.alerts.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.student-info-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.student-info-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #dce6f2;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.student-info-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.student-info-page__toolbar-label {
  margin: 0;
  color: #0f76b4;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.student-info-page__toolbar-value {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
}

.student-info-page__filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
}

.student-info-page__search-wrap {
  position: relative;
}

.student-info-page__search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  width: 1rem;
  height: 1rem;
  transform: translateY(-50%);
  color: #94a3b8;
}

.student-info-page__input {
  width: 100%;
  min-height: 3.05rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.94rem;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.student-info-page__input--search {
  padding-left: 2.75rem;
}

.student-info-page__input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.student-info-page__filters-action {
  display: flex;
  align-items: stretch;
}

.student-info-page__state {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: #0f172a;
  font-weight: 600;
}

.student-info-page__state--error {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
  color: #b91c1c;
}

.student-info-page__pagination {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .student-info-page__toolbar,
  .student-info-page__filters {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .student-info-page__filters {
    grid-template-columns: 1fr;
  }

  .student-info-page__filters-action {
    width: 100%;
  }
}
</style>
