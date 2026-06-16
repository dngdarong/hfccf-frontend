<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentFixtureList from '@/modules/sport/tournament/components/fixtures/TournamentFixtureList.vue'
import TournamentResultSummary from '@/modules/sport/tournament/components/results/TournamentResultSummary.vue'
import TournamentMatchStats from '@/modules/sport/tournament/components/results/TournamentMatchStats.vue'
import TournamentMatchEventForm from '@/modules/sport/tournament/components/results/TournamentMatchEventForm.vue'
import TournamentMatchEventTimeline from '@/modules/sport/tournament/components/results/TournamentMatchEventTimeline.vue'
import TournamentResultEntryForm from '@/modules/sport/tournament/components/results/TournamentResultEntryForm.vue'
import TournamentStatisticsPanel from '@/modules/sport/tournament/components/statistics/TournamentStatisticsPanel.vue'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'
import { createFixtureResultDraft, useTournamentResults } from '@/modules/sport/tournament/composables/useTournamentResults'
import { useTournamentStatistics } from '@/modules/sport/tournament/composables/useTournamentStatistics'
import { getTournamentStateMeta } from '@/modules/sport/tournament/composables/useTournamentStateMachine'

defineOptions({
  name: 'SportTournamentResultsPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()
const { getTournamentById, updateTournament, transitionTournament } = useTournamentCatalog()

const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const tournamentId = computed(() => String(route.params.id || '').trim())
const tournament = computed(() => (tournamentId.value ? getTournamentById(tournamentId.value) : null))
const stateMeta = computed(() => getTournamentStateMeta(tournament.value?.state))
const tournamentStatistics = useTournamentStatistics(tournament)

const {
  selectedFixture,
  fixtures,
  resultDraft,
  eventDraft,
  eventDraftValidation,
  eventTimeline,
  eventTypes,
  eventSideOptions,
  eventTeamOptions,
  statusOptions,
  selectFixture,
  updateDraft,
  addEvent,
  removeEvent,
  resetEventDraft,
  saveResult,
} = useTournamentResults(tournament, {
  updateTournament,
  transitionTournament,
})

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.results.notFoundTitle'))
const pageSubtitle = computed(() => tournament.value?.description || t('sportTournament.results.notFoundMessage'))

watch(
  () => route.query.fixtureId,
  (fixtureId) => {
    if (!fixtureId) return
    selectFixture(String(fixtureId))
  },
  { immediate: true },
)

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

function goToStandings() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-standings', params: { id: tournament.value.id } })
}

function handleFixtureSelect(fixture) {
  if (!fixture?.id) return
  selectFixture(fixture.id)
  router.replace({
    name: 'dashboard-sport-admin-tournaments-results',
    params: { id: tournament.value.id },
    query: { fixtureId: fixture.id },
  })
}

function notifyError(message) {
  errorMessage.value = message
  showError.value = true
}

function notifySuccess(message) {
  successMessage.value = message
  showSuccess.value = true
}

function handleSave() {
  const updated = saveResult()
  if (!updated?.id) {
    notifyError(t('sportTournament.results.validation.saveFailed'))
    return
  }

  notifySuccess(t('sportTournament.results.success.saved'))
}

function handleReset() {
  updateDraft(createFixtureResultDraft(selectedFixture.value))
  resetEventDraft(selectedFixture.value)
}

function handleAddEvent() {
  const addedEvent = addEvent()
  if (!addedEvent?.id) {
    notifyError(t('sportTournament.results.validation.eventAddFailed'))
    return
  }
}
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-results">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="tournament" class="sport-tournament-results__content">
        <div class="sport-tournament-results__hero">
          <div class="sport-tournament-results__hero-copy">
            <p class="sport-tournament-results__page-label">{{ t('sportTournament.results.title') }}</p>
            <div class="sport-tournament-results__hero-head">
              <div>
                <p class="sport-tournament-results__eyebrow">{{ t('sportTournament.results.hero.eyebrow') }}</p>
                <h2 class="sport-tournament-results__title">{{ tournament.name }}</h2>
                <p class="sport-tournament-results__subtitle">{{ t('sportTournament.results.hero.subtitle') }}</p>
              </div>

          </div>

            <div class="sport-tournament-results__meta">
              <div class="sport-tournament-results__meta-item">
                <span>{{ t('sportTournament.results.labels.totalFixtures') }}</span>
                <strong>{{ fixtures.length }}</strong>
              </div>
              <div class="sport-tournament-results__meta-item">
                <span>{{ t('sportTournament.results.labels.completedFixtures') }}</span>
                <strong>{{ fixtures.filter((fixture) => fixture.status === 'completed').length }}</strong>
              </div>
              <div class="sport-tournament-results__meta-item">
                <span>{{ t('sportTournament.results.labels.state') }}</span>
                <strong>{{ t(stateMeta.labelKey) }}</strong>
              </div>
              <div class="sport-tournament-results__meta-item">
                <span>{{ t('sportTournament.results.labels.activeFixture') }}</span>
                <strong>{{ selectedFixture?.homeTeamName || '-' }}</strong>
              </div>
            </div>
          </div>

          <div class="sport-tournament-results__hero-actions">
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.results.backToDetail')" @click="goBack" />
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.results.goToFixtures')" @click="goToFixtures" />
            <Button type="button" class="rounded-xl" severity="info" :label="t('sportTournament.results.goToStandings')" @click="goToStandings" />
          </div>
        </div>

        <TournamentStatisticsPanel
          compact
          :statistics="tournamentStatistics.statistics"
        />

        <div class="sport-tournament-results__layout">
          <section class="sport-tournament-results__list-card">
            <div class="sport-tournament-results__list-head">
              <div>
                <h3>{{ t('sportTournament.results.list.title') }}</h3>
                <p>{{ t('sportTournament.results.list.subtitle') }}</p>
              </div>
            </div>

            <TournamentFixtureList
              :fixtures="fixtures"
              :editable="false"
              :status-options="statusOptions"
              :empty-text="t('sportTournament.results.list.empty')"
              @select="handleFixtureSelect"
            />
          </section>

          <div class="sport-tournament-results__editor">
            <TournamentResultSummary :fixture="selectedFixture || {}" />
            <TournamentResultEntryForm
              :fixture="selectedFixture || {}"
              :model-value="resultDraft"
              :status-options="statusOptions"
              :disabled="!selectedFixture"
              @update:modelValue="updateDraft"
              @save="handleSave"
              @reset="handleReset"
            />
            <TournamentMatchEventForm
              v-model="eventDraft"
              :event-types="eventTypes"
              :side-options="eventSideOptions"
              :team-options="eventTeamOptions"
              :validation="eventDraftValidation"
              :disabled="!selectedFixture"
              @add="handleAddEvent"
              @reset="resetEventDraft(selectedFixture)"
            />
            <TournamentMatchStats :fixture="selectedFixture || {}" />
            <TournamentMatchEventTimeline
              :events="eventTimeline"
              :disabled="!selectedFixture"
              @remove="removeEvent"
            />
          </div>
        </div>
      </div>

      <div v-else class="sport-tournament-results__empty">
        <h3>{{ t('sportTournament.results.notFoundTitle') }}</h3>
        <p>{{ t('sportTournament.results.notFoundMessage') }}</p>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('common.errorOccurred')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="showError = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('sportTournament.results.success.title')"
      :message="successMessage"
      :button-text="t('common.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.sport-tournament-results {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-results__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-results__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(253, 193, 22, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-results__hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-results__page-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-results__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-results__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-results__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-results__subtitle {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.6;
}

.sport-tournament-results__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.sport-tournament-results__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
}

.sport-tournament-results__meta-item span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sport-tournament-results__meta-item strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.5;
}

.sport-tournament-results__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-self: flex-start;
}

.sport-tournament-results__layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 1rem;
}

.sport-tournament-results__list-card,
.sport-tournament-results__editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.15rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 22px 45px -38px rgba(15, 23, 42, 0.38);
}

.sport-tournament-results__list-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.sport-tournament-results__list-head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.sport-tournament-results__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-results__empty h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.sport-tournament-results__empty p {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-results__hero,
  .sport-tournament-results__layout {
    grid-template-columns: 1fr;
  }

  .sport-tournament-results__hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .sport-tournament-results__hero {
    padding: 1.1rem;
  }

  .sport-tournament-results__title {
    font-size: 1.28rem;
  }

  .sport-tournament-results__meta {
    grid-template-columns: 1fr;
  }
}
</style>
