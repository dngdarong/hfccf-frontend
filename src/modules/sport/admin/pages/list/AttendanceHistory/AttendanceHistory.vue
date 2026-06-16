<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useToast } from 'primevue/usetoast'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceHistoryHero from './components/AttendanceHistoryHero.vue'
import AttendanceHistoryFilterBar from './components/AttendanceHistoryFilterBar.vue'
import AttendanceHistoryTable from './components/AttendanceHistoryTable.vue'
import { typeLabel } from './utils/attendanceHistoryHelpers'
import { fetchSportAttendance, fetchSportTeams } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAdminAttendanceHistoryPage',
})

const { t } = useLanguage()
const router = useRouter()
const toast = useToast()

const selectedType = ref('player')
const selectedTeamId = ref('')
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const teamOptions = ref([])
const records = ref([])
const currentPage = ref(1)
const pageSize = 20
const pagination = ref({
  page: 1,
  perPage: pageSize,
  total: 0,
  totalPages: 1,
})
const loading = ref(false)
const teamsLoading = ref(false)
const suppressFilterWatch = ref(false)
const errorMessage = ref('')
const resultCount = computed(() => Number(pagination.value.total) || records.value.length)
const activeFiltersCount = computed(() => {
  return [
    selectedType.value !== 'player',
    selectedTeamId.value !== '',
    searchQuery.value.trim() !== '',
    dateFrom.value !== '',
    dateTo.value !== '',
  ].filter(Boolean).length
})

const typeOptions = computed(() => [
  { label: t('sportAttendanceType.player'), value: 'player' },
  { label: t('sportAttendanceType.coach'), value: 'coach' },
])

async function loadTeams() {
  teamsLoading.value = true
  try {
    const response = await fetchSportTeams({ page: 1, perPage: 100, status: 'active' })
    teamOptions.value = (response.items || []).map((team) => ({
      label: team.name || team.shortName || team.teamCode || `Team ${team.id}`,
      value: String(team.id),
    }))
  } catch {
    teamOptions.value = []
  } finally {
    teamsLoading.value = false
  }
}

async function loadHistory(page = currentPage.value) {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchSportAttendance({
      attendanceType: selectedType.value,
      teamId: selectedTeamId.value,
      search: searchQuery.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      page,
      perPage: pageSize,
    })

    records.value = response.items || []
    pagination.value = response.pagination || {
      page,
      perPage: pageSize,
      total: records.value.length,
      totalPages: 1,
    }
    currentPage.value = pagination.value.page || page
  } catch (error) {
    errorMessage.value = error?.message || t('sportAdminAttendanceHistoryPage.messages.loadFailed')
    toast.add({ severity: 'error', summary: t('sportAdminAttendanceHistoryPage.messages.loadFailed'), life: 4000 })
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1
  void loadHistory(1)
}

async function resetFilters() {
  suppressFilterWatch.value = true
  selectedType.value = 'player'
  selectedTeamId.value = ''
  searchQuery.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  await nextTick()
  suppressFilterWatch.value = false
  void loadHistory(1)
}

function goToPage(page) {
  currentPage.value = page
  void loadHistory(page)
}

const heroStats = computed(() => [
  {
    key: 'type',
    label: t('sportAdminAttendanceHistoryPage.filters.type'),
    value: typeLabel(selectedType.value, t),
  },
  {
    key: 'filters',
    label: t('sportAttendanceShared.activeFilters'),
    value: `${activeFiltersCount.value}`,
  },
  {
    key: 'records',
    label: t('sportAttendanceShared.results'),
    value: `${resultCount.value}`,
  },
])

watch([selectedType, selectedTeamId, dateFrom, dateTo], () => {
  if (suppressFilterWatch.value) {
    return
  }
  currentPage.value = 1
  void loadHistory(1)
}, { immediate: true })

onMounted(() => {
  void loadTeams()
})
</script>

<template>
  <MainLayout>
    <Toast />
    <section class="att-history-page">
      <HeaderSection
        :title="t('sportAdminAttendanceHistoryPage.title')"
        :subtitle="t('sportAdminAttendanceHistoryPage.subtitle')"
      />

      <AttendanceHistoryHero :stats="heroStats" />

      <AttendanceHistoryFilterBar
        :selected-type="selectedType"
        :selected-team-id="selectedTeamId"
        :date-from="dateFrom"
        :date-to="dateTo"
        :search-query="searchQuery"
        :type-options="typeOptions"
        :team-options="teamOptions"
        :teams-loading="teamsLoading"
        :loading="loading"
        @update:selected-type="selectedType = $event"
        @update:selected-team-id="selectedTeamId = $event"
        @update:date-from="dateFrom = $event"
        @update:date-to="dateTo = $event"
        @update:search-query="searchQuery = $event"
        @apply="applyFilters"
        @reset="resetFilters"
        @back="router.push({ name: 'dashboard-sport-admin-attendance' })"
      />

      <div v-if="errorMessage" class="att-history-error">
        {{ errorMessage }}
      </div>

      <div v-else-if="loading" class="att-history-empty">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <div v-else-if="!records.length" class="att-history-empty">
        {{ t('sportAdminAttendanceHistoryPage.messages.noRecords') }}
      </div>

      <AttendanceHistoryTable
        v-else
        :records="records"
        :pagination="pagination"
        :current-page="currentPage"
        :team-options="teamOptions"
        @update:current-page="goToPage"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.att-history-page {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.att-history-empty,
.att-history-error {
  padding: 1rem 1.15rem;
  border-radius: 1.1rem;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #64748b;
  font-size: 0.92rem;
}

.att-history-error {
  border-color: #fecdd3;
  background: #fff1f2;
  color: #be123c;
}
</style>
