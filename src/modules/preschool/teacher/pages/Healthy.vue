<script setup>
// Phase B replaces the teacher wellbeing scaffold with a real read-only health
// workflow for assigned students. Teachers can review alerts and log basic
// incidents/checks, but admin-only profile editing stays in the admin module.
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchMyPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import {
  fetchHealthAlerts,
  fetchStudentHealthSummary,
  fetchStudentHealthIncidents,
  fetchStudentHealthContacts,
  saveStudentHealthIncident,
  saveStudentHealthCheck,
} from '@/modules/preschool/services/api/preschoolHealthApi'
import { fetchStudentGuardianCommunications } from '@/modules/preschool/services/api/preschoolGuardianCommunicationApi'
import GuardianCommunicationTimeline from '@/modules/preschool/admin/components/guardian/GuardianCommunicationTimeline.vue'
import { resolveAvatarSource } from '@/utils/avatar'

defineOptions({
  name: 'PreschoolTeacherHealthyPage',
})

const { t } = useLanguage()

const students = ref([])
const selectedStudentId = ref('')
const selectedStudentSummary = ref(null)
const urgentAlerts = ref([])
const incidents = ref([])
const contacts = ref([])
const communications = ref(null)
const loadingStudents = ref(false)
const loadingSummary = ref(false)
const savingIncident = ref(false)
const savingCheck = ref(false)
const errorMessage = ref('')

const incidentForm = ref({
  incident_date: '',
  incident_type: '',
  severity: 'low',
  action_taken: '',
  notes: '',
  follow_up_needed: false,
  status: 'open',
})

const checkForm = ref({
  checked_at: '',
  temperature_celsius: '',
  weight_kg: '',
  height_cm: '',
  symptoms: '',
  remarks: '',
  status: 'recorded',
})

const selectedStudent = computed(() => students.value.find((student) => String(student.id) === String(selectedStudentId.value)) || null)

const studentRows = computed(() => students.value.map((student) => ({
  ...student,
  avatarUrl: resolveAvatarSource(student.avatarUrl || ''),
  fullName: student.fullName || student.name || '-',
  className: Array.isArray(student.classes) && student.classes.length
    ? student.classes.map((item) => item?.name || item?.code || '').filter(Boolean).join(', ')
    : student.className || student.class?.name || student.class?.code || '-',
})))

const alertCount = computed(() => selectedStudentSummary.value?.counts?.highSeverityIncidents ?? 0)
const activeAlerts = computed(() => urgentAlerts.value.filter((alert) => !['resolved', 'closed'].includes(String(alert.status || '').trim())))
const resolvedAlerts = computed(() => urgentAlerts.value.filter((alert) => ['resolved', 'closed'].includes(String(alert.status || '').trim())).slice(0, 5))

async function loadStudents() {
  loadingStudents.value = true
  errorMessage.value = ''

  try {
    const response = await fetchMyPreschoolStudents({ page: 1, perPage: 100 })
    students.value = response.items || []
    if (!selectedStudentId.value && students.value.length) {
      selectedStudentId.value = String(students.value[0].id)
    }
  } catch (error) {
    students.value = []
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loadingStudents.value = false
  }
}

async function loadStudentHealth() {
  const studentId = String(selectedStudentId.value || '').trim()
  if (!studentId) {
    selectedStudentSummary.value = null
    incidents.value = []
    contacts.value = []
    communications.value = null
    return
  }

  loadingSummary.value = true
  errorMessage.value = ''

  try {
    const [summary, alertsPayload, communicationsPayload] = await Promise.all([
      fetchStudentHealthSummary(studentId),
      fetchHealthAlerts({ student_id: studentId, scope: 'teacher' }),
      fetchStudentGuardianCommunications(studentId, { perPage: 5 }).catch(() => null),
    ])

    selectedStudentSummary.value = summary
    urgentAlerts.value = alertsPayload.items || []
    incidents.value = await fetchStudentHealthIncidents(studentId)
    contacts.value = await fetchStudentHealthContacts(studentId)
    communications.value = communicationsPayload
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolHealthPage.messages.loadFailed')
  } finally {
    loadingSummary.value = false
  }
}

