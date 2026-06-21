<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import {
  acknowledgeGuardianCommunication,
  cancelGuardianCommunication,
  createStudentGuardianCommunication,
  fetchGuardianCommunications,
  markGuardianCommunicationSent,
} from '@/modules/preschool/services/api/preschoolGuardianCommunicationApi'
import GuardianCommunicationTimeline from '@/modules/preschool/admin/components/guardian/GuardianCommunicationTimeline.vue'

defineOptions({
  name: 'PreschoolGuardianCommunicationDashboard',
})

const router = useRouter()
const { t } = useLanguage()

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const communications = ref([])
const summary = ref({ total: 0, queued: 0, sent: 0, acknowledged: 0, failed: 0, cancelled: 0 })
const studentOptions = ref([])
const filters = ref({
  search: '',
  status: 'all',
  channel: 'all',
  sourceType: 'all',
  studentId: '',
})
const noteForm = ref({
  studentId: '',
  subject: '',
  message: '',
  severity: 'medium',
  channel: 'manual_note',
})

const statusOptions = computed(() => [
  { label: t('common.all'), value: 'all' },
  { label: t('preschoolGuardianCommunicationPage.status.draft'), value: 'draft' },
  { label: t('preschoolGuardianCommunicationPage.status.queued'), value: 'queued' },
  { label: t('preschoolGuardianCommunicationPage.status.sent'), value: 'sent' },
  { label: t('preschoolGuardianCommunicationPage.status.acknowledged'), value: 'acknowledged' },
  { label: t('preschoolGuardianCommunicationPage.status.failed'), value: 'failed' },
  { label: t('preschoolGuardianCommunicationPage.status.cancelled'), value: 'cancelled' },
])

const channelOptions = computed(() => [
  { label: t('common.all'), value: 'all' },
  { label: t('preschoolGuardianCommunicationPage.channels.in_app'), value: 'in_app' },
  { label: t('preschoolGuardianCommunicationPage.channels.phone'), value: 'phone' },
  { label: t('preschoolGuardianCommunicationPage.channels.sms'), value: 'sms' },
  { label: t('preschoolGuardianCommunicationPage.channels.email'), value: 'email' },
  { label: t('preschoolGuardianCommunicationPage.channels.manual_note'), value: 'manual_note' },
])

const sourceTypeOptions = computed(() => [
  { label: t('common.all'), value: 'all' },
  { label: t('preschoolGuardianCommunicationPage.sources.health_alert'), value: 'health_alert' },
  { label: t('preschoolGuardianCommunicationPage.sources.attendance'), value: 'attendance' },
  { label: t('preschoolGuardianCommunicationPage.sources.assessment'), value: 'assessment' },
  { label: t('preschoolGuardianCommunicationPage.sources.enrollment'), value: 'enrollment' },
  { label: t('preschoolGuardianCommunicationPage.sources.governance_issue'), value: 'governance_issue' },
  { label: t('preschoolGuardianCommunicationPage.sources.manual_note'), value: 'manual_note' },
])

const studentLabelMap = computed(() => new Map(studentOptions.value.map((student) => [String(student.value), student.label])))

const selectedStudentLabel = computed(() => studentLabelMap.value.get(String(noteForm.value.studentId || '')) || '')

async function loadStudents() {
  try {
    const response = await fetchPreschoolStudents({ page: 1, perPage: 200, search: '' })
    studentOptions.value = (response.items || []).map((student) => ({
      label: `${student.fullName || student.name || '-'}${student.publicId || student.studentCode ? ` (${student.publicId || student.studentCode})` : ''}`,
      value: student.id,
    }))
  } catch {
    studentOptions.value = []
  }
}

