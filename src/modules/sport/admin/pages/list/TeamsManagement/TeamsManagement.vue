<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import SearchFilterBar from '@/components/forms/SearchFilterBar.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import TeamsSummaryCards from './components/TeamsSummaryCards.vue'
import TeamsToolbar from './components/TeamsToolbar.vue'
import TeamsHighlights from './components/TeamsHighlights.vue'
import TeamsTable from './components/TeamsTable.vue'
import { normalize } from './utils/teamHelpers'
import { deleteSportTeam, fetchSportTeams } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportTeamsManagementPage',
})

const router = useRouter()
const { t, language } = useLanguage()
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)

const pageSize = 8
const isKh = computed(() => language.value === 'KH')
const statusOptions = ['active', 'pending', 'inactive']

const pageTitle = computed(() => t('sportTeamsManagement.title'))
const pageSubtitle = computed(() => t('sportTeamsManagement.subtitle'))
const addTeamLabel = computed(() => t('sportTeamsManagement.addButton'))
const searchPlaceholder = computed(() => t('sportTeamsManagement.searchPlaceholder'))
const tableEmptyText = computed(() => t('sportTeamsManagement.tableEmpty'))
const toolbarEyebrow = computed(() => t('sportTeamsManagement.toolbarEyebrow'))
const spotlightLabel = computed(() => t('sportTeamsManagement.spotlightLabel'))

const teams = ref([])

async function goToAddTeam() {
  await router.push({ name: 'dashboard-sport-admin-teams-add' })
}

async function goToDivisionManagement() {
  await router.push({ name: 'dashboard-sport-admin-divisions' })
}

async function goToPlayingStyleManagement() {
  await router.push({ name: 'dashboard-sport-admin-playing-styles' })
}

function onViewTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'view', id } })
}

function onEditTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'edit', id } })
}

async function onDeleteTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  await deleteSportTeam(id).catch(() => null)
  teams.value = teams.value.filter((item) => item.id !== id)
}

const filteredTeams = computed(() => {
  const query = normalize(searchQuery.value)

  return teams.value.filter((team) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(
        `${team.name} ${team.division} ${team.coach} ${team.captain} ${team.venue}`,
      )
      isMatch = haystack.includes(query)
    }

    if (isMatch && statusFilter.value) {
      isMatch = normalize(team.status) === normalize(statusFilter.value)
    }

    return isMatch
  })
})

const totalPages = computed(() => Math.max(Math.ceil(filteredTeams.value.length / pageSize), 1))
const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTeams.value.slice(start, start + pageSize).map((team, index) => ({
    ...team,
    rowNumber: start + index + 1,
  }))
})

const totalTeams = computed(() => teams.value.length)
const activeTeams = computed(
  () => teams.value.filter((team) => normalize(team.status) === 'active').length,
)
const pendingTeams = computed(
  () => teams.value.filter((team) => normalize(team.status) === 'pending').length,
)
const totalPlayers = computed(() =>
  teams.value.reduce((sum, team) => sum + Number(team.players || 0), 0),
)
const activeRateLabel = computed(() => {
  if (!totalTeams.value) return '0%'
  return `${Math.round((activeTeams.value / totalTeams.value) * 100)}%`
})
const toolbarSummary = computed(() =>
  t('sportTeamsManagement.toolbarSummary', { count: filteredTeams.value.length }),
)
const visibleRangeLabel = computed(() => {
  if (!filteredTeams.value.length) return t('sportTeamsManagement.noResults')

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredTeams.value.length)
  return t('sportTeamsManagement.visibleRange', {
    start,
    end,
    total: filteredTeams.value.length,
  })
})

