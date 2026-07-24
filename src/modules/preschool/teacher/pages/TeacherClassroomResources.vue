<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useUserStore } from '@/store/userStore'
import {
  fetchClassroomResources,
  fetchClassroomResourceRequests,
  createClassroomResourceRequest,
  fetchMyPreschoolClasses,
} from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherClassroomResourcesPage',
})

const { t } = useLanguage()
const userStore = useUserStore()

const searchQuery = ref('')
const categoryFilter = ref('')
const conditionFilter = ref('')
const currentPage = ref(1)
const pageSize = 20
const activeTab = ref('resources')
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
  { key: 'actions', label: t('preschoolClassroomResources.columns.actions'), align: 'left' },
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

onMounted(async () => {
  await loadResources()
  await loadRequests()
  await loadMyClasses()
})

// Request-related state
const requests = ref([])
const requestsLoading = ref(false)
const requestStatusFilter = ref('')
const requestActionDialogOpen = ref(false)
const requestActionMode = ref(null) // 'approve' | 'reject' | null
const requestActionNotes = ref('')
const selectedRequestId = ref(null)

// Request submission state
const myClasses = ref([])
const classesLoading = ref(false)
const requestDialogOpen = ref(false)
const selectedResource = ref(null)
const selectedClassId = ref('')
const requestedQuantity = ref(1)
const requestSubmitting = ref(false)
const requestSuccess = ref(false)
const requestSuccessMessage = ref('')

const requestTableColumns = computed(() => [
  { key: 'resourceName', label: t('preschoolResourceRequests.columns.resource'), align: 'left' },
  { key: 'className', label: t('preschoolResourceRequests.columns.class'), align: 'left' },
  { key: 'statusLabel', label: t('preschoolResourceRequests.columns.status'), align: 'left' },
  { key: 'requestedDateFormatted', label: t('preschoolResourceRequests.columns.requestedDate'), align: 'left' },
])

const mappedRequests = computed(() =>
  requests.value
    .filter((r) => !requestStatusFilter.value || r.status === requestStatusFilter.value)
    .map((r) => ({
      ...r,
      statusLabel: t(`preschoolResourceRequests.statuses.${r.status}`),
      requestedDateFormatted: new Date(r.requestedDate).toLocaleDateString(),
    })),
)

async function loadRequests() {
  requestsLoading.value = true
  try {
    const response = await fetchClassroomResourceRequests({
      page: 1,
      perPage: 100,
    })
    requests.value = response.items || []
  } catch (error) {
    requests.value = []
    console.error('Failed to load classroom resource requests:', error)
    if (error?.response?.status === 500) {
      console.error('Server error - the resource requests endpoint may have a configuration issue')
    }
  } finally {
    requestsLoading.value = false
  }
}

watch(requestStatusFilter, () => {
  // computed already handles filtering, no need to reload
})

async function loadMyClasses() {
  classesLoading.value = true
  try {
    const response = await fetchMyPreschoolClasses()
    myClasses.value = Array.isArray(response) ? response : response.items || []
  } catch (error) {
    myClasses.value = []
  } finally {
    classesLoading.value = false
  }
}

function openRequestDialog(resource) {
  selectedResource.value = resource
  selectedClassId.value = ''
  requestDialogOpen.value = true
}

