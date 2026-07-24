<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { fetchStudentHealthSummary } from '@/modules/preschool/services/api/preschoolHealthApi'
import { resolveAvatarSource } from '@/utils/avatar'

defineOptions({
  name: 'PreschoolTeacherHealthPage',
})

const { t } = useLanguage()

const allStudents = ref([])
const selectedStudentDetail = ref(null)
const loadingStudents = ref(false)
const loadingDetail = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredStudents = computed(() => {
  let filtered = allStudents.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s =>
      (s.fullName || '').toLowerCase().includes(query) ||
      (s.studentCode || '').toLowerCase().includes(query) ||
      (s.publicId || '').toLowerCase().includes(query),
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / pageSize))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredStudents.value.slice(start, end)
})

const studentTableRows = computed(() =>
  paginatedStudents.value.map((student, index) => ({
    ...student,
    rowNumber: (currentPage.value - 1) * pageSize + index + 1,
    avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
    fullName: student.fullName || student.name || '-',
    className: Array.isArray(student.classes) && student.classes.length
      ? student.classes.map((item) => item?.name || item?.code || '').filter(Boolean).join(', ')
      : student.className || student.class?.name || student.class?.code || '-',
    dateOfBirth: student.dateOfBirth || student.date_of_birth || '-',
    gender: student.gender || '-',
  })),
)

async function loadStudents() {
  loadingStudents.value = true
  errorMessage.value = ''

  try {
    const response = await fetchMyPreschoolStudents({ page: 1, perPage: 100 })
    allStudents.value = (response.items || []).map(s => ({
      ...s,
      _healthRecordExists: false,
    }))
    currentPage.value = 1
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loadingStudents.value = false
  }
}

async function openDetail(student) {
  selectedStudentDetail.value = null
  loadingDetail.value = true
  errorMessage.value = ''

  try {
    const summary = await fetchStudentHealthSummary(student.id)
    const className = Array.isArray(student.classes) && student.classes.length
      ? student.classes.map((item) => item?.name || item?.code || '').filter(Boolean).join(', ')
      : student.className || student.class?.name || student.class?.code || '-'

    selectedStudentDetail.value = {
      student: {
        id: student.id,
        publicId: student.publicId || student.public_id,
        studentCode: student.studentCode || student.student_code,
        fullName: student.fullName || student.name,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth || student.date_of_birth,
        className,
        avatarUrl: student.avatarUrl,
      },
      summary,
    }
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loadingDetail.value = false
  }
}

function closeDetail() {
  selectedStudentDetail.value = null
}

watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="teacher-health-page">
      <HeaderSection
        :title="t('preschoolHealthPage.teacher.studentHealthTitle')"
        :subtitle="t('preschoolHealthPage.teacher.studentHealthSubtitle')"
      />

      <div class="teacher-health-page__container">
        <template v-if="!selectedStudentDetail">
          <!-- List View -->
          <div class="teacher-health-page__list">
            <!-- Search and Filters -->
            <div class="teacher-health-page__controls">
              <div class="teacher-health-page__search">
                <i class="pi pi-search" />
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('preschoolHealthPage.teacher.searchStudents')"
                  class="teacher-health-page__search-input"
                />
              </div>
            </div>

            <!-- Error State -->
            <div v-if="errorMessage" class="teacher-health-page__error">
              {{ errorMessage }}
            </div>

            <!-- Loading State -->
            <div v-if="loadingStudents" class="teacher-health-page__loading">
              <i class="pi pi-spin pi-spinner" />
            </div>

            <!-- No Students State -->
            <div v-else-if="allStudents.length === 0" class="teacher-health-page__empty">
              {{ t('preschoolHealthPage.teacher.noStudentsAssigned') }}
            </div>

            <!-- No Results State -->
            <div v-else-if="filteredStudents.length === 0" class="teacher-health-page__empty">
              {{ t('preschoolHealthPage.teacher.noSearchResults') }}
            </div>

            <!-- Students Table -->
            <template v-else>
              <table class="teacher-health-page__table">
                <thead>
                  <tr>
                    <th class="teacher-health-page__col--number">No.</th>
                    <th class="teacher-health-page__col--student">{{ t('preschoolHealthPage.teacher.student') }}</th>
                    <th class="teacher-health-page__col--gender">Gender</th>
                    <th class="teacher-health-page__col--dob">Date of Birth</th>
                    <th class="teacher-health-page__col--class">{{ t('preschoolHealthPage.teacher.class') }}</th>
                    <th class="teacher-health-page__col--record">{{ t('preschoolHealthPage.teacher.healthRecord') }}</th>
                    <th class="teacher-health-page__col--actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in studentTableRows" :key="row.id" class="teacher-health-page__row">
                    <td class="teacher-health-page__col--number">{{ row.rowNumber }}</td>
                    <td class="teacher-health-page__col--student">
                      <div class="teacher-health-page__student-cell">
                        <img
                          v-if="row.avatarUrl"
                          :src="row.avatarUrl"
                          :alt="row.fullName"
                          class="teacher-health-page__avatar"
                        />
                        <div v-else class="teacher-health-page__avatar--fallback">
                          {{ (row.fullName || '?').charAt(0) }}
                        </div>
                        <div>
                          <div class="teacher-health-page__student-name">{{ row.fullName }}</div>
                          <div class="teacher-health-page__student-code">{{ row.studentCode }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="teacher-health-page__col--gender">{{ row.gender }}</td>
                    <td class="teacher-health-page__col--dob">{{ row.dateOfBirth }}</td>
                    <td class="teacher-health-page__col--class">{{ row.className }}</td>
                    <td class="teacher-health-page__col--record">
                      <span class="teacher-health-page__badge">
                        {{ t('preschoolHealthPage.teacher.notAdded') }}
                      </span>
                    </td>
                    <td class="teacher-health-page__col--actions">
                      <button
                        type="button"
                        class="teacher-health-page__view-btn"
                        title="View"
                        @click="openDetail(row)"
                      >
                        <i class="pi pi-eye" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="teacher-health-page__pagination">
                <Pagination
                  :current-page="currentPage"
                  :total-pages="totalPages"
                  @change="currentPage = $event"
                />
              </div>
            </template>
          </div>
        </template>

        <!-- Detail View -->
        <template v-else>
          <div class="teacher-health-page__detail">
            <!-- Back Button -->
            <button class="teacher-health-page__back" @click="closeDetail">
              <i class="pi pi-arrow-left" />
              {{ t('preschoolHealthPage.teacher.back') }}
            </button>

            <!-- Loading State -->
            <div v-if="loadingDetail" class="teacher-health-page__loading">
              <i class="pi pi-spin pi-spinner" />
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="teacher-health-page__error">
              {{ errorMessage }}
            </div>

            <!-- Detail Content -->
            <template v-else-if="selectedStudentDetail">
              <!-- Student Summary -->
              <section class="teacher-health-page__summary-section">
                <div class="teacher-health-page__summary-header">
                  <div class="teacher-health-page__summary-avatar">
                    <img
                      v-if="selectedStudentDetail.student.avatarUrl"
                      :src="selectedStudentDetail.student.avatarUrl"
                      :alt="selectedStudentDetail.student.fullName"
                    />
                    <div v-else class="teacher-health-page__avatar--fallback">
                      {{ (selectedStudentDetail.student.fullName || '?').charAt(0) }}
                    </div>
                  </div>
                  <div class="teacher-health-page__summary-info">
                    <h2>{{ selectedStudentDetail.student.fullName }}</h2>
                    <p>{{ selectedStudentDetail.student.studentCode }} - {{ selectedStudentDetail.student.className }}</p>
                  </div>
                </div>

                <div class="teacher-health-page__summary-grid">
                  <div class="teacher-health-page__summary-item">
                    <span class="teacher-health-page__label">{{ t('common.gender') }}</span>
                    <span class="teacher-health-page__value">{{ selectedStudentDetail.student.gender || '-' }}</span>
                  </div>
                  <div class="teacher-health-page__summary-item">
                    <span class="teacher-health-page__label">{{ t('common.dateOfBirth') }}</span>
                    <span class="teacher-health-page__value">{{ selectedStudentDetail.student.dateOfBirth || '-' }}</span>
                  </div>
                  <div class="teacher-health-page__summary-item">
                    <span class="teacher-health-page__label">{{ t('preschoolHealthPage.teacher.class') }}</span>
                    <span class="teacher-health-page__value">{{ selectedStudentDetail.student.className || '-' }}</span>
                  </div>
                </div>
              </section>

              <!-- Health Information Status -->
              <div class="teacher-health-page__health-status">
                <span class="teacher-health-page__badge" :class="{ 'teacher-health-page__badge--available': selectedStudentDetail.summary.medicalProfile }">
                  {{ selectedStudentDetail.summary.medicalProfile ? t('preschoolHealthPage.teacher.available') : t('preschoolHealthPage.teacher.notAdded') }}
                </span>
              </div>

              <!-- Health Information -->
              <div v-if="selectedStudentDetail.summary.medicalProfile" class="teacher-health-page__health-sections">
                <!-- Core Health Information -->
                <section class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.coreHealthInfo') }}</h3>
                  <div class="teacher-health-page__health-grid">
                    <div class="teacher-health-page__health-item">
                      <span class="teacher-health-page__label">{{ t('preschoolHealthPage.form.bloodType') }}</span>
                      <span class="teacher-health-page__value">{{ selectedStudentDetail.summary.medicalProfile.blood_type || '-' }}</span>
                    </div>
                    <div class="teacher-health-page__health-item">
                      <span class="teacher-health-page__label">{{ t('preschoolHealthPage.form.height') }}</span>
                      <span class="teacher-health-page__value">{{ selectedStudentDetail.summary.medicalProfile.height || '-' }}</span>
                    </div>
                    <div class="teacher-health-page__health-item">
                      <span class="teacher-health-page__label">{{ t('preschoolHealthPage.form.weight') }}</span>
                      <span class="teacher-health-page__value">{{ selectedStudentDetail.summary.medicalProfile.weight || '-' }}</span>
                    </div>
                    <div class="teacher-health-page__health-item">
                      <span class="teacher-health-page__label">{{ t('preschoolHealthPage.teacher.specialNeeds') }}</span>
                      <span class="teacher-health-page__value">{{ selectedStudentDetail.summary.medicalProfile.special_needs || '-' }}</span>
                    </div>
                  </div>
                  <div v-if="selectedStudentDetail.summary.medicalProfile.medical_notes" class="teacher-health-page__notes">
                    <span class="teacher-health-page__label">{{ t('preschoolHealthPage.teacher.medicalNotes') }}</span>
                    <p>{{ selectedStudentDetail.summary.medicalProfile.medical_notes }}</p>
                  </div>
                </section>

                <!-- Medical Conditions -->
                <section v-if="selectedStudentDetail.summary.medicalProfile.chronic_conditions || selectedStudentDetail.summary.medicalProfile.current_conditions" class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.medicalConditions') }}</h3>
                  <div v-if="selectedStudentDetail.summary.medicalProfile.chronic_conditions" class="teacher-health-page__condition-list">
                    <p class="teacher-health-page__condition-label">{{ t('preschoolHealthPage.teacher.chronicConditions') }}</p>
                    <ul>
                      <li v-for="(condition, idx) in selectedStudentDetail.summary.medicalProfile.chronic_conditions" :key="`chronic-${idx}`">
                        {{ condition }}
                      </li>
                    </ul>
                  </div>
                  <div v-if="selectedStudentDetail.summary.medicalProfile.current_conditions" class="teacher-health-page__condition-list">
                    <p class="teacher-health-page__condition-label">{{ t('preschoolHealthPage.teacher.currentConditions') }}</p>
                    <ul>
                      <li v-for="(condition, idx) in selectedStudentDetail.summary.medicalProfile.current_conditions" :key="`current-${idx}`">
                        {{ condition }}
                      </li>
                    </ul>
                  </div>
                </section>

                <!-- Allergies -->
                <section v-if="selectedStudentDetail.summary.allergies && selectedStudentDetail.summary.allergies.length > 0" class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.allergies') }}</h3>
                  <div class="teacher-health-page__item-list">
                    <div v-for="allergy in selectedStudentDetail.summary.allergies" :key="allergy.id" class="teacher-health-page__list-item">
                      <div>
                        <p class="teacher-health-page__item-title">{{ allergy.allergy_name }}</p>
                        <p class="teacher-health-page__item-meta">{{ allergy.allergy_type }} - {{ allergy.severity }}</p>
                        <p v-if="allergy.reaction" class="teacher-health-page__item-detail">{{ allergy.reaction }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Medications -->
                <section v-if="selectedStudentDetail.summary.medications && selectedStudentDetail.summary.medications.length > 0" class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.medications') }}</h3>
                  <div class="teacher-health-page__item-list">
                    <div v-for="medication in selectedStudentDetail.summary.medications" :key="medication.id" class="teacher-health-page__list-item">
                      <div>
                        <p class="teacher-health-page__item-title">{{ medication.medication_name }}</p>
                        <p class="teacher-health-page__item-meta">{{ medication.dosage }} - {{ medication.frequency }}</p>
                        <p v-if="medication.reason" class="teacher-health-page__item-detail">{{ medication.reason }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Vaccinations -->
                <section v-if="selectedStudentDetail.summary.vaccinations && selectedStudentDetail.summary.vaccinations.length > 0" class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.vaccinations') }}</h3>
                  <div class="teacher-health-page__item-list">
                    <div v-for="vaccination in selectedStudentDetail.summary.vaccinations" :key="vaccination.id" class="teacher-health-page__list-item">
                      <div>
                        <p class="teacher-health-page__item-title">{{ vaccination.vaccine_name }}</p>
                        <p class="teacher-health-page__item-meta">{{ vaccination.vaccination_date }} - {{ vaccination.status }}</p>
                        <p v-if="vaccination.dose_number" class="teacher-health-page__item-detail">{{ t('preschoolHealthPage.teacher.doseNumber') }}: {{ vaccination.dose_number }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- Emergency Health Contacts -->
                <section v-if="selectedStudentDetail.summary.emergencyContacts && selectedStudentDetail.summary.emergencyContacts.length > 0" class="teacher-health-page__health-section">
                  <h3>{{ t('preschoolHealthPage.teacher.emergencyHealthContacts') }}</h3>
                  <div class="teacher-health-page__item-list">
                    <div v-for="contact in selectedStudentDetail.summary.emergencyContacts" :key="contact.id" class="teacher-health-page__list-item">
                      <div>
                        <p class="teacher-health-page__item-title">{{ contact.name }}</p>
                        <p class="teacher-health-page__item-meta">{{ contact.relationship }} - {{ contact.phone }}</p>
                        <p v-if="contact.is_primary || contact.primary" class="teacher-health-page__item-badge">
                          {{ t('preschoolHealthPage.teacher.primaryContact') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <!-- No Health Record State -->
              <div v-else class="teacher-health-page__no-health-record">
                {{ t('preschoolHealthPage.teacher.healthInfoNotAdded') }}
              </div>
            </template>
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.teacher-health-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.teacher-health-page__container {
  padding: 1.25rem;
  border-radius: 1.5rem;
  border: 1px solid #dbe3ef;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.99) 100%);
}

/* List View */
.teacher-health-page__list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.teacher-health-page__controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.teacher-health-page__search {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.teacher-health-page__search i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.teacher-health-page__search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.875rem;
  font-size: 0.95rem;
  font-family: inherit;
}

.teacher-health-page__search-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

/* Table */
.teacher-health-page__table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.teacher-health-page__table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.teacher-health-page__table th {
  padding: 0.875rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.teacher-health-page__table td {
  padding: 0.875rem;
  border-bottom: 1px solid #f1f5f9;
}

.teacher-health-page__row:hover {
  background: #f8fafc;
}

.teacher-health-page__col--number {
  width: 3rem;
}

.teacher-health-page__col--student {
  width: 20%;
}

.teacher-health-page__col--gender {
  width: 10%;
}

.teacher-health-page__col--dob {
  width: 12%;
}

.teacher-health-page__col--class {
  width: 15%;
}

.teacher-health-page__col--record {
  width: 12%;
}

.teacher-health-page__col--actions {
  width: 8%;
  text-align: center;
}

.teacher-health-page__view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #f8fafc;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.teacher-health-page__view-btn:hover {
  background: #eef2ff;
  border-color: #7c3aed;
}

.teacher-health-page__view-btn:active {
  background: #ddd6fe;
}

.teacher-health-page__student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.teacher-health-page__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  background: #e2e8f0;
}

.teacher-health-page__avatar--fallback {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.teacher-health-page__student-name {
  font-weight: 600;
  color: #0f172a;
}

.teacher-health-page__student-code {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.teacher-health-page__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: #fee2e2;
  color: #991b1b;
}

.teacher-health-page__badge--available {
  background: #dcfce7;
  color: #166534;
}

/* Pagination */
.teacher-health-page__pagination {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

/* Detail View */
.teacher-health-page__detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.teacher-health-page__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: #f1f5f9;
  color: #0f172a;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  width: fit-content;
}

.teacher-health-page__back:hover {
  background: #e2e8f0;
}

.teacher-health-page__health-status {
  padding: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  display: flex;
  gap: 1rem;
}

.teacher-health-page__summary-section {
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  padding: 1.5rem;
  border-radius: 1rem;
  color: #fff;
}

.teacher-health-page__summary-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.teacher-health-page__summary-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.teacher-health-page__summary-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacher-health-page__summary-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.teacher-health-page__summary-info p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.teacher-health-page__summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.teacher-health-page__summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.teacher-health-page__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.teacher-health-page__value {
  font-size: 1rem;
  font-weight: 600;
}

/* Health Sections */
.teacher-health-page__health-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.teacher-health-page__health-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
}

.teacher-health-page__health-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.teacher-health-page__health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.teacher-health-page__health-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.teacher-health-page__health-item .teacher-health-page__label {
  color: #64748b;
}

.teacher-health-page__health-item .teacher-health-page__value {
  color: #0f172a;
}

.teacher-health-page__notes {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border-left: 3px solid #0284c7;
  border-radius: 0.5rem;
}

.teacher-health-page__notes .teacher-health-page__label {
  color: #0369a1;
}

.teacher-health-page__notes p {
  margin: 0.5rem 0 0;
  color: #0f172a;
}

.teacher-health-page__condition-list {
  margin-bottom: 1rem;
}

.teacher-health-page__condition-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.teacher-health-page__condition-list ul {
  margin: 0;
  padding-left: 1.5rem;
}

.teacher-health-page__condition-list li {
  color: #475569;
  margin-bottom: 0.5rem;
}

.teacher-health-page__item-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.teacher-health-page__list-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border-left: 3px solid #7c3aed;
}

.teacher-health-page__item-title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.teacher-health-page__item-meta {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.teacher-health-page__item-detail {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #475569;
}

.teacher-health-page__item-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.3rem 0.65rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.teacher-health-page__no-health-record {
  padding: 2rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  text-align: center;
  color: #64748b;
}

/* States */
.teacher-health-page__loading,
.teacher-health-page__error,
.teacher-health-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.teacher-health-page__error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b91c1c;
}

.teacher-health-page__loading i {
  font-size: 1.5rem;
  color: #7c3aed;
}

/* Responsive */
@media (max-width: 1024px) {
  .teacher-health-page__col--dob,
  .teacher-health-page__col--class {
    display: none;
  }

  .teacher-health-page__summary-grid,
  .teacher-health-page__health-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .teacher-health-page__col--gender,
  .teacher-health-page__col--record {
    display: none;
  }

  .teacher-health-page__table {
    font-size: 0.9rem;
  }

  .teacher-health-page__summary-header {
    flex-direction: column;
    text-align: center;
  }

  .teacher-health-page__summary-avatar {
    width: 4rem;
    height: 4rem;
  }

  .teacher-health-page__summary-info h2 {
    font-size: 1.25rem;
  }
}
</style>
