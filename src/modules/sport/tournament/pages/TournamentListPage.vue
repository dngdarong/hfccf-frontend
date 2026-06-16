<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatsCards from '@/components/data-display/StatsCards.vue'
import { useLanguage } from '@/composables/useLanguage'
import { TOURNAMENT_STATES } from '@/modules/sport/tournament/constants/tournamentStates'
import TournamentListFilters from '@/modules/sport/tournament/components/list/TournamentListFilters.vue'
import TournamentTable from '@/modules/sport/tournament/components/list/TournamentTable.vue'
import {
  canEditTournamentConfiguration,
  normalizeTournamentState,
} from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'

defineOptions({
  name: 'SportTournamentListPage',
})

const router = useRouter()
const { t } = useLanguage()
const { tournaments, getTournamentById, loadTournaments } = useTournamentCrudCatalog()

const searchQuery = ref('')
const seasonFilter = ref('')
const stateFilter = ref('')

const pageTitle = computed(() => t('sportTournament.list.title'))
const pageSubtitle = computed(() => t('sportTournament.list.subtitle'))
const createButtonLabel = computed(() => t('sportTournament.list.createButton'))

const sortedTournaments = computed(() =>
  [...tournaments.value].sort((left, right) => {
    const leftName = String(left?.name || '').toLowerCase()
    const rightName = String(right?.name || '').toLowerCase()

    if (leftName === rightName) return 0
    return leftName > rightName ? 1 : -1
  }),
)

const seasonOptions = computed(() => {
  return [...new Set(sortedTournaments.value.map((item) => String(item.season || '').trim()).filter(Boolean))]
    .sort((left, right) => right.localeCompare(left))
})

const filteredTournaments = computed(() => {
  const query = String(searchQuery.value || '').trim().toLowerCase()

  return sortedTournaments.value.filter((tournament) => {
    let matchesQuery = true

    if (query) {
      const haystack = [
        tournament.name,
        tournament.season,
        tournament.organizer,
        tournament.location,
        tournament.description,
        tournament.sportType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      matchesQuery = haystack.includes(query)
    }

    if (matchesQuery && seasonFilter.value) {
      matchesQuery = String(tournament.season || '').trim() === String(seasonFilter.value).trim()
    }

    if (matchesQuery && stateFilter.value) {
      matchesQuery = normalizeTournamentState(tournament.state) === normalizeTournamentState(stateFilter.value)
    }

    return matchesQuery
  })
})

const summaryCards = computed(() => [
  {
    title: t('sportTournament.list.stats.total.title'),
    titleKey: 'sportTournament.list.stats.total.title',
    value: tournaments.value.length,
    label: t('sportTournament.list.stats.total.label'),
    labelKey: 'sportTournament.list.stats.total.label',
    status: 'info',
  },
  {
    title: t('sportTournament.list.stats.active.title'),
    titleKey: 'sportTournament.list.stats.active.title',
    value: tournaments.value.filter((item) => normalizeTournamentState(item.state) === 'active').length,
    label: t('sportTournament.list.stats.active.label'),
    labelKey: 'sportTournament.list.stats.active.label',
    status: 'success',
  },
  {
    title: t('sportTournament.list.stats.registrationOpen.title'),
    titleKey: 'sportTournament.list.stats.registrationOpen.title',
    value: tournaments.value.filter((item) => normalizeTournamentState(item.state) === 'registration_open').length,
    label: t('sportTournament.list.stats.registrationOpen.label'),
    labelKey: 'sportTournament.list.stats.registrationOpen.label',
    status: 'warning',
  },
  {
    title: t('sportTournament.list.stats.completed.title'),
    titleKey: 'sportTournament.list.stats.completed.title',
    value: tournaments.value.filter((item) => normalizeTournamentState(item.state) === 'completed').length,
    label: t('sportTournament.list.stats.completed.label'),
    labelKey: 'sportTournament.list.stats.completed.label',
    status: 'error',
  },
])

onMounted(() => {
  void loadTournaments()
})

function goToCreateTournament() {
  router.push({ name: 'dashboard-sport-admin-tournaments-create' })
}

function goToTournamentDetail(tournament) {
  const id = String(tournament?.id || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id } })
}

function goToTournamentEdit(tournament) {
  const id = String(tournament?.id || '').trim()
  if (!id) return

  const record = getTournamentById(id)
  if (!record) return

  if (!canEditTournamentConfiguration(record.state)) {
    router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id } })
    return
  }

  router.push({ name: 'dashboard-sport-admin-tournaments-edit', params: { id } })
}
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="sport-tournament-page__hero">
        <StatsCards :cards="summaryCards" />
      </div>

      <div class="sport-tournament-page__shell">
        <div class="sport-tournament-page__toolbar">
          <div class="sport-tournament-page__toolbar-copy">
            <p class="sport-tournament-page__eyebrow">{{ t('sportTournament.filters.season') }}</p>
            <h2 class="sport-tournament-page__title">{{ t('sportTournament.list.title') }}</h2>
            <p class="sport-tournament-page__subtitle">{{ t('sportTournament.list.subtitle') }}</p>
          </div>

          <div class="sport-tournament-page__toolbar-actions">
            <Button
              type="button"
              :label="createButtonLabel"
              icon="pi pi-plus"
              class="sport-tournament-page__create-button"
              @click="goToCreateTournament"
            />
          </div>
        </div>

        <TournamentListFilters
          v-model:searchQuery="searchQuery"
          v-model:seasonFilter="seasonFilter"
          v-model:stateFilter="stateFilter"
          :season-options="seasonOptions"
          :state-options="TOURNAMENT_STATES"
        />

        <TournamentTable
          :tournaments="filteredTournaments"
          :empty-text="t('sportTournament.list.empty')"
          @view="goToTournamentDetail"
          @edit="goToTournamentEdit"
        />
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-tournament-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-page__hero,
.sport-tournament-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-page__shell {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-page__toolbar-copy {
  min-width: 0;
}

.sport-tournament-page__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-page__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-page__subtitle {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.sport-tournament-page__toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.sport-tournament-page__create-button {
  min-height: 2.8rem;
  border-radius: 0.9rem;
  font-weight: 800;
}

@media (max-width: 640px) {
  .sport-tournament-page__shell {
    padding: 1.1rem;
  }

  .sport-tournament-page__title {
    font-size: 1.2rem;
  }
}
</style>

