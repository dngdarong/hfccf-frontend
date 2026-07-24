<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatsCards from '@/components/data-display/StatsCards.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentQuickActions from '@/modules/sport/tournament/components/shared/TournamentQuickActions.vue'
import TournamentSettingsSummary from '@/modules/sport/tournament/components/detail/TournamentSettingsSummary.vue'
import TournamentTeamManagement from '@/modules/sport/tournament/components/detail/TournamentTeamManagement.vue'
import TournamentStateTimeline from '@/modules/sport/tournament/components/shared/TournamentStateTimeline.vue'
import TournamentStatusBadge from '@/modules/sport/tournament/components/shared/TournamentStatusBadge.vue'
import TournamentStatisticsPanel from '@/modules/sport/tournament/components/statistics/TournamentStatisticsPanel.vue'
import {
  canEditTournamentConfiguration,
  getTournamentStateMeta,
} from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'
import { useTournamentStatistics } from '@/modules/sport/tournament/composables/useTournamentStatistics'
import { useTournamentTeams } from '@/modules/sport/tournament/composables/useTournamentTeams'

defineOptions({
  name: 'SportTournamentDetailPage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const { getTournamentById, loadTournament, updateTournament, isLoading } = useTournamentCrudCatalog()

const showError = ref(false)
const errorMessage = ref('')
const hasLoadedTournament = ref(false)

const tournamentId = computed(() => String(route.params.id || '').trim())
const tournament = computed(() => (tournamentId.value ? getTournamentById(tournamentId.value) : null))
const stateMeta = computed(() => getTournamentStateMeta(tournament.value?.state))
const canEdit = computed(() => Boolean(tournament.value?.id) && canEditTournamentConfiguration(tournament.value.state))
const canUseKnockout = computed(() => Boolean(tournament.value?.rules?.knockoutEnabled ?? true))
const tournamentStatistics = useTournamentStatistics(tournament)
const tournamentTeams = useTournamentTeams(tournament, { reload: () => loadTournament(tournamentId.value) })
const loadingTournament = computed(() => isLoading.value && !hasLoadedTournament.value)

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.detail.notFoundTitle'))
const pageSubtitle = computed(() =>
  tournament.value?.description || t('sportTournament.detail.notFoundMessage'),
)

const attachedTeams = computed(() => {
  const teams = tournamentTeams.attachedTeams
  return Array.isArray(teams) ? teams : (teams?.value || [])
})

const selectableTeams = computed(() => {
  const teams = tournamentTeams.selectableTeams
  return Array.isArray(teams) ? teams : (teams?.value || [])
})

const removingTeamId = computed(() => {
  const id = tournamentTeams.removingTeamId
  return typeof id === 'string' ? id : (id?.value ?? '')
})

const teamManagementPending = computed(() => {
  return Boolean(
    tournamentTeams.isLoading?.value ||
    tournamentTeams.isAttaching?.value ||
    removingTeamId.value
  )
})

const overviewCards = computed(() => {
  const stats = tournament.value?.statistics || {}

  return [
    {
      title: t('sportTournament.detail.metrics.registeredTeams'),
      titleKey: 'sportTournament.detail.metrics.registeredTeams',
      value: stats.registeredTeams ?? 0,
      label: t('sportTournament.detail.metrics.totalTeams'),
      labelKey: 'sportTournament.detail.metrics.totalTeams',
      status: 'info',
    },
    {
      title: t('sportTournament.detail.metrics.groupsCompleted'),
      titleKey: 'sportTournament.detail.metrics.groupsCompleted',
      value: stats.groupsCompleted ?? 0,
      label: t('sportTournament.detail.metrics.fixturesGenerated'),
      labelKey: 'sportTournament.detail.metrics.fixturesGenerated',
      status: 'warning',
    },
    {
      title: t('sportTournament.detail.metrics.matches'),
      titleKey: 'sportTournament.detail.metrics.matches',
      value: stats.totalMatches ?? stats.matches ?? 0,
      label: t('sportTournament.detail.metrics.fixturesGenerated'),
      labelKey: 'sportTournament.detail.metrics.fixturesGenerated',
      status: 'success',
    },
    {
      title: t('sportTournament.detail.metrics.completedMatches'),
      titleKey: 'sportTournament.detail.metrics.completedMatches',
      value: stats.completedMatches ?? 0,
      label: t('sportTournament.detail.metrics.matches'),
      labelKey: 'sportTournament.detail.metrics.matches',
      status: 'error',
    },
  ]
})

function goBack() {
  router.push({ name: 'dashboard-sport-admin-tournaments' })
}

function goToEdit() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id || !canEdit.value) return
  router.push({ name: 'dashboard-sport-admin-tournaments-edit', params: { id } })
}

