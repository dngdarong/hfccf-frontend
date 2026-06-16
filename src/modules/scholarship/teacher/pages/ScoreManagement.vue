<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Table from '@/components/data-display/Table.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import {
  createScholarshipReview,
  fetchReviewerApplications,
  updateScholarshipReview,
} from '@/modules/scholarship/services/scholarshipApi'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'ScholarshipTeacherReviewsPage',
})

const userStore = useUserStore()
const currentUserId = computed(() => String(userStore.currentUser?.id || ''))

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const applications = ref([])
const pagination = ref({ page: 1, perPage: 10, total: 0, totalPages: 1 })
const currentPage = ref(1)
const detailsOpen = ref(false)
const selectedApplication = ref(null)
const successOpen = ref(false)
const successMessage = ref('')

const form = reactive({
  score: '',
  recommendation: '',
  review_note: '',
})

const recommendationOptions = ['approve', 'review', 'reject']

const tableColumns = [
  { key: 'number', label: 'No.', align: 'left' },
  { key: 'application', label: 'Application', align: 'left' },
  { key: 'student', label: 'Student', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'review', label: 'My Review', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const mappedApplications = computed(() =>
  applications.value.map((application) => {
    const myReview = findMyReview(application)

    return {
      ...application,
      application: application.applicationCode || '-',
      student: application.student?.fullName || '-',
      status: application.applicationStatus || '-',
      review: myReview?.recommendation || 'Not reviewed',
      myReview,
    }
  }),
)

function findMyReview(application) {
  const reviews = Array.isArray(application?.reviews) ? application.reviews : []
  const currentId = currentUserId.value

  return reviews.find((review) => String(review.reviewerUserId || '') === currentId) || null
}

async function loadApplications() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchReviewerApplications({
      page: currentPage.value,
      perPage: 10,
    })

    applications.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    applications.value = []
    errorMessage.value = error?.message || 'Failed to load scholarship review assignments.'
  } finally {
    loading.value = false
  }
}

function resetForm(review = null) {
  Object.assign(form, {
    score: review?.score ?? '',
    recommendation: review?.recommendation || '',
    review_note: review?.reviewNote || '',
  })
}

function openReviewModal(application) {
  selectedApplication.value = application || null
  resetForm(findMyReview(application))
  detailsOpen.value = true
}

function closeModal() {
  detailsOpen.value = false
  saving.value = false
}

async function saveReview() {
  if (!selectedApplication.value?.id) {
    return
  }

  if (!form.recommendation) {
    errorMessage.value = 'Recommendation is required.'
    return
  }

  saving.value = true
  errorMessage.value = ''

  const existingReview = findMyReview(selectedApplication.value)
  const payload = {
    application_id: selectedApplication.value.id,
    score: form.score === '' ? null : Number(form.score),
    recommendation: form.recommendation,
    review_note: form.review_note.trim() || null,
  }

  try {
    if (existingReview?.id) {
      await updateScholarshipReview(existingReview.id, payload)
      successMessage.value = 'Scholarship review updated successfully.'
    } else {
      await createScholarshipReview(payload)
      successMessage.value = 'Scholarship review submitted successfully.'
    }

    successOpen.value = true
    closeModal()
    await loadApplications()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to save scholarship review.'
  } finally {
    saving.value = false
  }
}

function onViewApplication(application) {
  openReviewModal(application)
}

onMounted(() => {
  loadApplications()
})
</script>

<template>
  <MainLayout>
    <section class="scholarship-teacher-reviews-page">
      <HeaderSection
        title="Scholarship Reviews"
        subtitle="Submit and update your review notes for assigned scholarship applications."
      />

      <div class="scholarship-teacher-reviews-page__panel">
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
          empty-text="No scholarship applications available for review."
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
      :header="selectedApplication?.applicationCode ? `Review ${selectedApplication.applicationCode}` : 'Review Application'"
      modal
      class="scholarship-teacher-reviews-page__dialog"
    >
      <div v-if="selectedApplication" class="scholarship-teacher-reviews-page__grid">
        <div class="scholarship-teacher-reviews-page__detail">
          <span>Student</span>
          <strong>{{ selectedApplication.student?.fullName || '-' }}</strong>
        </div>
        <div class="scholarship-teacher-reviews-page__detail">
          <span>Status</span>
          <strong>{{ selectedApplication.applicationStatus || '-' }}</strong>
        </div>
        <div class="scholarship-teacher-reviews-page__detail">
          <label for="score">Score</label>
          <input id="score" v-model="form.score" class="scholarship-teacher-reviews-page__input" type="number" min="0" max="100" step="1">
        </div>
        <div class="scholarship-teacher-reviews-page__detail">
          <label for="recommendation">Recommendation</label>
          <select id="recommendation" v-model="form.recommendation" class="scholarship-teacher-reviews-page__input">
            <option value="">Select recommendation</option>
            <option v-for="option in recommendationOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="scholarship-teacher-reviews-page__detail scholarship-teacher-reviews-page__detail--full">
          <label for="review_note">Review note</label>
          <textarea
            id="review_note"
            v-model="form.review_note"
            class="scholarship-teacher-reviews-page__input"
            rows="4"
          />
        </div>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">Close</Button>
        <Button type="button" variant="primary" rounded="xl" :loading="saving" :disabled="saving" @click="saveReview">
          Save Review
        </Button>
      </template>
    </Dialog>

    <AlertSuccess
      :show="successOpen"
      title="Success"
      :message="successMessage"
      button-text="Close"
      @close="successOpen = false"
    />
  </MainLayout>
</template>

<style scoped>
.scholarship-teacher-reviews-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.scholarship-teacher-reviews-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.scholarship-teacher-reviews-page__dialog {
  width: min(100vw - 2rem, 44rem);
}

.scholarship-teacher-reviews-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.scholarship-teacher-reviews-page__detail {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.scholarship-teacher-reviews-page__detail span,
.scholarship-teacher-reviews-page__detail label {
  color: #64748b;
  font-size: 0.8rem;
}

.scholarship-teacher-reviews-page__detail--full {
  grid-column: 1 / -1;
}

.scholarship-teacher-reviews-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

@media (max-width: 900px) {
  .scholarship-teacher-reviews-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