async function submitRequest() {
  if (!selectedResource.value || !selectedClassId.value) {
    requestSuccessMessage.value = t('preschoolResourceRequests.messages.selectClassRequired')
    return
  }

  if (!requestedQuantity.value || requestedQuantity.value < 1) {
    requestSuccessMessage.value = 'Please enter a valid quantity'
    return
  }

  requestSubmitting.value = true
  try {
    await createClassroomResourceRequest({
      resource_id: selectedResource.value.id,
      class_id: selectedClassId.value,
      quantity: requestedQuantity.value,
    })
    requestSuccessMessage.value = t('preschoolResourceRequests.messages.requestSubmitSuccess')
    requestSuccess.value = true
    requestDialogOpen.value = false

    setTimeout(() => {
      requestSuccess.value = false
    }, 3000)

    await loadRequests()
  } catch (error) {
    requestSuccessMessage.value = error?.message || t('preschoolResourceRequests.messages.actionFailed')
  } finally {
    requestSubmitting.value = false
  }
}
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

      <!-- Tab Switcher -->
      <div class="teacher-resources__tabs">
        <button
          class="teacher-resources__tab"
          :class="{ 'teacher-resources__tab--active': activeTab === 'resources' }"
          @click="activeTab = 'resources'"
        >
          {{ t('preschoolClassroomResources.title') }}
        </button>
        <button
          class="teacher-resources__tab"
          :class="{ 'teacher-resources__tab--active': activeTab === 'requests' }"
          @click="activeTab = 'requests'"
        >
          {{ t('preschoolResourceRequests.title') }}
        </button>
      </div>

      <!-- main panel -->
      <div class="teacher-resources__panel" v-if="activeTab === 'resources'">

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
        >
          <template #actions="{ row }">
            <Button
              size="sm"
              :label="t('preschoolResourceRequests.actions.request')"
              @click="openRequestDialog(row)"
            />
          </template>
        </Table>

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>

      <!-- Requests Panel -->
      <div class="teacher-resources__panel" v-if="activeTab === 'requests'">
        <div class="teacher-resources__filters">
          <select v-model="requestStatusFilter" class="teacher-resources__input">
            <option value="">All Statuses</option>
            <option value="pending">{{ t('preschoolResourceRequests.statuses.pending') }}</option>
            <option value="approved">{{ t('preschoolResourceRequests.statuses.approved') }}</option>
            <option value="rejected">{{ t('preschoolResourceRequests.statuses.rejected') }}</option>
          </select>
        </div>

        <Table
          :rows="mappedRequests"
          :columns="requestTableColumns"
          :loading="requestsLoading"
          :empty-text="t('preschoolResourceRequests.messages.empty')"
        />
      </div>

      <!-- Success Message -->
      <AlertSuccess v-if="requestSuccess" class="mb-4">
        {{ requestSuccessMessage }}
      </AlertSuccess>

      <!-- Request Dialog -->
      <Dialog
        v-model:visible="requestDialogOpen"
        :header="`${t('preschoolResourceRequests.actions.request')}: ${selectedResource?.name || ''}`"
        modal
        @update:visible="(val) => { if (!val) selectedResource = null; selectedClassId = '' }"
      >
        <div class="flex flex-col gap-4">
          <div v-if="requestSuccessMessage && !requestSuccess" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {{ requestSuccessMessage }}
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-medium text-sm">{{ t('preschoolClassroomResources.columns.class') }}</label>
            <select v-model="selectedClassId" class="border border-gray-300 rounded px-3 py-2">
              <option value="">-- Select Class --</option>
              <option v-for="cls in myClasses" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-medium text-sm">Quantity</label>
            <input
              v-model.number="requestedQuantity"
              type="number"
              min="1"
              class="border border-gray-300 rounded px-3 py-2"
              placeholder="Enter quantity needed"
            />
          </div>

          <div class="flex gap-2 justify-end">
            <Button
              label="Cancel"
              variant="secondary"
              @click="requestDialogOpen = false"
            />
            <Button
              :label="t('preschoolResourceRequests.actions.request')"
              :loading="requestSubmitting"
              @click="submitRequest"
            />
          </div>
        </div>
      </Dialog>
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

.teacher-resources__tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #dce6f2;
}

.teacher-resources__tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.teacher-resources__tab:hover {
  color: #0f172a;
}

.teacher-resources__tab--active {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
}

@media (max-width: 768px) {
  .teacher-resources__filters,
  .teacher-resources__summary {
    grid-template-columns: 1fr;
  }
}
</style>
