<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import SearchFilterBar from '@/components/forms/SearchFilterBar.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import ClassTable from '@/modules/classes/components/ClassTable.vue'
import PreschoolClassesSummaryGrid from '@/modules/preschool/admin/components/classes-management/PreschoolClassesSummaryGrid.vue'
import PreschoolClassesToolbar from '@/modules/preschool/admin/components/classes-management/PreschoolClassesToolbar.vue'
import PreschoolClassesHighlights from '@/modules/preschool/admin/components/classes-management/PreschoolClassesHighlights.vue'
import { getStoredClassRows, removeClassRow } from '@/modules/preschool/admin/utils/classStorage'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAdminClassesManagementPage',
})

const { t, language } = useLanguage()
const router = useRouter()
const isKh = computed(() => language.value === 'KH')

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 5
const isDeleteOpen = ref(false)
const selectedClassId = ref('')
const selectedClassName = ref('')
const showSuccess = ref(false)
const successMessage = ref('')

const roleOptions = ['Nursery', 'Kindergarten A', 'Kindergarten B', 'Prep']
const statusOptions = ['active', 'pending', 'closed']

const classRows = ref(getStoredClassRows())

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const filteredClasses = computed(() => {
  const query = normalize(searchQuery.value)

  return classRows.value.filter((item) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(
        `${item.code} ${item.name} ${item.teacher} ${item.level} ${item.schedule}`,
      )
      isMatch = haystack.includes(query)
    }

    if (isMatch && roleFilter.value) {
      isMatch = normalize(item.level) === normalize(roleFilter.value)
    }

    if (isMatch && statusFilter.value) {
      isMatch = normalize(item.status) === normalize(statusFilter.value)
    }

    return isMatch
  })
})

const totalPages = computed(() => Math.max(Math.ceil(filteredClasses.value.length / pageSize), 1))
const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredClasses.value.slice(start, start + pageSize)
})

const totalClasses = computed(() => classRows.value.length)
const activeClasses = computed(
  () => classRows.value.filter((c) => normalize(c.status) === 'active').length,
)
const pendingClasses = computed(
  () => classRows.value.filter((c) => normalize(c.status) === 'pending').length,
)
const totalStudents = computed(() =>
  classRows.value.reduce((sum, c) => sum + Number(c.students || 0), 0),
)

const activeRateLabel = computed(() => {
  if (!totalClasses.value) return '0%'
  return `${Math.round((activeClasses.value / totalClasses.value) * 100)}%`
})

const summaryCards = computed(() => [
  {
    id: 'classes',
    title: t('preschoolClassesManagement.summary.total.title'),
    value: totalClasses.value,
    badge: t('preschoolClassesManagement.summary.total.badge', { count: totalClasses.value }),
    caption: t('preschoolClassesManagement.summary.total.caption'),
    tone: 'info',
    icon:
      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    id: 'active',
    title: t('preschoolClassesManagement.summary.active.title'),
    value: activeClasses.value,
    badge: t('preschoolClassesManagement.summary.active.badge', { rate: activeRateLabel.value }),
    caption: t('preschoolClassesManagement.summary.active.caption'),
    tone: 'success',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'pending',
    title: t('preschoolClassesManagement.summary.pending.title'),
    value: pendingClasses.value,
    badge: pendingClasses.value
      ? t('preschoolClassesManagement.summary.pending.badge')
      : t('preschoolClassesManagement.summary.pending.badgeClear'),
    caption: t('preschoolClassesManagement.summary.pending.caption'),
    tone: 'warning',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'students',
    title: t('preschoolClassesManagement.summary.students.title'),
    value: totalStudents.value,
    badge: t('preschoolClassesManagement.summary.students.badge'),
    caption: t('preschoolClassesManagement.summary.students.caption'),
    tone: 'danger',
    icon:
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
])

const highlightItems = computed(() => {
  const visibleStudents = filteredClasses.value.reduce(
    (sum, c) => sum + Number(c.students || 0),
    0,
  )
  const avgStudents = filteredClasses.value.length
    ? Math.round(visibleStudents / filteredClasses.value.length)
    : 0

  return [
    {
      label: t('preschoolClassesManagement.highlights.visibleClasses'),
      value: filteredClasses.value.length,
    },
    {
      label: t('preschoolClassesManagement.highlights.visibleStudents'),
      value: visibleStudents,
    },
    {
      label: t('preschoolClassesManagement.highlights.avgStudents'),
      value: avgStudents,
    },
  ]
})

const toolbarSummary = computed(() =>
  t('preschoolClassesManagement.toolbarSummary', { count: filteredClasses.value.length }),
)

const visibleRangeLabel = computed(() => {
  if (!filteredClasses.value.length) return t('preschoolClassesManagement.noResults')

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredClasses.value.length)
  return t('preschoolClassesManagement.visibleRange', {
    start,
    end,
    total: filteredClasses.value.length,
  })
})

