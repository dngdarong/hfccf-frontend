<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceHero from '@/modules/sport/admin/components/AttendanceHero.vue'
import AttendanceDateToolbar from '@/modules/sport/admin/components/AttendanceDateToolbar.vue'
import CoachesAttendanceTable from '@/modules/sport/admin/components/CoachesAttendanceTable.vue'
import {
  fetchSportAttendance,
  fetchSportCoaches,
  saveSportCoachAttendance,
} from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAdminAttendanceCoachesPage',
})

const { t } = useLanguage()
const router = useRouter()
const toast = useToast()

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const coaches = ref([])
const attendanceMap = ref({})
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const statusOptions = computed(() => [
  { value: 'present', label: t('sportAttendanceStatus.present'), short: t('sportAttendanceStatus.presentShort'), active: 'border-emerald-300 bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
  { value: 'absent', label: t('sportAttendanceStatus.absent'), short: t('sportAttendanceStatus.absentShort'), active: 'border-rose-300 bg-rose-50 text-rose-700', ring: 'ring-rose-200' },
  { value: 'late', label: t('sportAttendanceStatus.late'), short: t('sportAttendanceStatus.lateShort'), active: 'border-amber-300 bg-amber-50 text-amber-700', ring: 'ring-amber-200' },
  { value: 'excused', label: t('sportAttendanceStatus.excused'), short: t('sportAttendanceStatus.excusedShort'), active: 'border-sky-300 bg-sky-50 text-sky-700', ring: 'ring-sky-200' },
])

const markedCount = computed(() => Object.values(attendanceMap.value).filter((entry) => entry.status).length)
const summary = computed(() => t('sportAdminCoachAttendancePage.summary', { marked: markedCount.value, total: coaches.value.length }))
const heroStats = computed(() => [
  {
    key: 'date',
    label: t('sportAdminCoachAttendancePage.filters.date'),
    value: selectedDate.value,
  },
  {
    key: 'coaches',
    label: t('sportAdminCoachAttendancePage.columns.coach'),
    value: `${coaches.value.length}`,
  },
  {
    key: 'progress',
    label: t('sportAttendanceShared.progress'),
    value: `${markedCount.value}/${coaches.value.length}`,
  },
])

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function shiftDate(days) {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + days)
  selectedDate.value = date.toISOString().slice(0, 10)
}

function buildMap(coachList, existingRecords) {
  const map = {}
  for (const coach of coachList) {
    const existing = existingRecords.find((record) => String(record.coachId) === String(coach.id))
    map[coach.id] = {
      status: existing?.status || '',
      note: existing?.note || '',
      existingId: existing?.id || null,
    }
  }
  return map
}

async function loadDay() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [coachesResponse, attendanceResponse] = await Promise.all([
      fetchSportCoaches({ page: 1, perPage: 100, status: 'active' }),
      fetchSportAttendance({
        attendanceType: 'coach',
        attendanceDate: selectedDate.value,
        page: 1,
        perPage: 100,
      }),
    ])

    coaches.value = coachesResponse.items || []
    attendanceMap.value = buildMap(coaches.value, attendanceResponse.items || [])
  } catch (error) {
    errorMessage.value = error?.message || t('sportAdminCoachAttendancePage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function markAll(status) {
  for (const id of Object.keys(attendanceMap.value)) {
    attendanceMap.value[id].status = status
  }
}

function clearAll() {
  for (const id of Object.keys(attendanceMap.value)) {
    attendanceMap.value[id].status = ''
    attendanceMap.value[id].note = ''
  }
}

function toggleStatus(coachId, value) {
  if (!attendanceMap.value[coachId]) return
  attendanceMap.value[coachId].status = attendanceMap.value[coachId].status === value ? '' : value
}

function updateNote(coachId, note) {
  if (!attendanceMap.value[coachId]) return
  attendanceMap.value[coachId].note = note
}

async function saveAll() {
  if (!selectedDate.value) return

  saving.value = true

  try {
    const tasks = coaches.value
      .filter((coach) => attendanceMap.value[coach.id]?.status)
      .map((coach) => {
        const entry = attendanceMap.value[coach.id]

        return saveSportCoachAttendance({
          ...(entry.existingId ? { id: entry.existingId } : {}),
          coachId: coach.id,
          attendanceDate: selectedDate.value,
          status: entry.status,
          note: entry.note || '',
        })
      })

    await Promise.all(tasks)
    toast.add({ severity: 'success', summary: t('sportAdminCoachAttendancePage.messages.saved'), life: 3000 })
    await loadDay()
  } catch {
    toast.add({ severity: 'error', summary: t('sportAdminCoachAttendancePage.messages.saveFailed'), life: 4000 })
  } finally {
    saving.value = false
  }
}

watch(selectedDate, () => {
  void loadDay()
}, { immediate: true })
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="sport-attendance-sheet">
      <HeaderSection
        :title="t('sportAdminCoachAttendancePage.title')"
        :subtitle="t('sportAdminCoachAttendancePage.subtitle')"
      />

      <AttendanceHero :stats="heroStats">
        <template #copy>
          <p class="hero-eyebrow">{{ t('sportAttendanceShared.coachesEyebrow') }}</p>
          <h2 class="hero-title">{{ t('sportAdminCoachAttendancePage.title') }}</h2>
          <p class="hero-text">{{ t('sportAdminCoachAttendancePage.subtitle') }}</p>
        </template>
      </AttendanceHero>

      <AttendanceDateToolbar
        :date="selectedDate"
        :loading="loading"
        @update:date="selectedDate = $event"
        @shift-date="shiftDate"
        @go-today="selectedDate = todayIso()"
        @go-back="router.push({ name: 'dashboard-sport-admin-attendance' })"
      />

      <div v-if="errorMessage" class="state-error">
        {{ errorMessage }}
      </div>

      <div v-else-if="loading" class="state-empty">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <div v-else-if="!coaches.length" class="state-empty">
        {{ t('sportAdminCoachAttendancePage.messages.noCoaches') }}
      </div>

      <CoachesAttendanceTable
        v-else
        :coaches="coaches"
        :attendance-map="attendanceMap"
        :status-options="statusOptions"
        :summary="summary"
        :marked-count="markedCount"
        :loading="loading"
        :saving="saving"
        @toggle-status="toggleStatus"
        @update-note="updateNote"
        @mark-all="markAll"
        @clear-all="clearAll"
        @save="saveAll"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-attendance-sheet {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 0.75rem;
}

.hero-eyebrow {
  margin: 0 0 0.35rem;
  color: #0f766e;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-title {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  font-weight: 800;
  line-height: 1.1;
}

.hero-text {
  margin: 0;
  max-width: 56ch;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
}

.state-empty,
.state-error {
  padding: 1rem 1.15rem;
  border-radius: 1.1rem;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #64748b;
  font-size: 0.92rem;
}

.state-error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}
</style>
