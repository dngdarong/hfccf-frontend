<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentStatusBadge from '@/modules/sport/tournament/components/shared/TournamentStatusBadge.vue'
import TournamentStandingsCard from '@/modules/sport/tournament/components/standings/TournamentStandingsCard.vue'
import TournamentStandingsTable from '@/modules/sport/tournament/components/standings/TournamentStandingsTable.vue'
import TournamentFixtureGroupTabs from '@/modules/sport/tournament/components/fixtures/TournamentFixtureGroupTabs.vue'
import { getTournamentStateMeta } from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'
import { useTournamentStandings } from '@/modules/sport/tournament/composables/useTournamentStandings'
import { fetchTournamentStandings, recalculateTournamentStandings } from '@/modules/sport/tournament/api/tournamentApi'

defineOptions({
  name: 'SportTournamentStandingsPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()
const { getTournamentById, loadTournament, setTournamentRecord } = useTournamentCatalog()

const tournamentId = computed(() => String(route.params.id || '').trim())
const tournament = computed(() => (tournamentId.value ? getTournamentById(tournamentId.value) : null))
const isRecalculating = ref(false)
const errorMessage = ref('')
const stateMeta = computed(() => getTournamentStateMeta(tournament.value?.state))

const {
  selectedGroupId,
  groupStandings,
  groupOptions,
  selectedGroupStandings,
  totalMatches,
  completedMatches,
} = useTournamentStandings(tournament)

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.standings.notFoundTitle'))
const pageSubtitle = computed(() => tournament.value?.description || t('sportTournament.standings.notFoundMessage'))

function goBack() {
  if (tournament.value?.id) {
    router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id: tournament.value.id } })
    return
  }

  router.push({ name: 'dashboard-sport-admin-tournaments' })
}

function goToFixtures() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-fixtures', params: { id: tournament.value.id } })
}

function goToResults() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-results', params: { id: tournament.value.id } })
}

onMounted(async () => {
  if (!tournamentId.value) return
  const detail = await loadTournament(tournamentId.value)
  const result = await fetchTournamentStandings(tournamentId.value)
  setTournamentRecord({ ...detail, standings: result.standings })
})

async function recalculate() {
  if (isRecalculating.value || !tournamentId.value) return
  isRecalculating.value = true
  errorMessage.value = ''
  try {
    await recalculateTournamentStandings(tournamentId.value)
    const detail = await loadTournament(tournamentId.value)
    const result = await fetchTournamentStandings(tournamentId.value)
    setTournamentRecord({ ...detail, standings: result.standings })
  } catch (cause) {
    errorMessage.value = cause?.message || t('sportTournament.standings.notFoundMessage')
  } finally {
    isRecalculating.value = false
  }
}
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-standings">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="tournament" class="sport-tournament-standings__content">
        <p v-if="errorMessage" class="sport-tournament-standings__error" role="alert">{{ errorMessage }}</p>
        <div class="sport-tournament-standings__hero">
          <div class="sport-tournament-standings__hero-copy">
            <p class="sport-tournament-standings__page-label">{{ t('sportTournament.standings.title') }}</p>
            <div class="sport-tournament-standings__hero-head">
              <div>
                <p class="sport-tournament-standings__eyebrow">{{ t('sportTournament.standings.hero.eyebrow') }}</p>
                <h2 class="sport-tournament-standings__title">{{ tournament.name }}</h2>
                <p class="sport-tournament-standings__subtitle">{{ t('sportTournament.standings.hero.subtitle') }}</p>
              </div>

              <TournamentStatusBadge :state="tournament.state" />
            </div>

            <div class="sport-tournament-standings__meta">
              <div class="sport-tournament-standings__meta-item">
                <span>{{ t('sportTournament.standings.labels.totalMatches') }}</span>
                <strong>{{ totalMatches }}</strong>
              </div>
              <div class="sport-tournament-standings__meta-item">
                <span>{{ t('sportTournament.standings.labels.completedMatches') }}</span>
                <strong>{{ completedMatches }}</strong>
              </div>
              <div class="sport-tournament-standings__meta-item">
                <span>{{ t('sportTournament.standings.labels.groupCount') }}</span>
                <strong>{{ groupStandings.length }}</strong>
              </div>
              <div class="sport-tournament-standings__meta-item">
                <span>{{ t('sportTournament.standings.labels.state') }}</span>
                <strong>{{ t(stateMeta.labelKey) }}</strong>
              </div>
            </div>
          </div>

          <div class="sport-tournament-standings__hero-actions">
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.standings.backToDetail')" @click="goBack" />
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.standings.goToFixtures')" @click="goToFixtures" />
            <Button type="button" class="rounded-xl" severity="info" :label="t('sportTournament.standings.goToResults')" @click="goToResults" />
            <Button type="button" class="rounded-xl" severity="success" :label="t('sportTournament.standings.recalculate')" :disabled="isRecalculating" @click="recalculate" />
          </div>
        </div>

        <div class="sport-tournament-standings__tabs">
          <TournamentFixtureGroupTabs
            v-model="selectedGroupId"
            :groups="groupOptions.map((group) => ({ id: group.value, name: group.label }))"
            :include-all="false"
          />
        </div>

        <div v-if="selectedGroupStandings" class="sport-tournament-standings__board">
          <TournamentStandingsCard
            :title="selectedGroupStandings.groupName"
            :subtitle="t('sportTournament.standings.card.subtitle')"
          >
            <TournamentStandingsTable :rows="selectedGroupStandings.rows" />
          </TournamentStandingsCard>
        </div>

        <div v-else class="sport-tournament-standings__empty">
          <h3>{{ t('sportTournament.standings.empty.title') }}</h3>
          <p>{{ t('sportTournament.standings.empty.subtitle') }}</p>
        </div>
      </div>

      <div v-else class="sport-tournament-standings__empty">
        <h3>{{ t('sportTournament.standings.notFoundTitle') }}</h3>
        <p>{{ t('sportTournament.standings.notFoundMessage') }}</p>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-tournament-standings {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-standings__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-standings__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(141, 198, 63, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-standings__hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-standings__page-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-standings__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-standings__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-standings__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-standings__subtitle {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.6;
}

.sport-tournament-standings__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.sport-tournament-standings__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
}

.sport-tournament-standings__meta-item span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sport-tournament-standings__meta-item strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.5;
}

.sport-tournament-standings__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-self: flex-start;
}

.sport-tournament-standings__tabs,
.sport-tournament-standings__board {
  padding: 1rem 1.15rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 22px 45px -38px rgba(15, 23, 42, 0.38);
}

.sport-tournament-standings__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-standings__empty h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.sport-tournament-standings__empty p {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-standings__hero {
    grid-template-columns: 1fr;
  }

  .sport-tournament-standings__hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .sport-tournament-standings__hero {
    padding: 1.1rem;
  }

  .sport-tournament-standings__title {
    font-size: 1.28rem;
  }

  .sport-tournament-standings__meta {
    grid-template-columns: 1fr;
  }
}
</style>