watch(
  () => filteredClasses.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)

watch([searchQuery, roleFilter, statusFilter], () => {
  currentPage.value = 1
})

function onAddClass() {
  router.push({ path: '/module/preschool-admin/classes/add' })
}

function onViewClass(item) {
  const id = String(item?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/preschool-admin/classes/add', query: { mode: 'view', id } })
}

function onEditClass(item) {
  const id = String(item?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/preschool-admin/classes/add', query: { mode: 'edit', id } })
}

function onDeleteClass(item) {
  selectedClassId.value = String(item?.id || '').trim()
  selectedClassName.value = String(item?.name || item?.code || '').trim()
  if (!selectedClassId.value) return
  isDeleteOpen.value = true
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedClassId.value = ''
  selectedClassName.value = ''
}

function onConfirmDelete() {
  classRows.value = removeClassRow(selectedClassId.value)
  successMessage.value = `${selectedClassName.value || 'Class'} deleted successfully.`
  showSuccess.value = true
  onCancelDelete()
}
</script>

<template>
  <MainLayout>
    <section
      :class="
        isKh ? 'preschool-classes-page preschool-classes-page--kh' : 'preschool-classes-page'
      "
    >
      <HeaderSection
        :title="t('preschoolClassesManagement.title')"
        :subtitle="t('preschoolClassesManagement.subtitle')"
      />

      <PreschoolClassesSummaryGrid :cards="summaryCards" :is-kh="isKh" />

      <div class="preschool-classes-page__shell">
        <PreschoolClassesToolbar
          :eyebrow="t('preschoolClassesManagement.toolbarEyebrow')"
          :title="toolbarSummary"
          :description="visibleRangeLabel"
          :spotlight-label="t('preschoolClassesManagement.spotlightLabel')"
          :spotlight-value="activeClasses"
          :add-button-label="t('preschoolClassesManagement.addButton')"
          :is-kh="isKh"
          @add="onAddClass"
        />

        <SearchFilterBar
          class="w-full"
          v-model:searchQuery="searchQuery"
          v-model:roleFilter="roleFilter"
          v-model:statusFilter="statusFilter"
          :role-options="roleOptions"
          :status-options="statusOptions"
          :search-placeholder="t('preschoolClassesManagement.searchPlaceholder')"
        />

        <PreschoolClassesHighlights :items="highlightItems" :is-kh="isKh" />

        <ClassTable
          :classes="paginatedClasses"
          :empty-text="t('preschoolClassesManagement.tableEmpty')"
          @view="onViewClass"
          @edit="onEditClass"
          @delete="onDeleteClass"
        />

        <div v-if="totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <AlertQuestion
      :show="isDeleteOpen"
      title="Delete class?"
      :message="`Are you sure you want to delete ${selectedClassName || 'this class'}?`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <AlertSuccess
      :show="showSuccess"
      title="Success"
      :message="successMessage"
      button-text="Close"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.preschool-classes-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.preschool-classes-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

@media (max-width: 640px) {
  .preschool-classes-page__shell {
    padding: 1.1rem;
  }
}
</style>