const summaryCards = computed(() => [
  {
    id: 'teams',
    title: t('sportTeamsManagement.summary.total.title'),
    value: totalTeams.value,
    badge: t('sportTeamsManagement.summary.total.badge', { count: filteredTeams.value.length }),
    caption: t('sportTeamsManagement.summary.total.caption'),
    tone: 'info',
    icon:
      'M17 20h5V4H2v16h5m10 0v-2.5A2.5 2.5 0 0014.5 15h-5A2.5 2.5 0 007 17.5V20m7-10a3 3 0 11-6 0 3 3 0 016 0zm7-2a2 2 0 11-4 0 2 2 0 014 0zM3 8a2 2 0 114 0 2 2 0 01-4 0z',
  },
  {
    id: 'active',
    title: t('sportTeamsManagement.summary.active.title'),
    value: activeTeams.value,
    badge: t('sportTeamsManagement.summary.active.badge', { rate: activeRateLabel.value }),
    caption: t('sportTeamsManagement.summary.active.caption'),
    tone: 'success',
    icon: 'M5 13l4 4L19 7',
  },
  {
    id: 'pending',
    title: t('sportTeamsManagement.summary.pending.title'),
    value: pendingTeams.value,
    badge: pendingTeams.value
      ? t('sportTeamsManagement.summary.pending.badge')
      : t('sportTeamsManagement.summary.pending.badgeClear'),
    caption: t('sportTeamsManagement.summary.pending.caption'),
    tone: 'warning',
    icon:
      'M12 8v4m0 4h.01M10.3 3.86l-7.5 13a1 1 0 00.87 1.5h16.66a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z',
  },
  {
    id: 'players',
    title: t('sportTeamsManagement.summary.players.title'),
    value: totalPlayers.value,
    badge: t('sportTeamsManagement.summary.players.badge'),
    caption: t('sportTeamsManagement.summary.players.caption'),
    tone: 'danger',
    icon:
      'M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z',
  },
  {
    id: 'divisions',
    title: t('sportTeamsManagement.summary.divisions.title'),
    value: '',
    badge: t('sportTeamsManagement.summary.divisions.badge'),
    caption: t('sportTeamsManagement.summary.divisions.caption'),
    tone: 'primary',
    icon: 'M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-18v18m0-18h4a2 2 0 012 2v14a2 2 0 01-2 2h-4',
    action: 'divisions',
  },
  {
    id: 'playingStyles',
    title: t('sportTeamsManagement.summary.playingStyles.title'),
    value: '',
    badge: t('sportTeamsManagement.summary.playingStyles.badge'),
    caption: t('sportTeamsManagement.summary.playingStyles.caption'),
    tone: 'info',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    action: 'playingStyles',
  },
])

const highlightItems = computed(() => {
  const visiblePlayers = filteredTeams.value.reduce((sum, team) => sum + Number(team.players || 0), 0)
  const visibleMatches = filteredTeams.value.reduce((sum, team) => sum + Number(team.matches || 0), 0)
  const topPoints = filteredTeams.value.reduce(
    (max, team) => Math.max(max, Number(team.points || 0)),
    0,
  )

  return [
    {
      label: t('sportTeamsManagement.highlights.visibleTeams'),
      value: filteredTeams.value.length,
    },
    {
      label: t('sportTeamsManagement.highlights.visiblePlayers'),
      value: visiblePlayers,
    },
    {
      label: t('sportTeamsManagement.highlights.visibleMatches'),
      value: visibleMatches,
    },
    {
      label: t('sportTeamsManagement.highlights.topPoints'),
      value: topPoints,
    },
  ]
})

watch(
  () => filteredTeams.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)

onMounted(() => {
  fetchSportTeams({ perPage: 100 })
    .then((response) => {
      teams.value = response.items || []
    })
    .catch(() => {
      teams.value = []
    })
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'teams-management-page teams-management-page--kh' : 'teams-management-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <TeamsSummaryCards
        :cards="summaryCards"
        @card-action="(action) => {
          if (action === 'divisions') goToDivisionManagement()
          if (action === 'playingStyles') goToPlayingStyleManagement()
        }"
      />

      <div class="teams-shell">
        <TeamsToolbar
          :eyebrow="toolbarEyebrow"
          :summary="toolbarSummary"
          :range-label="visibleRangeLabel"
          :spotlight-label="spotlightLabel"
          :spotlight-value="activeTeams"
          :add-button-label="addTeamLabel"
          @add-team="goToAddTeam"
        />

        <SearchFilterBar
          class="w-full"
          v-model:searchQuery="searchQuery"
          v-model:statusFilter="statusFilter"
          :search-placeholder="searchPlaceholder"
          :status-options="statusOptions"
          :show-role-filter="false"
        />

        <TeamsHighlights :items="highlightItems" />

        <TeamsTable
          :teams="paginatedTeams"
          :empty-text="tableEmptyText"
          @view="onViewTeam"
          @edit="onEditTeam"
          @delete="onDeleteTeam"
        />

        <div v-if="totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="totalPages" class="mt-2" />
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.teams-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.teams-shell {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.teams-management-page--kh :deep(.actions-button-menu.p-menu),
.teams-management-page--kh :deep(.actions-button-menu .p-menu-item-link),
.teams-management-page--kh :deep(.actions-button-menu .p-menu-item-icon) {
  font-size: 0.92rem;
  line-height: 1.65;
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 640px) {
  .teams-shell {
    padding: 1.1rem;
  }
}
</style>
