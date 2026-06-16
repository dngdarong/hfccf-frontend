<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchClassroomResources } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherClassroomResourcesPage',
})

const { t } = useLanguage()

const searchQuery = ref('')
const categoryFilter = ref('')
const conditionFilter = ref('')
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)
const errorMessage = ref('')

const resources = ref([])
const pagination = ref({ page: 1, perPage: pageSize, total: 0, totalPages: 1 })

const categoryOptions = computed(() => [
  { label: t('preschoolClassroomResources.categories.books'), value: 'books' },
  { label: t('preschoolClassroomResources.categories.toys'), value: 'toys' },
  { label: t('preschoolClassroomResources.categories.equipment'), value: 'equipment' },
  { label: t('preschoolClassroomResources.categories.supplies'), value: 'supplies' },
  { label: t('preschoolClassroomResources.categories.digital'), value: 'digital' },
])

const conditionOptions = computed(() => [
  { label: t('preschoolClassroomResources.conditions.good'), value: 'good' },
  { label: t('preschoolClassroomResources.conditions.fair'), value: 'fair' },
  { label: t('preschoolClassroomResources.conditions.poor'), value: 'poor' },
])

const tableColumns = computed(() => [
  { key: 'number', label: t('preschoolClassroomResources.columns.no'), align: 'left' },
  { key: 'name', label: t('preschoolClassroomResources.columns.name'), align: 'left' },
  { key: 'categoryLabel', label: t('preschoolClassroomResources.columns.category'), align: 'left' },
  { key: 'quantity', label: t('preschoolClassroomResources.columns.quantity'), align: 'left' },
  { key: 'conditionLabel', label: t('preschoolClassroomResources.columns.condition'), align: 'left' },
  { key: 'notes', label: t('preschoolClassroomResources.columns.notes'), align: 'left' },
])

const mappedResources = computed(() =>
  resources.value.map((r, i) => ({
    ...r,
    number: (currentPage.value - 1) * pageSize + i + 1,
    categoryLabel: t(`preschoolClassroomResources.categories.${r.category}`),
    conditionLabel: t(`preschoolClassroomResources.conditions.${r.condition}`),
    notes: r.notes || '—',
  })),
)

const summaryTotal = computed(() => pagination.value.total || resources.value.length)
const summaryGood = computed(() => resources.value.filter((r) => r.condition === 'good').length)
const summaryAttention = computed(() => resources.value.filter((r) => r.condition !== 'good').length)

async function loadResources() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchClassroomResources({
      page: currentPage.value,
      perPage: pageSize,
      search: searchQuery.value,
      category: categoryFilter.value,
      condition: conditionFilter.value,
    })
    resources.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    resources.value = []
    errorMessage.value = error?.message || t('preschoolClassroomResources.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, categoryFilter, conditionFilter], () => {
  currentPage.value = 1
  loadResources()
})

watch(currentPage, () => {
  loadResources()
})

onMounted(loadResources)
</script>

<template>
  <MainLayout>
    <section class="teacher-resources">
      <HeaderSection
        :title="t('preschoolClassroomResources.title')"
        :subtitle="t('preschoolClassroomResources.subtitle')"
      />

      <!-- summary strip -->
      <div class="teacher-resources__summary">
        <div class="teacher-resources__summary-card">
          <span class="teacher-resources__summary-value">{{ summaryTotal }}</span>
          <span class="teacher-resources__summary-label">{{ t('preschoolClassroomResources.summary.total') }}</span>
        </div>
        <div class="teacher-resources__summary-card teacher-resources__summary-card--good">
          <span class="teacher-resources__summary-value">{{ summaryGood }}</span>
          <span class="teacher-resources__summary-label">{{ t('preschoolClassroomResources.summary.goodCondition') }}</span>
        </div>
        <div class="teacher-resources__summary-card teacher-resources__summary-card--warn">
          <span class="teacher-resources__summary-value">{{ summaryAttention }}</span>
          <span class="teacher-resources__summary-label">{{ t('preschoolClassroomResources.summary.needsAttention') }}</span>
        </div>
      </div>

      <!-- main panel -->
      <div class="teacher-resources__panel">

        <!-- filters -->
        <div class="teacher-resources__filters">
          <div class="teacher-resources__search-wrap">
            <svg class="teacher-resources__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              class="teacher-resources__input teacher-resources__input--search"
              type="search"
              :placeholder="t('preschoolClassroomResources.searchPlaceholder')"
            />
          </div>
          <select v-model="categoryFilter" class="teacher-resources__input">
            <option value="">{{ t('preschoolClassroomResources.filters.allCategories') }}</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select v-model="conditionFilter" class="teacher-resources__input">
            <option value="">{{ t('preschoolClassroomResources.filters.allConditions') }}</option>
            <option v-for="opt in conditionOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="teacher-resources__error">
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedResources"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="searchQuery || categoryFilter || conditionFilter
            ? t('preschoolClassroomResources.messages.noResults')
            : t('preschoolClassroomResources.messages.empty')"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.teacher-resources {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.teacher-resources__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.teacher-resources__summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
}

.teacher-resources__summary-card--good {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, rgba(240,253,244,0.95) 0%, rgba(220,252,231,0.6) 100%);
}

.teacher-resources__summary-card--warn {
  border-color: #fde68a;
  background: linear-gradient(180deg, rgba(255,251,235,0.95) 0%, rgba(254,243,199,0.6) 100%);
}

.teacher-resources__summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.teacher-resources__summary-label {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

.teacher-resources__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.teacher-resources__filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.75rem;
}

.teacher-resources__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.teacher-resources__search-icon {
  position: absolute;
  left: 0.7rem;
  width: 0.95rem;
  height: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.teacher-resources__input--search {
  padding-left: 2.2rem;
}

.teacher-resources__error {
  padding: 0.65rem 1rem;
  border-radius: 0.7rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 500;
}

.teacher-resources__input {
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

.teacher-resources__input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

@media (max-width: 768px) {
  .teacher-resources__filters,
  .teacher-resources__summary {
    grid-template-columns: 1fr;
  }
}
</style>
