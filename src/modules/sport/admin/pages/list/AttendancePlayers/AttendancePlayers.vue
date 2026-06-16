<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceHero from '@/modules/sport/admin/components/AttendanceHero.vue'
import AttendanceToolbar from '@/modules/sport/admin/components/AttendanceToolbar.vue'
import AttendanceTable from '@/modules/sport/admin/components/AttendanceTable.vue'
import {
  fetchSportAttendance,
  fetchSportPlayers,
  fetchSportTeams,
  saveSportPlayerAttendance,
} from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAdminAttendancePlayersPage',
})

const { t } = useLanguage()
const router = useRouter()
const toast = useToast()

const selectedTeamId = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const teamOptions = ref([])
const players = ref([])
const attendanceMap = ref({})
const loading = ref(false)
const teamsLoading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const statusOptions = computed(() => [
  { value: 'present', label: t('sportAttendanceStatus.present'), short: t('sportAttendanceStatus.presentShort'), active: 'border-emerald-300 bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
  { value: 'absent', label: t('sportAttendanceStatus.absent'), short: t('sportAttendanceStatus.absentShort'), active: 'border-rose-300 bg-rose-50 text-rose-700', ring: 'ring-rose-200' },
  { value: 'late', label: t('sportAttendanceStatus.late'), short: t('sportAttendanceStatus.lateShort'), active: 'border-amber-300 bg-amber-50 text-amber-700', ring: 'ring-amber-200' },
  { value: 'excused', label: t('sportAttendanceStatus.excused'), short: t('sportAttendanceStatus.excusedShort'), active: 'border-sky-300 bg-sky-50 text-sky-700', ring: 'ring-sky-200' },
])

const markedCount = computed(() => Object.values(attendanceMap.value).filter((entry) => entry.status).length)
const summary = computed(() => t('sportAdminPlayerAttendancePage.summary', { marked: markedCount.value, total: players.value.length }))
const selectedTeamLabel = computed(() => teamOptions.value.find((option) => String(option.value) === String(selectedTeamId.value))?.label || t('sportAdminPlayerAttendancePage.placeholders.team'))
const heroStats = computed(() => [
  {
    key: 'team',
    label: t('sportAdminPlayerAttendancePage.filters.team'),
    value: selectedTeamLabel.value,
  },
  {
    key: 'date',
    label: t('sportAdminPlayerAttendancePage.filters.date'),
    value: selectedDate.value,
  },
  {
    key: 'marked',
    label: t('sportAttendanceShared.progress'),
    value: `${markedCount.value}/${players.value.length}`,
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

function buildMap(playerList, existingRecords) {
  const map = {}
  for (const player of playerList) {
    const existing = existingRecords.find((record) => String(record.playerId) === String(player.id))
    map[player.id] = {
      status: existing?.status || '',
      note: existing?.note || '',
      existingId: existing?.id || null,
    }
  }
  return map
}

async function loadTeams() {
  teamsLoading.value = true
  try {
    const response = await fetchSportTeams({ page: 1, perPage: 100, status: 'active' })
    teamOptions.value = (response.items || []).map((team) => ({
      label: team.name || team.shortName || team.teamCode || `Team ${team.id}`,
      value: String(team.id),
    }))

    if (!selectedTeamId.value && teamOptions.value.length) {
      selectedTeamId.value = String(teamOptions.value[0].value)
    }
  } catch {
    teamOptions.value = []
  } finally {
    teamsLoading.value = false
  }
}

async function loadDay() {
  if (!selectedTeamId.value || !selectedDate.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const [playersResponse, attendanceResponse] = await Promise.all([
      fetchSportPlayers({ teamId: selectedTeamId.value, page: 1, perPage: 100 }),
      fetchSportAttendance({
        attendanceType: 'player',
        teamId: selectedTeamId.value,
        attendanceDate: selectedDate.value,
        page: 1,
        perPage: 100,
      }),
    ])

    players.value = playersResponse.items || []
    attendanceMap.value = buildMap(players.value, attendanceResponse.items || [])
  } catch (error) {
    errorMessage.value = error?.message || t('sportAdminPlayerAttendancePage.messages.loadFailed')
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

function toggleStatus(playerId, value) {
  if (!attendanceMap.value[playerId]) return
  attendanceMap.value[playerId].status = attendanceMap.value[playerId].status === value ? '' : value
}

function updateNote(playerId, note) {
  if (!attendanceMap.value[playerId]) return
  attendanceMap.value[playerId].note = note
}

async function saveAll() {
  if (!selectedTeamId.value || !selectedDate.value) return

  saving.value = true

  try {
    const tasks = players.value
      .filter((player) => attendanceMap.value[player.id]?.status)
      .map((player) => {
        const entry = attendanceMap.value[player.id]

        return saveSportPlayerAttendance({
          ...(entry.existingId ? { id: entry.existingId } : {}),
          teamId: selectedTeamId.value,
          playerId: player.id,
          attendanceDate: selectedDate.value,
          status: entry.status,
          note: entry.note || '',
        })
      })

    await Promise.all(tasks)
    toast.add({ severity: 'success', summary: t('sportAdminPlayerAttendancePage.messages.saved'), life: 3000 })
    await loadDay()
  } catch {
    toast.add({ severity: 'error', summary: t('sportAdminPlayerAttendancePage.messages.saveFailed'), life: 4000 })
  } finally {
    saving.value = false
  }
}

watch([selectedTeamId, selectedDate], () => {
  if (selectedTeamId.value && selectedDate.value) {
    void loadDay()
  }
}, { immediate: true })

onMounted(() => {
  void loadTeams()
})
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="sport-attendance-sheet">
      <HeaderSection
        :title="t('sportAdminPlayerAttendancePage.title')"
        :subtitle="t('sportAdminPlayerAttendancePage.subtitle')"
      />

      <AttendanceHero :stats="heroStats">
        <template #copy>
          <p class="hero-eyebrow">{{ t('sportAttendanceShared.playersEyebrow') }}</p>
          <h2 class="hero-title">{{ t('sportAdminPlayerAttendancePage.title') }}</h2>
          <p class="hero-text">{{ t('sportAdminPlayerAttendancePage.subtitle') }}</p>
        </template>
      </AttendanceHero>

      <AttendanceToolbar
        :team-id="selectedTeamId"
        :date="selectedDate"
        :team-options="teamOptions"
        :loading="loading"
        :teams-loading="teamsLoading"
        @update:team-id="selectedTeamId = $event"
        @update:date="selectedDate = $event"
        @shift-date="shiftDate"
        @go-today="selectedDate = todayIso()"
        @go-back="router.push({ name: 'dashboard-sport-admin-attendance' })"
      />

      <div v-if="!selectedTeamId" class="state-empty">
        {{ t('sportAdminPlayerAttendancePage.messages.selectTeam') }}
      </div>

      <div v-else-if="errorMessage" class="state-error">
        {{ errorMessage }}
      </div>

      <div v-else-if="loading" class="state-empty">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <div v-else-if="!players.length" class="state-empty">
        {{ t('sportAdminPlayerAttendancePage.messages.noPlayers') }}
      </div>

      <AttendanceTable
        v-else
        :players="players"
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