function resetIncidentForm() {
  incidentForm.value = {
    incident_date: '',
    incident_type: '',
    severity: 'low',
    action_taken: '',
    notes: '',
    follow_up_needed: false,
    status: 'open',
  }
}

function resetCheckForm() {
  checkForm.value = {
    checked_at: '',
    temperature_celsius: '',
    weight_kg: '',
    height_cm: '',
    symptoms: '',
    remarks: '',
    status: 'recorded',
  }
}

async function submitIncident() {
  const studentId = String(selectedStudentId.value || '').trim()
  if (!studentId) return

  savingIncident.value = true
  try {
    await saveStudentHealthIncident(studentId, incidentForm.value)
    await loadStudentHealth()
    resetIncidentForm()
  } finally {
    savingIncident.value = false
  }
}

async function submitCheck() {
  const studentId = String(selectedStudentId.value || '').trim()
  if (!studentId) return

  savingCheck.value = true
  try {
    await saveStudentHealthCheck(studentId, checkForm.value)
    await loadStudentHealth()
    resetCheckForm()
  } finally {
    savingCheck.value = false
  }
}

watch(selectedStudentId, () => {
  loadStudentHealth()
})

onMounted(async () => {
  await loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="teacher-health-page">
      <HeaderSection
        :title="t('preschoolHealthPage.teacher.title')"
        :subtitle="t('preschoolHealthPage.teacher.subtitle')"
      />

      <div class="teacher-health-page__shell">
        <div class="teacher-health-page__layout">
          <aside class="teacher-health-page__sidebar">
            <p class="teacher-health-page__eyebrow">{{ t('preschoolHealthPage.teacher.assignedStudents') }}</p>
            <div v-if="loadingStudents" class="teacher-health-page__state">
              <i class="pi pi-spin pi-spinner" />
            </div>
            <div v-else class="teacher-health-page__student-list">
              <button
                v-for="student in studentRows"
                :key="student.id"
                type="button"
                class="teacher-health-page__student"
                :class="{ 'teacher-health-page__student--active': String(student.id) === String(selectedStudentId) }"
                @click="selectedStudentId = String(student.id)"
              >
                <img v-if="student.avatarUrl" :src="student.avatarUrl" :alt="student.fullName" class="teacher-health-page__avatar" />
                <div v-else class="teacher-health-page__avatar teacher-health-page__avatar--fallback">{{ (student.fullName || '?').charAt(0) }}</div>
                <div class="teacher-health-page__student-copy">
                  <div class="teacher-health-page__student-name">{{ student.fullName }}</div>
                  <div class="teacher-health-page__student-meta">{{ student.className }}</div>
                </div>
              </button>
            </div>
          </aside>

          <div class="teacher-health-page__content">
            <div v-if="errorMessage" class="teacher-health-page__state teacher-health-page__state--error">
              {{ errorMessage }}
            </div>

            <template v-else-if="selectedStudent">
              <div class="teacher-health-page__hero">
                <div>
                  <p class="teacher-health-page__eyebrow">{{ t('preschoolHealthPage.teacher.currentStudent') }}</p>
                  <h2 class="teacher-health-page__student-title">{{ selectedStudent.fullName || selectedStudent.name || '-' }}</h2>
                  <p class="teacher-health-page__student-subtitle">
                    {{ selectedStudent.publicId || selectedStudent.studentCode || '-' }} - {{ selectedStudent.className }}
                  </p>
                </div>
                <span class="teacher-health-page__badge">
                  {{ t('preschoolHealthPage.teacher.alerts') }}: {{ alertCount }}
                </span>
              </div>

              <div v-if="loadingSummary" class="teacher-health-page__state">
                <i class="pi pi-spin pi-spinner" />
              </div>

              <template v-else>
              <div class="teacher-health-page__summary-grid">
                <article class="teacher-health-page__summary-card">
                  <p>{{ t('preschoolHealthPage.summary.allergies') }}</p>
                  <strong>{{ selectedStudentSummary?.counts?.allergies ?? 0 }}</strong>
                </article>
                  <article class="teacher-health-page__summary-card">
                    <p>{{ t('preschoolHealthPage.summary.contacts') }}</p>
                    <strong>{{ selectedStudentSummary?.counts?.emergencyContacts ?? 0 }}</strong>
                  </article>
                  <article class="teacher-health-page__summary-card">
                    <p>{{ t('preschoolHealthPage.summary.incidents') }}</p>
                  <strong>{{ selectedStudentSummary?.counts?.incidents ?? 0 }}</strong>
                </article>
              </div>

              <div class="teacher-health-page__alert-summary">
                <article class="teacher-health-page__summary-card">
                  <p>{{ t('preschoolHealthPage.alerts.activeAlerts') }}</p>
                  <strong>{{ activeAlerts.length }}</strong>
                </article>
                <article class="teacher-health-page__summary-card">
                  <p>{{ t('preschoolHealthPage.alerts.critical') }}</p>
                  <strong>{{ activeAlerts.filter((alert) => ['high', 'critical'].includes(String(alert.severity || '').trim())).length }}</strong>
                </article>
              </div>

              <section class="teacher-health-page__panel teacher-health-page__panel--alerts">
                <div class="teacher-health-page__panel-header">
                  <h3>{{ t('preschoolHealthPage.teacher.urgentAlerts') }}</h3>
                  <span class="teacher-health-page__panel-note">{{ t('preschoolHealthPage.teacher.alertsVisibleToTeachers') }}</span>
                </div>
                <div v-if="urgentAlerts.length === 0" class="teacher-health-page__empty">
                  {{ t('preschoolHealthPage.messages.noUrgentAlerts') }}
                </div>
                <div v-else class="teacher-health-page__incident-list">
                  <article v-for="alert in urgentAlerts.slice(0, 5)" :key="alert.id" class="teacher-health-page__incident">
                    <div>
                      <p class="teacher-health-page__incident-title">{{ alert.title || alert.incident_type || alert.allergy_name || t('preschoolHealthPage.summary.alert') }}</p>
                      <p class="teacher-health-page__incident-meta">{{ alert.message || alert.notes || alert.description || '-' }}</p>
                      <p class="teacher-health-page__incident-meta">
                        {{ t('preschoolHealthPage.alerts.assignedTo') }}:
                        {{ alert.assignedTo?.fullName || alert.assignedTo?.username || t('preschoolHealthPage.alerts.unassigned') }}
                      </p>
                    </div>
                    <div class="teacher-health-page__incident-badges">
                      <span class="teacher-health-page__incident-badge" :data-severity="alert.severity || 'high'">
                        {{ t(`preschoolHealthPage.severity.${alert.severity || 'high'}`) }}
                      </span>
                      <span class="teacher-health-page__incident-badge" :data-status="alert.status || 'new'">
                        {{ t(`preschoolHealthPage.status.${alert.status || 'new'}`) }}
                      </span>
                    </div>
                  </article>
                </div>
              </section>

              <section v-if="communications" class="teacher-health-page__panel teacher-health-page__panel--communications">
                <GuardianCommunicationTimeline
                  compact
                  :title="t('preschoolGuardianCommunicationPage.timelineTitle')"
                  :subtitle="t('preschoolGuardianCommunicationPage.timelineSubtitle')"
                  :communications="communications.items || []"
                  :summary="communications.summary || {}"
                  :empty-text="t('preschoolGuardianCommunicationPage.messages.noCommunicationYet')"
                />
              </section>

              <div class="teacher-health-page__grid">
                <section class="teacher-health-page__panel">
                    <div class="teacher-health-page__panel-header">
                      <h3>{{ t('preschoolHealthPage.teacher.emergencyNotes') }}</h3>
                    </div>
                    <div v-if="contacts.length === 0" class="teacher-health-page__empty">
                      {{ t('preschoolHealthPage.messages.noContacts') }}
                    </div>
                    <div v-else class="teacher-health-page__contact-list">
                      <article v-for="contact in contacts" :key="contact.id" class="teacher-health-page__contact">
                        <div>
                          <p class="teacher-health-page__contact-name">{{ contact.name || contact.contactName || '-' }}</p>
                          <p class="teacher-health-page__contact-meta">
                            {{ contact.relationship || '-' }} - {{ contact.phone || '-' }}
                          </p>
                        </div>
                        <span v-if="contact.is_primary || contact.primary" class="teacher-health-page__primary">
                          {{ t('preschoolHealthPage.form.primaryContact') }}
                        </span>
                      </article>
                    </div>
                  </section>

                  <section class="teacher-health-page__panel">
                    <div class="teacher-health-page__panel-header">
                      <h3>{{ t('preschoolHealthPage.alerts.recentResolutions') }}</h3>
                    </div>
                    <div v-if="resolvedAlerts.length === 0" class="teacher-health-page__empty">
                      {{ t('preschoolHealthPage.alerts.noRecentResolutions') }}
                    </div>
                    <div v-else class="teacher-health-page__incident-list">
                      <article v-for="incident in resolvedAlerts" :key="incident.id" class="teacher-health-page__incident">
                        <div>
                          <p class="teacher-health-page__incident-title">{{ incident.incident_type || incident.incidentType || incident.name || '-' }}</p>
                          <p class="teacher-health-page__incident-meta">
                            {{ incident.resolutionNotes || incident.description || incident.notes || '-' }}
                          </p>
                          <p class="teacher-health-page__incident-meta">
                            {{ t('preschoolHealthPage.alerts.resolvedBy') }}:
                            {{ incident.resolvedBy?.fullName || incident.resolvedBy?.username || '-' }}
                          </p>
                        </div>
                        <div class="teacher-health-page__incident-badges">
                          <span class="teacher-health-page__incident-badge">{{ t(`preschoolHealthPage.status.${incident.status || 'resolved'}`) }}</span>
                          <span class="teacher-health-page__incident-badge" :data-severity="incident.severity || 'medium'">
                            {{ t(`preschoolHealthPage.severity.${incident.severity || 'medium'}`) }}
                          </span>
                        </div>
                      </article>
                    </div>
                  </section>
                </div>

                <div class="teacher-health-page__form-grid">
                  <section class="teacher-health-page__panel">
                    <div class="teacher-health-page__panel-header">
                      <h3>{{ t('preschoolHealthPage.teacher.logIncident') }}</h3>
                    </div>
                    <div class="teacher-health-page__form">
                      <label><span>{{ t('preschoolHealthPage.form.incidentDate') }}</span><input v-model="incidentForm.incident_date" type="date" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.incidentType') }}</span><input v-model="incidentForm.incident_type" type="text" /></label>
                      <label>
                        <span>{{ t('preschoolHealthPage.form.severity') }}</span>
                        <select v-model="incidentForm.severity">
                          <option value="low">{{ t('preschoolHealthPage.status.mild') }}</option>
                          <option value="medium">{{ t('preschoolHealthPage.status.moderate') }}</option>
                          <option value="high">{{ t('preschoolHealthPage.status.high') }}</option>
                          <option value="critical">{{ t('preschoolHealthPage.status.critical') }}</option>
                        </select>
                      </label>
                      <label><span>{{ t('preschoolHealthPage.form.actionTaken') }}</span><textarea v-model="incidentForm.action_taken" rows="2" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.remarks') }}</span><textarea v-model="incidentForm.notes" rows="2" /></label>
                      <label class="teacher-health-page__checkbox">
                        <input v-model="incidentForm.follow_up_needed" type="checkbox" />
                        <span>{{ t('preschoolHealthPage.form.followUpNeeded') }}</span>
                      </label>
                      <div class="teacher-health-page__actions">
                        <Button type="button" variant="secondary" size="sm" rounded="xl" :label="t('common.cancel')" @click="resetIncidentForm" />
                        <Button type="button" variant="primary" size="sm" rounded="xl" :label="t('preschoolHealthPage.teacher.logIncident')" :loading="savingIncident" @click="submitIncident" />
                      </div>
                    </div>
                  </section>

                  <section class="teacher-health-page__panel">
                    <div class="teacher-health-page__panel-header">
                      <h3>{{ t('preschoolHealthPage.teacher.logCheck') }}</h3>
                    </div>
                    <div class="teacher-health-page__form">
                      <label><span>{{ t('preschoolHealthPage.form.checkedAt') }}</span><input v-model="checkForm.checked_at" type="date" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.temperature') }}</span><input v-model="checkForm.temperature_celsius" type="number" step="0.1" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.weight') }}</span><input v-model="checkForm.weight_kg" type="number" step="0.1" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.height') }}</span><input v-model="checkForm.height_cm" type="number" step="0.1" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.symptoms') }}</span><textarea v-model="checkForm.symptoms" rows="2" /></label>
                      <label><span>{{ t('preschoolHealthPage.form.remarks') }}</span><textarea v-model="checkForm.remarks" rows="2" /></label>
                      <div class="teacher-health-page__actions">
                        <Button type="button" variant="secondary" size="sm" rounded="xl" :label="t('common.cancel')" @click="resetCheckForm" />
                        <Button type="button" variant="primary" size="sm" rounded="xl" :label="t('preschoolHealthPage.teacher.logCheck')" :loading="savingCheck" @click="submitCheck" />
                      </div>
                    </div>
                  </section>
                </div>
              </template>
            </template>

            <div v-else class="teacher-health-page__empty">
              {{ t('preschoolHealthPage.teacher.noStudentSelected') }}
            </div>
          </div>
        </div>
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

