<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentStore } from '@/modules/preschool/stores/assessmentStore'
import { useAssessmentData } from '@/modules/preschool/composables/useAssessmentData'
import { useAssessmentFilters } from '@/modules/preschool/composables/useAssessmentFilters'
import { useAssessmentMutations } from '@/modules/preschool/composables/useAssessmentMutations'
import AssessmentPageHeader from '@/modules/preschool/admin/components/assessment/AssessmentPageHeader.vue'
import AssessmentListSummary from '@/modules/preschool/admin/components/assessment/AssessmentListSummary.vue'
import AssessmentStatusEmptyState from '@/modules/preschool/admin/components/assessment/AssessmentStatusEmptyState.vue'
import FilterBar from '@/modules/preschool/components/assessment-list/FilterBar.vue'
import AssessmentTable from '@/modules/preschool/components/assessment-list/AssessmentTable.vue'
import AssessmentModal from '@/modules/preschool/components/assessment-form/AssessmentModal.vue'

defineOptions({
  name: 'PreschoolAssessmentListPage',
})

const route = useRoute()
const store = useAssessmentStore()
const { t } = useLanguage()
const { isFormOpen, editingAssessment } = storeToRefs(store)

const {
  loadAllLookupData,
  loadAssessments,
  assessments,
  categories,
  studentOptions,
  classOptions,
  loading,
} = useAssessmentData()

const {
  studentFilter,
  classFilter,
  categoryFilter,
  periodFilter,
  statusFilter,
  searchFilter,
  dateFromFilter,
  dateToFilter,
  activeFilterCount,
  clearAllFilters,
  filteredAssessments,
} = useAssessmentFilters()

const {
  saveAssessment,
  updateAssessment,
  finalizeAssessment,
  archiveAssessment,
  validationErrors,
  saving,
} = useAssessmentMutations()

const selectedStudentId = ref(route.query.studentId ? Number(route.query.studentId) : null)
const selectedStudent = computed(() => {
  if (!selectedStudentId.value) return null
  return studentOptions.value.find(option => option.value === selectedStudentId.value) || null
})

const categoryOptions = computed(() =>
  categories.value.map(category => ({
    label: category.name,
    value: category.id,
  }))
)

onMounted(async () => {
  await loadAllLookupData()
})

watch(
  selectedStudentId,
  async (value) => {
    if (value) {
      await loadAssessments(value)
      return
    }

    store.reset()
  },
  { immediate: true }
)

async function handleSaveAssessment(data) {
  if (!selectedStudentId.value) return

  try {
    if (data.id) {
      await updateAssessment(data.id, data)
    } else {
      await saveAssessment(selectedStudentId.value, data)
    }
    store.closeForm()
    await loadAssessments(selectedStudentId.value)
  } catch (err) {
    console.error('Save failed:', err)
  }
}

async function handleFinalizeAssessment(assessmentId) {
  try {
    await finalizeAssessment(assessmentId)
    store.closeForm()
    if (selectedStudentId.value) {
      await loadAssessments(selectedStudentId.value)
    }
  } catch (err) {
    console.error('Finalize failed:', err)
  }
}

async function handleArchiveAssessment(assessment) {
  if (!assessment) return

  if (confirm(`Archive assessment for ${assessment.student?.fullName || 'this student'}?`)) {
    try {
      await archiveAssessment(assessment.id)
      if (selectedStudentId.value) {
        await loadAssessments(selectedStudentId.value)
      }
    } catch (err) {
      console.error('Archive failed:', err)
    }
  }
}

function handleOpenCreateForm() {
  if (!selectedStudentId.value) return
  store.openCreateForm()
}

function handleOpenEditForm(assessment) {
  store.openEditForm(assessment)
}

function handlePageChange(pagination) {
  if (!selectedStudentId.value) return

  loadAssessments(selectedStudentId.value, {
    page: pagination.page,
    perPage: pagination.rows,
  })
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <AssessmentPageHeader
        :title="t('assessmentList.title')"
        :subtitle="t('assessmentList.subtitle')"
      />

      <AssessmentListSummary
        :selected-student-label="selectedStudent?.label || t('assessmentList.selectedStudentPlaceholder')"
        :assessment-count="filteredAssessments.length"
        :active-filter-count="activeFilterCount"
      >
        <template #student-selector>
          <Select
            v-model="selectedStudentId"
            :options="studentOptions"
            option-label="label"
            option-value="value"
            filter
            show-clear
            :placeholder="t('assessmentList.selectedStudentPlaceholder')"
            class="w-full"
          />
        </template>

        <template #actions>
          <Button
            :label="t('assessmentList.createAssessment')"
            icon="pi pi-plus"
            :disabled="!selectedStudentId"
            @click="handleOpenCreateForm"
          />
          <Button
            :label="t('assessmentList.clearFilters')"
            icon="pi pi-filter-slash"
            variant="secondary"
            :disabled="!activeFilterCount"
            @click="clearAllFilters"
          />
        </template>
      </AssessmentListSummary>

      <FilterBar
        v-model:student-filter="studentFilter"
        v-model:class-filter="classFilter"
        v-model:category-filter="categoryFilter"
        v-model:period-filter="periodFilter"
        v-model:status-filter="statusFilter"
        v-model:search-filter="searchFilter"
        v-model:date-from-filter="dateFromFilter"
        v-model:date-to-filter="dateToFilter"
        :student-options="studentOptions"
        :class-options="classOptions"
        :category-options="categoryOptions"
        :active-filter-count="activeFilterCount"
        @clear-all="clearAllFilters"
      />

      <AssessmentTable
        :assessments="filteredAssessments"
        :categories="categories"
        :loading="loading"
        :paginated="true"
        :total-records="assessments.length"
        :rows="25"
        @edit="handleOpenEditForm"
        @finalize="handleFinalizeAssessment"
        @archive="handleArchiveAssessment"
        @page-change="handlePageChange"
      />

      <AssessmentModal
        v-model:visible="isFormOpen"
        :assessment="editingAssessment"
        :categories="categories"
        :student-options="studentOptions"
        :class-options="classOptions"
        :validation-errors="validationErrors"
        :saving="saving"
        @save="handleSaveAssessment"
        @finalize="handleFinalizeAssessment"
      />

      <div
        v-if="!loading && selectedStudentId && filteredAssessments.length === 0"
      >
        <AssessmentStatusEmptyState
          :title="t('assessmentList.noAssessmentsTitle')"
          :message="t('assessmentList.noAssessmentsMessage')"
        >
          <Button
            :label="t('assessmentList.createAssessment')"
            icon="pi pi-plus"
            size="sm"
            class="mt-4"
            @click="handleOpenCreateForm"
          />
        </AssessmentStatusEmptyState>
      </div>

      <div
        v-if="!selectedStudentId"
      >
        <AssessmentStatusEmptyState
          tone="blue"
          :title="t('assessmentList.chooseStudentTitle')"
          :message="t('assessmentList.chooseStudentMessage')"
        />
      </div>
    </div>
  </MainLayout>
</template>