function goToGroups() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-groups', params: { id } })
}

function goToFixtures() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-fixtures', params: { id } })
}

function goToStandings() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-standings', params: { id } })
}

function goToResults() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-results', params: { id } })
}

function goToKnockout() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id) return

  router.push({ name: 'dashboard-sport-admin-tournaments-knockout', params: { id } })
}

async function onWorkflowAction(action) {
  if (!tournament.value?.id || !action?.isAllowed || action.disabled) return

  const updated = await updateTournament(tournament.value.id, { status: action.nextState })
  if (!updated?.id) {
    errorMessage.value = t('sportTournament.create.validation.saveFailed')
    showError.value = true
    return
  }
}

onMounted(async () => {
  if (!tournamentId.value) {
    hasLoadedTournament.value = true
    return
  }

  try {
    await loadTournament(tournamentId.value)
    await tournamentStatistics.loadStatistics()
    await tournamentTeams.loadTeams()
  } catch {
    errorMessage.value = t('sportTournament.create.validation.saveFailed')
    showError.value = true
  } finally {
    hasLoadedTournament.value = true
  }
})

async function handleAttachTeam(teamId) {
  try { await tournamentTeams.attachTeam(teamId) } catch { showError.value = true; errorMessage.value = tournamentTeams.error.value }
}

