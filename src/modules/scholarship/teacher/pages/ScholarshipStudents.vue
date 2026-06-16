<script setup>
import { computed, onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import { fetchReviewerApplications } from '@/modules/scholarship/services/scholarshipApi'

defineOptions({
  name: 'ScholarshipTeacherApplicationsPage',
})

const loading = ref(false)
const errorMessage = ref('')
const applications = ref([])
const pagination = ref({ page: 1, perPage: 10, total: 0, totalPages: 1 })
const currentPage = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const selectedApplication = ref(null)
const detailsOpen = ref(false)

const tableColumns = [
  { key: 'number', label: 'No.', align: 'left' },
  { key: 'application', label: 'Application', align: 'left' },
  { key: 'student', label: 'Student', align: 'left' },
  { key: 'type', label: 'Type', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'reviewedAt', label: 'Reviewed At', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const mappedApplications = computed(() =>
  applications.value.map((application) => ({
    ...application,
    application: application.applicationCode || '-',
    student: application.student?.fullName || '-',
    type: application.scholarshipType || '-',
    status: application.applicationStatus || '-',
    reviewedAt: application.reviewedAt || '-',
  })),
)

async function loadApplications() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchReviewerApplications({
      page: currentPage.value,
      perPage: 10,
      search: searchQuery.value,
      status: statusFilter.value,
    })

    applications.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    applications.value = []
    errorMessage.value = error?.message || 'Failed to load assigned scholarship applications.'
  } finally {
    loading.value = false
  }
}

function onViewApplication(application) {
  selectedApplication.value = application || null
  detailsOpen.value = true
}

function onFiltersCleared() {
  searchQuery.value = ''
  statusFilter.value = ''
}

onMounted(() => {
  loadApplications()
})
</script>

<template>
  <MainLayout>
    <section class="scholarship-teacher-applications-page">
      <HeaderSection
        title="Assigned Scholarship Applications"
        subtitle="Review the applications assigned to you and track their current status."
      />

      <div class="scholarship-teacher-applications-page__panel">
        <div class="scholarship-teacher-applications-page__filters">
          <input
            v-model="searchQuery"
            class="scholarship-teacher-applications-page__input"
            type="search"
            placeholder="Search applications"
          >
          <select v-model="statusFilter" class="scholarship-teacher-applications-page__input">
            <option value="">All status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            type="button"
            variant="outline"
            rounded="xl"
            @click="onFiltersCleared"
          >
            Clear Filters
          </Button>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <Table
          :rows="mappedApplications"
          :columns="tableColumns"
          :loading="loading"
          empty-text="No assigned scholarship applications found."
          :show-edit-action="false"
          :show-delete-action="false"
          @view="onViewApplication"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="detailsOpen"
      header="Application Details"
      modal
      class="scholarship-teacher-applications-page__dialog"
    >
      <div v-if="selectedApplication" class="scholarship-teacher-applications-page__detail-grid">
        <div class="scholarship-teacher-applications-page__detail">
          <span>Application</span>
          <strong>{{ selectedApplication.applicationCode || '-' }}</strong>
        </div>
        <div class="scholarship-teacher-applications-page__detail">
          <span>Student</span>
          <strong>{{ selectedApplication.student?.fullName || '-' }}</strong>
        </div>
        <div class="scholarship-teacher-applications-page__detail">
          <span>Status</span>
          <strong>{{ selectedApplication.applicationStatus || '-' }}</strong>
        </div>
        <div class="scholarship-teacher-applications-page__detail">
          <span>Amount</span>
          <strong>{{ Number(selectedApplication.requestedAmount || 0).toFixed(2) }} USD</strong>
        </div>
        <div class="scholarship-teacher-applications-page__detail scholarship-teacher-applications-page__detail--full">
          <span>Notes</span>
          <strong>{{ selectedApplication.notes || '-' }}</strong>
        </div>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="detailsOpen = false">
          Close
        </Button>
      </template>
    </Dialog>
  </MainLayout>
</template>

<style scoped>
.scholarship-teacher-applications-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.scholarship-teacher-applications-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.scholarship-teacher-applications-page__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px auto;
  gap: 0.75rem;
  align-items: center;
}

.scholarship-teacher-applications-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.scholarship-teacher-applications-page__dialog {
  width: min(100vw - 2rem, 40rem);
}

.scholarship-teacher-applications-page__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.scholarship-teacher-applications-page__detail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.scholarship-teacher-applications-page__detail span {
  color: #64748b;
  font-size: 0.8rem;
}

.scholarship-teacher-applications-page__detail--full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .scholarship-teacher-applications-page__filters,
  .scholarship-teacher-applications-page__detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
