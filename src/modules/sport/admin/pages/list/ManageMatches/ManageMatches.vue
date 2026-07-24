<script setup>
/**
 * SportAdminManageMatchesPage
 * Placeholder page for match management (fixtures / live match feeds).
 * UI-only for now: future backend integration will use `sport_matches` and related tournament tables.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import Button from '@/components/buttons/Button.vue'
import MatchesSearchFilterBar from '@/modules/sport/admin/components/matches-management/MatchesSearchFilterBar.vue'
import MatchesTable from '@/modules/sport/admin/components/matches-management/MatchesTable.vue'
import PlayerInfoToolbar from '@/modules/sport/admin/components/player-management/PlayerInfoToolbar.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import MatchesSummaryCards from './components/MatchesSummaryCards.vue'
import {
  normalize,
  toTableMatch,
  matchTournamentLabel,
  getCompetitionOptions,
  getTournamentOptions,
} from './utils/matchHelpers'
import { deleteSportMatch, fetchSportMatches } from '@/modules/sport/services/sportApi'

defineOptions({
  name: 'SportAdminManageMatchesPage',
})

const router = useRouter()
const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

const title = computed(() => t('sportMatchesManagement.title'))
const subtitle = computed(() => t('sportMatchesManagement.subtitle'))
const tableEmptyText = computed(() => t('sportMatchesManagement.table.empty'))
const addMatchLabel = computed(() => t('sportMatchesManagement.actions.addButton'))

const searchQuery = ref('')
const competition = ref('')
const tournament = ref('')
const matchDateInput = ref('')
const currentPage = ref(1)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)
const showDeleteSuccess = ref(false)
const showDeleteError = ref(false)
const showLoadError = ref(false)
const deleteSuccessMessage = ref('')
const deleteErrorMessage = ref('')
const loadErrorMessage = ref('')
const selectedMatch = ref(null)

const pageSize = 5
const matches = ref([])

const competitionOptions = computed(() => getCompetitionOptions(matches.value))
const tournamentOptions = computed(() => getTournamentOptions(matches.value))

const toolbarEyebrow = computed(() => t('sportMatchesManagement.toolbarEyebrow'))

const filteredMatches = computed(() => {
  const query = normalize(searchQuery.value)

  return matches.value.filter((match) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(
        `${match.id} ${match.matchCode || match.match_code || ''} ${match.homeTeam} ${match.awayTeam} ${match.venue} ${matchTournamentLabel(match)} ${match.competitionType || match.competition || ''} ${match.status || ''} ${match.currentPeriod || match.current_period || ''}`,
      )
      isMatch = haystack.includes(query)
    }

    if (isMatch && competition.value) {
      isMatch = normalize(match.competitionType || match.competition || '') === normalize(competition.value)
    }

    if (isMatch && tournament.value) {
      isMatch = normalize(matchTournamentLabel(match)) === normalize(tournament.value)
    }

    if (isMatch && matchDateInput.value) {
      isMatch = String(match.schedule || match.scheduledAt || match.scheduled_at || '').startsWith(matchDateInput.value)
    }

    return isMatch
  })
})

const totalPages = computed(() => Math.max(Math.ceil(filteredMatches.value.length / pageSize), 1))
const paginatedMatches = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMatches.value.slice(start, start + pageSize).map((match, index) => ({
    ...toTableMatch(match),
    rowNumber: start + index + 1,
  }))
})

watch(
  () => filteredMatches.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  },
)

watch(
  [searchQuery, competition, tournament, matchDateInput],
  () => {
    currentPage.value = 1
  },
)

const totalMatches = computed(() => matches.value.length)
const liveMatches = computed(
  () => matches.value.filter((match) => normalize(match.status) === 'live').length,
)
const scheduledMatches = computed(
  () => matches.value.filter((match) => normalize(match.status) === 'scheduled').length,
)
const completedMatches = computed(
  () => matches.value.filter((match) => normalize(match.status) === 'completed').length,
)

const toolbarSummary = computed(() =>
  t('sportMatchesManagement.toolbarSummary', { count: filteredMatches.value.length }),
)

const visibleRangeLabel = computed(() => {
  if (!filteredMatches.value.length) return t('sportMatchesManagement.noResults')

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredMatches.value.length)

  return t('sportMatchesManagement.visibleRange', {
    start,
    end,
    total: filteredMatches.value.length,
  })
})

function onFiltersCleared() {
  currentPage.value = 1
}

const spotlightLabel = computed(() => t('sportMatchesManagement.spotlightLabel'))

const summaryCards = computed(() => [
  {
    id: 'matches',
    title: t('sportMatchesManagement.summary.total.title'),
    value: totalMatches.value,
    badge: t('sportMatchesManagement.summary.total.badge', { count: filteredMatches.value.length }),
    caption: t('sportMatchesManagement.summary.total.caption'),
    tone: 'info',
    icon:
      'M9 11V9a3 3 0 116 0v2m-7 0h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2zm4 4v2m0-6v1',
  },
  {
    id: 'live',
    title: t('sportMatchesManagement.summary.live.title'),
    value: liveMatches.value,
    badge: t('sportMatchesManagement.summary.live.badge'),
    caption: t('sportMatchesManagement.summary.live.caption'),
    tone: 'success',
    icon: 'M5 12l4 4L19 7',
  },
  {
    id: 'scheduled',
    title: t('sportMatchesManagement.summary.scheduled.title'),
    value: scheduledMatches.value,
    badge: t('sportMatchesManagement.summary.scheduled.badge'),
    caption: t('sportMatchesManagement.summary.scheduled.caption'),
    tone: 'warning',
    icon:
      'M12 8v4m0 4h.01M10.3 3.86l-7.5 13a1 1 0 00.87 1.5h16.66a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z',
  },
  {
    id: 'completed',
    title: t('sportMatchesManagement.summary.completed.title'),
    value: completedMatches.value,
    badge: t('sportMatchesManagement.summary.completed.badge'),
    caption: t('sportMatchesManagement.summary.completed.caption'),
    tone: 'danger',
    icon:
      'M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z',
  },
])

function onResults(match) {
  const id = String(match?.id || '').trim()
  if (!id) return
  // Keep navigation in the page so the table remains presentation-only.
  router.push({ name: 'dashboard-sport-admin-matches-results', params: { id } })
}

function onEdit(match) {
  const id = String(match?.id || '').trim()
  if (!id) return
  // Keep edit navigation explicit so the Add Match shell can reuse the same form in edit mode.
  router.push({ name: 'dashboard-sport-admin-matches-edit', params: { id } })
}

function onDelete(match) {
  const id = String(match?.id || '').trim()
  if (!id) return
  selectedMatch.value = match
  isDeleteOpen.value = true
}

async function goToAddMatch() {
  // Keep navigation explicit so the future match form can live on its own page.
  await router.push({ name: 'dashboard-sport-admin-matches-add' })
}

async function loadMatches() {
  try {
    const response = await fetchSportMatches({ perPage: 100 })
    matches.value = response.items || []
  } catch {
    loadErrorMessage.value = t('common.errorTryAgain')
    showLoadError.value = true
    matches.value = []
  }
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedMatch.value = null
}

async function onConfirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true

  const id = String(selectedMatch.value?.id || '').trim()
  if (!id) {
    isDeleting.value = false
    return onCancelDelete()
  }

  const homeTeam = String(selectedMatch.value?.homeTeam || '').trim()
  const awayTeam = String(selectedMatch.value?.awayTeam || '').trim()

  try {
    await deleteSportMatch(id)
    matches.value = matches.value.filter((item) => item.id !== id)

    deleteSuccessMessage.value = t('sportMatchesManagement.confirm.deletedMessage', {
      homeTeam: homeTeam || t('sportMatchesManagement.confirm.defaultTeam'),
      awayTeam: awayTeam || t('sportMatchesManagement.confirm.defaultTeam'),
    })
    showDeleteError.value = false
    showDeleteSuccess.value = true
  } catch {
    showDeleteSuccess.value = false
    deleteErrorMessage.value = t('common.errorTryAgain')
    showDeleteError.value = true
  } finally {
    onCancelDelete()
    isDeleting.value = false
  }
}

onMounted(() => {
  void loadMatches()
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'manage-matches-page manage-matches-page--kh' : 'manage-matches-page'">
      <HeaderSection :title="title" :subtitle="subtitle" />

      <MatchesSummaryCards :cards="summaryCards" />

      <div class="manage-matches-shell">
        <PlayerInfoToolbar
          :eyebrow="toolbarEyebrow"
          :title="toolbarSummary"
          :text="visibleRangeLabel"
          :spotlight-label="spotlightLabel"
          :spotlight-value="String(liveMatches)"
        >
          <template #actions>
            <Button
              type="button"
              :label="addMatchLabel"
              icon="pi pi-plus"
              class="manage-matches-add-button"
              @click="goToAddMatch"
            />
          </template>
        </PlayerInfoToolbar>

        <MatchesSearchFilterBar
          v-model:searchQuery="searchQuery"
          v-model:competition="competition"
          v-model:tournament="tournament"
          v-model:matchDateInput="matchDateInput"
          :competition-options="competitionOptions"
          :tournament-options="tournamentOptions"
          @clear="onFiltersCleared"
        />

        <div class="mt-5">
          <MatchesTable
            :matches="paginatedMatches"
            :t="t"
            :empty-text="tableEmptyText"
            @results="onResults"
            @edit="onEdit"
            @delete="onDelete"
          />

          <div v-if="totalPages > 1" class="mt-4 flex justify-end">
            <Pagination v-model="currentPage" :total-pages="totalPages" />
          </div>
        </div>
      </div>
    </section>
  </MainLayout>

  <AlertQuestion
    :show="isDeleteOpen"
    :loading="isDeleting"
    :title="t('sportMatchesManagement.confirm.deleteTitle')"
    :message="t('sportMatchesManagement.confirm.deleteMessage', {
      homeTeam: String(selectedMatch?.homeTeam || '').trim() || t('sportMatchesManagement.confirm.defaultTeam'),
      awayTeam: String(selectedMatch?.awayTeam || '').trim() || t('sportMatchesManagement.confirm.defaultTeam'),
    })"
    :confirm-text="t('common.delete')"
    :cancel-text="t('common.cancel')"
    type="danger"
    @confirm="onConfirmDelete"
    @cancel="onCancelDelete"
  />

  <AlertSuccess
    :show="showDeleteSuccess"
    :title="t('common.success')"
    :message="deleteSuccessMessage || t('common.actionCompleted')"
    :button-text="t('common.close')"
    @close="showDeleteSuccess = false"
  />

  <AlertError
    :show="showDeleteError"
    :title="t('common.errorOccurred')"
    :message="deleteErrorMessage || t('common.errorTryAgain')"
    :button-text="t('common.close')"
    @close="showDeleteError = false"
  />

  <AlertError
    :show="showLoadError"
    :title="t('common.errorOccurred')"
    :message="loadErrorMessage || t('common.errorTryAgain')"
    :button-text="t('common.close')"
    @close="showLoadError = false"
  />
</template>

<style scoped>
.manage-matches-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.manage-matches-add-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

.manage-matches-shell {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.manage-matches-page--kh .manage-matches-shell {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 640px) {
  .manage-matches-shell {
    padding: 1.1rem;
  }
}
</style>