async function handleRemoveTeam(teamId) {
  try { await tournamentTeams.removeTeam(teamId) } catch { showError.value = true; errorMessage.value = tournamentTeams.error.value }
}
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-detail">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="loadingTournament" class="sport-tournament-detail__empty">
        <div class="sport-tournament-detail__empty-card">
          <h3>{{ t('common.loading') }}</h3>
        </div>
      </div>

      <div v-else-if="tournament" class="sport-tournament-detail__content">
        <div class="sport-tournament-detail__hero">
          <div class="sport-tournament-detail__hero-copy">
            <div class="sport-tournament-detail__hero-head">
              <div>
                <p class="sport-tournament-detail__eyebrow">{{ t('sportTournament.detail.overview.title') }}</p>
                <h2 class="sport-tournament-detail__title">{{ tournament.name }}</h2>
                <p class="sport-tournament-detail__subtitle">{{ tournament.description }}</p>
              </div>

              <TournamentStatusBadge :state="tournament.state" />
            </div>

            <div class="sport-tournament-detail__meta">
              <div class="sport-tournament-detail__meta-item">
                <span>{{ t('sportTournament.detail.settings.organizer') }}</span>
                <strong>{{ tournament.organizer || '-' }}</strong>
              </div>
              <div class="sport-tournament-detail__meta-item">
                <span>{{ t('sportTournament.detail.settings.location') }}</span>
                <strong>{{ tournament.location || '-' }}</strong>
              </div>
              <div class="sport-tournament-detail__meta-item">
                <span>{{ t('sportTournament.create.fields.season') }}</span>
                <strong>{{ tournament.season || '-' }}</strong>
              </div>
              <div class="sport-tournament-detail__meta-item">
                <span>{{ t('sportTournament.create.fields.sportType') }}</span>
                <strong>{{ t(`sportTournament.sportTypes.${tournament.sportType}`) }}</strong>
              </div>
            </div>
          </div>

          <div class="sport-tournament-detail__hero-actions">
            <div class="sport-tournament-detail__primary-actions">
              <Button
                type="button"
                outlined
                class="rounded-xl"
                :label="t('sportTournament.detail.backToList')"
                @click="goBack"
              />
              <Button
                type="button"
                class="rounded-xl"
                :label="t('sportTournament.detail.editTournament')"
                :disabled="!canEdit"
                @click="goToEdit"
              />
            </div>

            <div class="sport-tournament-detail__management-actions">
              <Button
                type="button"
                outlined
                size="sm"
                class="rounded-lg"
                :label="t('sportTournament.detail.manageGroups')"
                @click="goToGroups"
              />
              <Button
                type="button"
                outlined
                size="sm"
                class="rounded-lg"
                :label="t('sportTournament.detail.manageFixtures')"
                @click="goToFixtures"
              />
              <Button
                type="button"
                outlined
                size="sm"
                class="rounded-lg"
                :label="t('sportTournament.detail.manageStandings')"
                @click="goToStandings"
              />
              <Button
                type="button"
                outlined
                size="sm"
                class="rounded-lg"
                :label="t('sportTournament.detail.manageResults')"
                @click="goToResults"
              />
              <Button
                type="button"
                outlined
                size="sm"
                class="rounded-lg"
                :label="t('sportTournament.detail.manageKnockout')"
                :disabled="!canUseKnockout"
                @click="goToKnockout"
              />
            </div>
          </div>
        </div>

        <div class="sport-tournament-detail__stats">
          <StatsCards :cards="overviewCards" />
        </div>

        <div class="sport-tournament-detail__workflow-grid">
          <TournamentStateTimeline
            :state="tournament.state"
          />

          <TournamentQuickActions
            :title="t('sportTournament.detail.quickActions.title')"
            :subtitle="t('sportTournament.detail.quickActions.subtitle')"
            :actions="stateMeta.actions"
            @action="onWorkflowAction"
          />
        </div>

        <TournamentStatisticsPanel
          :statistics="tournamentStatistics.statistics"
        />

        <TournamentTeamManagement
          :teams="attachedTeams"
          :available-teams="selectableTeams"
          :removing-team-id="removingTeamId"
          :pending="teamManagementPending"
          @attach="handleAttachTeam"
          @remove="handleRemoveTeam"
        />

        <TournamentSettingsSummary :tournament="tournament" />
      </div>

      <div v-else class="sport-tournament-detail__empty">
        <div class="sport-tournament-detail__empty-card">
          <h3>{{ t('sportTournament.detail.notFoundTitle') }}</h3>
          <p>{{ t('sportTournament.detail.notFoundMessage') }}</p>
          <Button
            type="button"
            class="rounded-xl"
            :label="t('sportTournament.detail.backToList')"
            @click="goBack"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('common.errorOccurred')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="showError = false"
    />
  </MainLayout>
</template>

<style scoped>
.sport-tournament-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-detail__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-detail__hero,
.sport-tournament-detail__workflow-grid {
  display: grid;
  gap: 1rem;
}

.sport-tournament-detail__hero {
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-detail__hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-detail__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-detail__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-detail__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-detail__subtitle {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.6;
}

.sport-tournament-detail__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.sport-tournament-detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
}

.sport-tournament-detail__meta-item span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sport-tournament-detail__meta-item strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.5;
}

.sport-tournament-detail__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: flex-start;
}

.sport-tournament-detail__primary-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.sport-tournament-detail__primary-actions button {
  width: 100%;
}

.sport-tournament-detail__management-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.sport-tournament-detail__stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-detail__workflow-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.sport-tournament-detail__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-detail__empty-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 34rem;
}

.sport-tournament-detail__empty-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.sport-tournament-detail__empty-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-detail__hero,
  .sport-tournament-detail__workflow-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-detail__management-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .sport-tournament-detail__hero {
    padding: 1.1rem;
  }

  .sport-tournament-detail__title {
    font-size: 1.28rem;
  }

  .sport-tournament-detail__meta {
    grid-template-columns: 1fr;
  }

  .sport-tournament-detail__management-actions {
    grid-template-columns: 1fr;
  }
}
</style>

