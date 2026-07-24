<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceHero from '@/modules/sport/admin/components/AttendanceHero.vue'
import AttendanceToolbar from '@/modules/sport/admin/components/AttendanceToolbar.vue'
import AttendanceTable from '@/modules/sport/admin/components/AttendanceTable.vue'
import {
  fetchSportAttendance,
  fetchSportTeams,
  saveSportPlayerAttendance,
  fetchCoachTeams,
} from '@/modules/sport/services/sportApi'
import { fetchTeamRoster } from '@/modules/sport/services/api/teamRosterApi'

defineOptions({
  name: 'SportAdminAttendancePlayersPage',
})

const { t, language } = useLanguage()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const isCoachAttendanceRoute = computed(() => route.name === 'dashboard-sport-coach-attendance')

const selectedTeamId = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const teamOptions = ref([])
const players = ref([])
const currentPage = ref(1)
const pageSize = 5
const attendanceMap = ref({})
const loading = ref(false)
const teamsLoading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const pageTitle = computed(() => (
  isCoachAttendanceRoute.value
    ? t('nav.items.attendancePlayers')
    : t('sportAdminPlayerAttendancePage.title')
))

const pageSubtitle = computed(() => (
  isCoachAttendanceRoute.value
    ? t('sportCoachPlayerAttendancePage.subtitle')
    : t('sportAdminPlayerAttendancePage.subtitle')
))

const selectTeamMessage = computed(() => (
  t('sportAdminPlayerAttendancePage.messages.selectTeam')
))

const noAssignedTeamsMessage = computed(() => (
  isCoachAttendanceRoute.value
    ? t('sportCoachPlayerAttendancePage.messages.noTeams')
    : t('sportAdminPlayerAttendancePage.messages.selectTeam')
))

const statusOptions = computed(() => [
  { value: 'present', label: t('sportAttendanceStatus.present'), short: t('sportAttendanceStatus.presentShort'), active: 'border-emerald-600 bg-emerald-600 text-white font-bold', ring: 'ring-2 ring-emerald-300' },
  { value: 'absent', label: t('sportAttendanceStatus.absent'), short: t('sportAttendanceStatus.absentShort'), active: 'border-rose-600 bg-rose-600 text-white font-bold', ring: 'ring-2 ring-rose-300' },
  { value: 'late', label: t('sportAttendanceStatus.late'), short: t('sportAttendanceStatus.lateShort'), active: 'border-amber-600 bg-amber-500 text-white font-bold', ring: 'ring-2 ring-amber-300' },
  { value: 'excused', label: t('sportAttendanceStatus.excused'), short: t('sportAttendanceStatus.excusedShort'), active: 'border-blue-600 bg-blue-600 text-white font-bold', ring: 'ring-2 ring-blue-300' },
])

