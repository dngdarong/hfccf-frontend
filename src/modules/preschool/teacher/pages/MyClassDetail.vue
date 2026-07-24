<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import UiPagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolClass, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

defineOptions({
  name: 'PreschoolTeacherMyClassDetailPage',
})

const { t } = useLanguage()
const router = useRouter()
const route = useRoute()

const classData = ref(null)
const students = ref([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const studentsPerPage = 10

const classId = computed(() => route.params.classId)

const totalPages = computed(() => Math.ceil(students.value.length / studentsPerPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * studentsPerPage
  const end = start + studentsPerPage
  return students.value.slice(start, end)
})

async function loadData() {
  if (!classId.value) {
    error.value = t('preschoolTeacherPage.classDetail.classRequired')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [classResponse, studentsResponse] = await Promise.all([
      fetchMyPreschoolClass(classId.value),
      fetchPreschoolStudents({ classId: classId.value, perPage: 1000 }),
    ])

    classData.value = classResponse
    students.value = studentsResponse.items || []
  } catch (err) {
    if (err?.response?.status === 404) {
      error.value = t('preschoolTeacherPage.classDetail.classNotFound')
    } else {
      error.value = t('preschoolTeacherPage.classDetail.loadError')
    }
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push({ name: 'dashboard-preschool-teacher-classes' })
}

function openAttendance() {
  router.push({
    name: 'dashboard-preschool-teacher-attendance',
    query: { classId: classId.value },
  })
}

function openGrades() {
  router.push({
    name: 'dashboard-preschool-teacher-grades',
    query: { classId: classId.value },
  })
}

function openMyStudents() {
  router.push({
    name: 'dashboard-preschool-teacher-students',
    query: { classId: classId.value },
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <MainLayout>
    <!-- Header with Breadcrumb -->
    <HeaderSection
      :title="classData?.name || t('preschoolTeacherPage.classDetail.title')"
      :subtitle="classData?.code || ''"
    />

    <section class="class-detail-page">

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" />
        <p>{{ t('preschoolTeacherPage.classDetail.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" />
        <p>{{ error }}</p>
        <Button
          type="button"
          variant="secondary"
          size="md"
          rounded="lg"
          :label="t('common.actions.back')"
          @click="handleBack"
        />
      </div>

      <!-- Content -->
      <template v-else-if="classData">
        <!-- Quick Actions - Reordered to top -->
        <div class="actions-card">
          <h3 class="card-title">{{ t('preschoolTeacherPage.classDetail.quickActions') }}</h3>
          <div class="actions-grid">
            <Button
              type="button"
              variant="primary"
              size="lg"
              rounded="lg"
              :label="t('preschoolTeacherPage.classDetail.openAttendance')"
              icon="pi pi-clipboard-check"
              class="action-button-large"
              @click="openAttendance"
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              rounded="lg"
              :label="t('preschoolTeacherPage.classDetail.openGrades')"
              icon="pi pi-chart-bar"
              class="action-button-large"
              @click="openGrades"
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              rounded="lg"
              :label="t('preschoolTeacherPage.classDetail.openStudents')"
              icon="pi pi-users"
              class="action-button-large"
              @click="openMyStudents"
            />
          </div>
        </div>

        <!-- Class Information Card -->
        <div class="info-card">
          <h3 class="card-title">{{ t('preschoolTeacherPage.classDetail.classInfo') }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <i class="pi pi-book info-icon"></i>
              <div class="info-content">
                <span class="info-label">{{ t('preschoolTeacherPage.classDetail.name') }}</span>
                <span class="info-value">{{ classData.name || '-' }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="pi pi-tag info-icon"></i>
              <div class="info-content">
                <span class="info-label">{{ t('preschoolTeacherPage.classDetail.code') }}</span>
                <span class="info-value info-code">{{ classData.code || '-' }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="pi pi-users info-icon"></i>
              <div class="info-content">
                <span class="info-label">{{ t('preschoolTeacherPage.classDetail.capacity') }}</span>
                <span class="info-value">{{ classData.students_count || 0 }} {{ t('preschoolTeacherPage.classDetail.students') }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="pi pi-flag info-icon"></i>
              <div class="info-content">
                <span class="info-label">{{ t('preschoolTeacherPage.classDetail.level') }}</span>
                <span class="info-value">{{ classData.level || '-' }}</span>
              </div>
            </div>
            <div class="info-item">
              <i class="pi pi-check-circle info-icon"></i>
              <div class="info-content">
                <span class="info-label">{{ t('preschoolTeacherPage.classDetail.status') }}</span>
                <span :class="['info-value', 'status-badge', `status-${classData.status}`]">
                  {{ classData.status || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Students List -->
        <div class="students-card">
          <div class="students-header">
            <div>
              <h3 class="card-title">{{ t('preschoolTeacherPage.classDetail.studentsList') }}</h3>
              <p class="students-count">{{ students.length }} {{ t('preschoolTeacherPage.classDetail.totalStudents') }}</p>
            </div>
          </div>
          <div v-if="students.length === 0" class="empty-students">
            <i class="pi pi-inbox"></i>
            <p>{{ t('preschoolTeacherPage.classDetail.noStudents') }}</p>
          </div>
          <div v-else class="students-table-wrapper">
            <table class="students-table">
              <thead>
                <tr>
                  <th class="no-column">No.</th>
                  <th>{{ t('preschoolTeacherPage.classDetail.studentCode') }}</th>
                  <th>{{ t('preschoolTeacherPage.classDetail.studentName') }}</th>
                  <th>{{ t('preschoolTeacherPage.classDetail.gender') }}</th>
                  <th>{{ t('preschoolTeacherPage.classDetail.dob') }}</th>
                  <th>{{ t('preschoolTeacherPage.classDetail.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in paginatedStudents" :key="student.id" class="student-row">
                  <td class="no-cell">{{ (currentPage - 1) * studentsPerPage + index + 1 }}</td>
                  <td class="code-cell">{{ student.publicId || student.studentCode || '-' }}</td>
                  <td class="name-cell">{{ student.fullName || '-' }}</td>
                  <td>{{ student.gender || '-' }}</td>
                  <td>{{ student.dateOfBirth || '-' }}</td>
                  <td>
                    <span :class="['status-badge', `status-${student.status}`]">
                      {{ student.status || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination-container">
            <UiPagination
              v-model="currentPage"
              :total-pages="totalPages"
              @change="currentPage = $event"
            />
          </div>
        </div>
      </template>
    </section>
  </MainLayout>
</template>

<style scoped>
.class-detail-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  text-align: center;
  gap: 1rem;
  color: #64748b;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
}

.loading-state i,
.error-state i {
  font-size: 2.5rem;
  color: #cbd5e1;
}

.error-state i {
  color: #dc2626;
}

.error-state p {
  margin: 0;
  font-size: 0.95rem;
  color: #dc2626;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.info-card,
.actions-card,
.students-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
}

/* Quick Actions Card - Enhanced */
.actions-card {
  border: 2px solid #3b82f6;
  background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
}

.actions-card .card-title {
  margin-bottom: 1.5rem;
  color: #1e40af;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
}

.action-button-large {
  width: 100%;
  height: auto;
  padding: 1rem 1.5rem !important;
  font-size: 0.95rem;
  font-weight: 600;
}

/* Class Info Card */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  font-size: 1.25rem;
  color: #3b82f6;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.info-value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
}

.info-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  color: #475569;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  width: fit-content;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive,
.status-archived {
  background: #f3f4f6;
  color: #6b7280;
}

/* Students Card */
.students-card {
  border-radius: 1rem;
}

.students-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.students-count {
  margin: 0.4rem 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.students-table-wrapper {
  overflow-x: auto;
  border-radius: 0.5rem;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.students-table thead {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.students-table th {
  padding: 1rem 0.9rem;
  text-align: left;
  font-weight: 600;
  color: #0f172a;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.students-table tbody .student-row {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.students-table tbody .student-row:hover {
  background: #f8fafc;
}

.students-table td {
  padding: 1rem 0.9rem;
  color: #0f172a;
}

.code-cell {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.name-cell {
  font-weight: 600;
  color: #1e40af;
}

.empty-students {
  padding: 3rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-students i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
  color: #cbd5e1;
}

.empty-students p {
  margin: 0;
  font-size: 0.9rem;
}

.no-column {
  width: 50px;
  text-align: center;
}

.no-cell {
  text-align: center;
  font-weight: 600;
  color: #64748b;
  width: 50px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .class-detail-page {
    gap: 1.5rem;
  }

  .info-card,
  .actions-card,
  .students-card {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .action-button-large {
    padding: 0.75rem 1rem !important;
    font-size: 0.9rem;
  }

  .students-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .students-table {
    font-size: 0.85rem;
  }

  .students-table th,
  .students-table td {
    padding: 0.75rem 0.6rem;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    gap: 0.75rem;
  }

  .students-table {
    font-size: 0.8rem;
  }

  .students-table th,
  .students-table td {
    padding: 0.6rem 0.4rem;
  }

  .empty-students {
    padding: 2rem 1rem;
  }
}
</style>