async function loadCommunications() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchGuardianCommunications({
      search: filters.value.search,
      status: filters.value.status,
      channel: filters.value.channel,
      sourceType: filters.value.sourceType,
      studentId: filters.value.studentId,
      perPage: 100,
      page: 1,
    })

    communications.value = payload.items || []
    summary.value = payload.pagination
      ? {
          total: payload.pagination.total ?? communications.value.length,
          queued: communications.value.filter((item) => item.status === 'queued').length,
          sent: communications.value.filter((item) => item.status === 'sent').length,
          acknowledged: communications.value.filter((item) => item.status === 'acknowledged').length,
          failed: communications.value.filter((item) => item.status === 'failed').length,
          cancelled: communications.value.filter((item) => item.status === 'cancelled').length,
        }
      : summary.value
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGuardianCommunicationPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

async function submitNote() {
  if (!noteForm.value.studentId) return

  saving.value = true
  errorMessage.value = ''
  try {
    await createStudentGuardianCommunication(noteForm.value.studentId, {
      subject: noteForm.value.subject,
      message: noteForm.value.message,
      severity: noteForm.value.severity,
      channel: noteForm.value.channel,
    })

    noteForm.value.subject = ''
    noteForm.value.message = ''
    await loadCommunications()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGuardianCommunicationPage.messages.saveFailed')
  } finally {
    saving.value = false
  }
}

async function handleMarkSent(item) {
  if (!item?.id) return
  await markGuardianCommunicationSent(item.id)
  await loadCommunications()
}

async function handleAcknowledge(item) {
  if (!item?.id) return
  await acknowledgeGuardianCommunication(item.id)
  await loadCommunications()
}

async function handleCancel(item) {
  if (!item?.id) return
  await cancelGuardianCommunication(item.id)
  await loadCommunications()
}