const markedCount = computed(() => Object.values(attendanceMap.value).filter((entry) => entry.status).length)
const totalPages = computed(() => Math.max(Math.ceil(players.value.length / pageSize), 1))
const paginatedPlayers = computed(() => players.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const summary = computed(() => t('sportAdminPlayerAttendancePage.summary', { marked: markedCount.value, total: players.value.length }))
const selectedTeamLabel = computed(() => teamOptions.value.find((option) => String(option.value) === String(selectedTeamId.value))?.label || t('sportAdminPlayerAttendancePage.placeholders.team'))
const selectedDateLabel = computed(() => {
  const value = selectedDate.value

  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(language.value === 'KH' ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
})
const heroStats = computed(() => [
  {
    key: 'team',
    label: t('sportAdminPlayerAttendancePage.filters.team'),
    value: selectedTeamLabel.value,
  },
  {
    key: 'date',
    label: t('sportAdminPlayerAttendancePage.filters.date'),
    value: selectedDateLabel.value,
    nowrap: true,
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

function syncCoachRouteTeamId(teamId) {
  if (!isCoachAttendanceRoute.value || !route.name) return

  const nextQuery = { ...route.query }

  if (teamId) {
    nextQuery.teamId = teamId
  } else {
    delete nextQuery.teamId
  }

  const currentTeamId = String(route.query.teamId || '').trim()
  if (currentTeamId === String(teamId || '').trim()) return

  router.replace({ name: route.name, query: nextQuery }).catch(() => {})
}

function setSelectedTeamId(teamId, { syncRoute = false } = {}) {
  selectedTeamId.value = String(teamId || '').trim()

  if (syncRoute) {
    syncCoachRouteTeamId(selectedTeamId.value)
  }
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
    const response = isCoachAttendanceRoute.value
      ? await fetchCoachTeams({ page: 1, perPage: 100, status: 'active' })
      : await fetchSportTeams({ page: 1, perPage: 100, status: 'active' })
    teamOptions.value = (response.items || []).map((team) => ({
      label: team.name || team.shortName || team.teamCode || `Team ${team.id}`,
      value: String(team.id),
    }))

    const routeTeamId = String(route.query.teamId || '').trim()
    if (isCoachAttendanceRoute.value) {
      if (routeTeamId) {
        setSelectedTeamId(routeTeamId)
      } else if (teamOptions.value.length === 1) {
        setSelectedTeamId(teamOptions.value[0].value, { syncRoute: true })
      } else {
        setSelectedTeamId('')
      }
    } else {
      const initialTeamId = routeTeamId && teamOptions.value.some((option) => String(option.value) === routeTeamId)
        ? routeTeamId
        : String(selectedTeamId.value || teamOptions.value[0]?.value || '')

      if (initialTeamId) {
        setSelectedTeamId(initialTeamId)
      } else if (!selectedTeamId.value && teamOptions.value.length) {
        setSelectedTeamId(teamOptions.value[0].value)
      }
    }
  } catch {
    teamOptions.value = []
    errorMessage.value = t('sportAdminPlayerAttendancePage.messages.loadFailed')
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
      fetchTeamRoster(selectedTeamId.value),
      fetchSportAttendance({
        attendanceType: 'player',
        teamId: selectedTeamId.value,
        attendanceDate: selectedDate.value,
        page: 1,
        perPage: 100,
      }),
    ])

    players.value = playersResponse.players || []
    currentPage.value = 1
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
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <AttendanceHero :stats="heroStats">
        <template #copy>
          <p class="hero-eyebrow">{{ t('sportAttendanceShared.playersEyebrow') }}</p>
          <p class="hero-text">{{ pageSubtitle }}</p>
        </template>
      </AttendanceHero>

      <AttendanceToolbar
        :team-id="selectedTeamId"
        :date="selectedDate"
        :team-options="teamOptions"
        :loading="loading"
        :teams-loading="teamsLoading"
        :show-back="!isCoachAttendanceRoute"
        @update:team-id="setSelectedTeamId($event, { syncRoute: isCoachAttendanceRoute })"
        @update:date="selectedDate = $event"
        @shift-date="shiftDate"
        @go-today="selectedDate = todayIso()"
        @go-back="router.push({ name: 'dashboard-sport-admin-attendance' })"
      />

      <div v-if="loading || teamsLoading" class="state-empty">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="errorMessage" class="state-error">
        {{ errorMessage }}
      </div>

      <div v-else-if="!selectedTeamId && !teamOptions.length" class="state-empty">
        {{ noAssignedTeamsMessage }}
      </div>

      <div v-else-if="!selectedTeamId" class="state-empty">
        {{ selectTeamMessage }}
      </div>

      <div v-else-if="!players.length" class="state-empty">
        {{ t('sportAdminPlayerAttendancePage.messages.noPlayers') }}
      </div>

      <AttendanceTable
        v-else
        :players="paginatedPlayers"
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
      <div v-if="selectedTeamId && totalPages > 1" class="flex justify-end">
        <Pagination v-model="currentPage" :total-pages="totalPages" />
      </div>
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