.teacher-health-page__shell {
  padding: 1rem;
  border: 1px solid #dbe3ef;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.teacher-health-page__layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.4fr);
  gap: 1rem;
}

.teacher-health-page__sidebar,
.teacher-health-page__content,
.teacher-health-page__panel,
.teacher-health-page__summary-card {
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.teacher-health-page__sidebar,
.teacher-health-page__content {
  padding: 1rem;
}

.teacher-health-page__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7c3aed;
}

.teacher-health-page__student-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 42rem;
  overflow: auto;
}

.teacher-health-page__student {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.8rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  cursor: pointer;
  text-align: left;
}

.teacher-health-page__student--active {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.teacher-health-page__avatar {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 9999px;
  object-fit: cover;
  background: #e2e8f0;
}

.teacher-health-page__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-weight: 800;
}

.teacher-health-page__student-copy {
  min-width: 0;
  flex: 1;
}

.teacher-health-page__student-name {
  font-weight: 700;
  color: #0f172a;
}

.teacher-health-page__student-meta {
  margin-top: 0.15rem;
  font-size: 0.82rem;
  color: #64748b;
}

.teacher-health-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  color: #fff;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  margin-bottom: 1rem;
}

.teacher-health-page__student-title {
  margin: 0.25rem 0 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.teacher-health-page__student-subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.teacher-health-page__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 800;
}