function openStudentProfile(studentId) {
  const id = String(studentId || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-preschool-admin-student-profile', params: { id } })
}

watch(filters, () => {
  loadCommunications()
}, { deep: true })

onMounted(async () => {
  await Promise.all([loadStudents(), loadCommunications()])
})
</script>

<template>
  <MainLayout>
    <section class="guardian-communication-dashboard">
      <HeaderSection
        :title="t('preschoolGuardianCommunicationPage.title')"
        :subtitle="t('preschoolGuardianCommunicationPage.subtitle')"
      />

      <div class="guardian-communication-dashboard__shell">
        <div class="guardian-communication-dashboard__hero">
          <div>
            <p class="guardian-communication-dashboard__eyebrow">
              {{ t('preschoolGuardianCommunicationPage.hero.eyebrow') }}
            </p>
            <h2 class="guardian-communication-dashboard__hero-title">
              {{ t('preschoolGuardianCommunicationPage.hero.title') }}
            </h2>
            <p class="guardian-communication-dashboard__hero-subtitle">
              {{ t('preschoolGuardianCommunicationPage.hero.subtitle') }}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            rounded="xl"
            :label="t('preschoolGuardianCommunicationPage.actions.backToStudent')"
            @click="openStudentProfile(filters.studentId || noteForm.studentId)"
          />
        </div>

        <div class="guardian-communication-dashboard__filters">
          <input v-model="filters.search" type="search" class="guardian-communication-dashboard__input" :placeholder="t('preschoolGuardianCommunicationPage.filters.searchPlaceholder')" />
          <select v-model="filters.status" class="guardian-communication-dashboard__input">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="filters.channel" class="guardian-communication-dashboard__input">
            <option v-for="option in channelOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="filters.sourceType" class="guardian-communication-dashboard__input">
            <option v-for="option in sourceTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="filters.studentId" class="guardian-communication-dashboard__input">
            <option value="">{{ t('preschoolGuardianCommunicationPage.filters.allStudents') }}</option>
            <option v-for="student in studentOptions" :key="student.value" :value="student.value">{{ student.label }}</option>
          </select>
        </div>

        <div v-if="errorMessage" class="guardian-communication-dashboard__state guardian-communication-dashboard__state--error">
          {{ errorMessage }}
        </div>

        <div class="guardian-communication-dashboard__content">
          <section class="guardian-communication-dashboard__note-card">
            <div>
              <p class="guardian-communication-dashboard__section-eyebrow">{{ t('preschoolGuardianCommunicationPage.manualNote') }}</p>
              <h3 class="guardian-communication-dashboard__section-title">{{ t('preschoolGuardianCommunicationPage.contactGuardian') }}</h3>
            </div>

            <div class="guardian-communication-dashboard__note-form">
              <select v-model="noteForm.studentId" class="guardian-communication-dashboard__input">
                <option value="">{{ t('preschoolGuardianCommunicationPage.filters.selectStudent') }}</option>
                <option v-for="student in studentOptions" :key="student.value" :value="student.value">{{ student.label }}</option>
              </select>
              <input v-model="noteForm.subject" type="text" class="guardian-communication-dashboard__input" :placeholder="t('preschoolGuardianCommunicationPage.filters.subjectPlaceholder')" />
              <textarea v-model="noteForm.message" class="guardian-communication-dashboard__textarea" rows="4" :placeholder="t('preschoolGuardianCommunicationPage.filters.messagePlaceholder')" />
              <div class="guardian-communication-dashboard__note-actions">
                <select v-model="noteForm.severity" class="guardian-communication-dashboard__input">
                  <option value="low">{{ t('preschoolGuardianCommunicationPage.severity.low') }}</option>
                  <option value="medium">{{ t('preschoolGuardianCommunicationPage.severity.medium') }}</option>
                  <option value="high">{{ t('preschoolGuardianCommunicationPage.severity.high') }}</option>
                  <option value="critical">{{ t('preschoolGuardianCommunicationPage.severity.critical') }}</option>
                </select>
                <Button type="button" variant="primary" rounded="xl" :loading="saving" :disabled="!noteForm.studentId || !noteForm.subject || !noteForm.message" :label="t('preschoolGuardianCommunicationPage.actions.saveNote')" @click="submitNote" />
              </div>
              <p v-if="selectedStudentLabel" class="guardian-communication-dashboard__note-hint">
                {{ t('preschoolGuardianCommunicationPage.messages.noteForStudent', { student: selectedStudentLabel }) }}
              </p>
            </div>
          </section>

          <GuardianCommunicationTimeline
            :title="t('preschoolGuardianCommunicationPage.timelineTitle')"
            :subtitle="t('preschoolGuardianCommunicationPage.timelineSubtitle')"
            :communications="communications"
            :summary="summary"
            :loading="loading"
            :empty-text="t('preschoolGuardianCommunicationPage.messages.noCommunicationYet')"
            :show-actions="true"
            @mark-sent="handleMarkSent"
            @acknowledge="handleAcknowledge"
            @cancel="handleCancel"
            @refresh="loadCommunications"
          />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.guardian-communication-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.guardian-communication-dashboard__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dbe3ef;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.guardian-communication-dashboard__hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  color: #fff;
}

.guardian-communication-dashboard__eyebrow,
.guardian-communication-dashboard__section-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #93c5fd;
}

.guardian-communication-dashboard__hero-title,
.guardian-communication-dashboard__section-title {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
  font-weight: 800;
}

.guardian-communication-dashboard__hero-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.guardian-communication-dashboard__filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.6rem;
}

.guardian-communication-dashboard__input,
.guardian-communication-dashboard__textarea {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.9rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.7rem 0.85rem;
  font: inherit;
  color: #0f172a;
}

.guardian-communication-dashboard__textarea {
  min-height: 7rem;
  resize: vertical;
}

.guardian-communication-dashboard__content {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.2fr);
  gap: 1rem;
}

.guardian-communication-dashboard__note-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 18px 36px -30px rgba(15, 23, 42, 0.45);
}

.guardian-communication-dashboard__note-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.guardian-communication-dashboard__note-actions {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}

.guardian-communication-dashboard__note-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.guardian-communication-dashboard__state {
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}

.guardian-communication-dashboard__state--error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .guardian-communication-dashboard__filters,
  .guardian-communication-dashboard__content {
    grid-template-columns: 1fr;
  }
}
</style>