.teacher-health-page__summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.teacher-health-page__alert-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.teacher-health-page__panel--alerts {
  margin-bottom: 1rem;
}

.teacher-health-page__summary-card {
  padding: 0.9rem 1rem;
}

.teacher-health-page__summary-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.teacher-health-page__summary-card strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.5rem;
  color: #0f172a;
}

.teacher-health-page__grid,
.teacher-health-page__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.teacher-health-page__panel {
  padding: 1rem;
}

.teacher-health-page__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.teacher-health-page__panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.teacher-health-page__contact-list,
.teacher-health-page__incident-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.teacher-health-page__contact,
.teacher-health-page__incident {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.teacher-health-page__contact-name,
.teacher-health-page__incident-title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.teacher-health-page__contact-meta,
.teacher-health-page__incident-meta {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.teacher-health-page__primary,
.teacher-health-page__incident-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  background: #eef2ff;
  color: #4338ca;
  height: fit-content;
}

.teacher-health-page__incident-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: flex-start;
}

.teacher-health-page__incident-badge[data-severity='critical'] {
  background: #fee2e2;
  color: #991b1b;
}

.teacher-health-page__incident-badge[data-severity='high'] {
  background: #fef3c7;
  color: #92400e;
}

.teacher-health-page__panel-note {
  font-size: 0.78rem;
  color: #64748b;
}

.teacher-health-page__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.teacher-health-page__form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #0f172a;
}

.teacher-health-page__form label span {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.teacher-health-page__form input,
.teacher-health-page__form select,
.teacher-health-page__form textarea {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 0.85rem;
  background: #fff;
}

.teacher-health-page__checkbox {
  flex-direction: row !important;
  align-items: center;
}

.teacher-health-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.teacher-health-page__state,
.teacher-health-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 5rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.teacher-health-page__state--error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b91c1c;
}

@media (max-width: 1024px) {
  .teacher-health-page__layout,
  .teacher-health-page__grid,
  .teacher-health-page__form-grid,
  .teacher-health-page__summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
