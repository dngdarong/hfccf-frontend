<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentStatusBadge from '@/modules/sport/tournament/components/shared/TournamentStatusBadge.vue'
import TournamentFixtureFilters from '@/modules/sport/tournament/components/fixtures/TournamentFixtureFilters.vue'
import TournamentFixtureGroupTabs from '@/modules/sport/tournament/components/fixtures/TournamentFixtureGroupTabs.vue'
import TournamentFixtureList from '@/modules/sport/tournament/components/fixtures/TournamentFixtureList.vue'
import TournamentFixtureStats from '@/modules/sport/tournament/components/fixtures/TournamentFixtureStats.vue'
import TournamentGenerateFixturesPanel from '@/modules/sport/tournament/components/fixtures/TournamentGenerateFixturesPanel.vue'
import { canEditTournamentConfiguration, getTournamentStateMeta } from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'
import { useTournamentFixtures } from '@/modules/sport/tournament/composables/useTournamentFixtures'
import { fetchTournamentFixtures, fetchTournamentStandings } from '@/modules/sport/tournament/api/tournamentApi'

defineOptions({
  name: 'SportTournamentFixturesPage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const { getTournamentById, loadTournament, setTournamentRecord } = useTournamentCatalog()

const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const tournamentId = computed(() => String(route.params.id || '').trim())
const tournament = computed(() => (tournamentId.value ? getTournamentById(tournamentId.value) : null))
const stateMeta = computed(() => getTournamentStateMeta(tournament.value?.state))

const {
  settings,
  selectedGroupId,
  selectedMatchday,
  selectedStatus,
  previewVisible,
  previewFixtures,
  previewSummary,
  groupOptions,
  matchdayOptions,
  selectedGroup,
  selectedGroupFixtures,
  previewGroupFixtures,
  stats,
  canGenerateFixtures,
  canEditFixtureStatus,
  updateSettings,
  generatePreview,
  applyPreview,
  resetFixtures,
  updateFixtureStatus,
  isGenerating,
  isUpdating,
} = useTournamentFixtures(tournament, { reloadTournament })

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.fixtures.notFoundTitle'))
const pageSubtitle = computed(() => tournament.value?.description || t('sportTournament.fixtures.notFoundMessage'))
const statusOptions = computed(() => [
  { label: t('sportTournament.matchStatuses.scheduled'), value: 'scheduled' },
  { label: t('sportTournament.matchStatuses.live'), value: 'live' },
  { label: t('sportTournament.matchStatuses.completed'), value: 'completed' },
  { label: t('sportTournament.matchStatuses.postponed'), value: 'postponed' },
  { label: t('sportTournament.matchStatuses.cancelled'), value: 'cancelled' },
])
const matchdayFilterOptions = computed(() => [
  { label: t('sportTournament.fixtures.filters.allMatchdays'), value: 'all' },
  ...matchdayOptions.value,
])

const isViewOnly = computed(() => !canEditTournamentConfiguration(tournament.value?.state))
const selectedGroupLabel = computed(() =>
  selectedGroupId.value === 'all'
    ? t('sportTournament.fixtures.filters.allGroups')
    : selectedGroup.value?.name || t('sportTournament.fixtures.filters.allGroups'),
)

function goBack() {
  if (tournament.value?.id) {
    router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id: tournament.value.id } })
    return
  }

  router.push({ name: 'dashboard-sport-admin-tournaments' })
}

function goToStandings() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-standings', params: { id: tournament.value.id } })
}

function goToResults(fixture) {
  if (!tournament.value?.id) return

  router.push({
    name: 'dashboard-sport-admin-tournaments-results',
    params: { id: tournament.value.id },
    query: fixture?.id ? { fixtureId: fixture.id } : {},
  })
}

function notifySuccess(message) {
  successMessage.value = message
  showSuccess.value = true
}

function notifyError(message) {
  errorMessage.value = message
  showError.value = true
}

function handlePreview() {
  generatePreview()
}

async function handleApply() {
  const updated = await applyPreview().catch(() => null)
  if (!updated?.id) {
    notifyError(t('sportTournament.fixtures.validation.saveFailed'))
    return
  }

  notifySuccess(t('sportTournament.fixtures.success.applied'))
}

function handleReset() {
  if (!resetFixtures()) {
    notifyError(t('sportTournament.fixtures.validation.resetFailed'))
    return
  }

  notifySuccess(t('sportTournament.fixtures.success.reset'))
}

async function handleStatusUpdate(payload) {
  if (!payload?.fixtureId || !payload?.status) return

  const updated = await updateFixtureStatus(payload.fixtureId, payload.status).catch(() => null)
  if (!updated?.id) {
    notifyError(t('sportTournament.fixtures.validation.saveFailed'))
    return
  }

  notifySuccess(t('sportTournament.fixtures.success.statusUpdated'))
}

async function reloadTournament() {
  const detail = await loadTournament(tournamentId.value)
  const [fixtureResponse, standingsResponse] = await Promise.all([
    fetchTournamentFixtures(tournamentId.value),
    fetchTournamentStandings(tournamentId.value),
  ])
  setTournamentRecord({ ...detail, fixtures: fixtureResponse.matches, standings: standingsResponse.standings })
}

onMounted(async () => {
  if (!tournamentId.value) return
  try {
    await reloadTournament()
  } catch (error) {
    notifyError(error?.message || t('sportTournament.fixtures.notFoundMessage'))
  }
})
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-fixtures">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="tournament" class="sport-tournament-fixtures__content">
        <div class="sport-tournament-fixtures__hero">
          <div class="sport-tournament-fixtures__hero-copy">
            <p class="sport-tournament-fixtures__page-label">{{ t('sportTournament.fixtures.title') }}</p>
            <div class="sport-tournament-fixtures__hero-head">
              <div>
                <p class="sport-tournament-fixtures__eyebrow">{{ t('sportTournament.fixtures.hero.eyebrow') }}</p>
                <h2 class="sport-tournament-fixtures__title">{{ tournament.name }}</h2>
                <p class="sport-tournament-fixtures__subtitle">{{ t('sportTournament.fixtures.hero.subtitle') }}</p>
              </div>

              <TournamentStatusBadge :state="tournament.state" />
            </div>

            <div class="sport-tournament-fixtures__meta">
              <div class="sport-tournament-fixtures__meta-item">
                <span>{{ t('sportTournament.detail.settings.organizer') }}</span>
                <strong>{{ tournament.organizer || '-' }}</strong>
              </div>
              <div class="sport-tournament-fixtures__meta-item">
                <span>{{ t('sportTournament.detail.settings.location') }}</span>
                <strong>{{ tournament.location || '-' }}</strong>
              </div>
              <div class="sport-tournament-fixtures__meta-item">
                <span>{{ t('sportTournament.fixtures.labels.groupCount') }}</span>
                <strong>{{ tournament.groupDraw?.settings?.groupCount || 0 }}</strong>
              </div>
              <div class="sport-tournament-fixtures__meta-item">
                <span>{{ t('sportTournament.fixtures.labels.matchdays') }}</span>
                <strong>{{ stats.matchdays || 0 }}</strong>
              </div>
            </div>

            <p class="sport-tournament-fixtures__state-note">{{ t(stateMeta.descriptionKey) }}</p>
          </div>

          <div class="sport-tournament-fixtures__hero-actions">
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.fixtures.backToDetail')" @click="goBack" />
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.fixtures.goToStandings')" @click="goToStandings" />
          </div>
        </div>

        <div class="sport-tournament-fixtures__top-grid">
          <TournamentFixtureStats :stats="stats" />
          <TournamentGenerateFixturesPanel
            :model-value="settings"
            :can-generate="canGenerateFixtures"
            :can-reset="Boolean(previewFixtures.length) || !isViewOnly"
            :pending="isGenerating || isUpdating"
            :preview-count="previewFixtures.length"
            :preview-matchdays="previewSummary?.matchdays || stats.matchdays"
            @update:modelValue="updateSettings"
            @preview="handlePreview"
            @apply="handleApply"
            @reset="handleReset"
          />
        </div>

        <div class="sport-tournament-fixtures__filters">
          <TournamentFixtureGroupTabs v-model="selectedGroupId" :groups="groupOptions.map((group) => ({ id: group.value, name: group.label }))" />
          <TournamentFixtureFilters
            v-model:status="selectedStatus"
            v-model:matchday="selectedMatchday"
            :status-options="statusOptions"
            :matchday-options="matchdayFilterOptions"
          />
        </div>

        <section v-if="previewVisible" class="sport-tournament-fixtures__preview">
          <div class="sport-tournament-fixtures__preview-head">
            <div>
              <h3>{{ t('sportTournament.fixtures.preview.title') }}</h3>
              <p>{{ t('sportTournament.fixtures.preview.subtitle') }}</p>
            </div>
            <span>{{ previewSummary?.fixtures || 0 }} {{ t('sportTournament.fixtures.labels.fixtures') }}</span>
          </div>
          <TournamentFixtureList
            :fixtures="previewGroupFixtures"
            :editable="false"
            :status-options="statusOptions"
            :empty-text="t('sportTournament.fixtures.empty.title')"
            @select="goToResults"
          />
        </section>

        <section class="sport-tournament-fixtures__list-card">
          <div class="sport-tournament-fixtures__list-head">
            <div>
              <h3>{{ selectedGroupLabel }}</h3>
              <p>{{ t('sportTournament.fixtures.list.subtitle') }}</p>
            </div>
            <Button
              v-if="tournament.state !== 'draft'"
              type="button"
              class="rounded-xl"
              severity="info"
              :label="t('sportTournament.fixtures.actions.openResults')"
              @click="goToResults"
            />
          </div>

          <TournamentFixtureList
            :fixtures="selectedGroupFixtures"
            :editable="canEditFixtureStatus"
            :status-options="statusOptions"
            :empty-text="t('sportTournament.fixtures.empty.title')"
            @select="goToResults"
            @update-status="handleStatusUpdate"
          />
        </section>
      </div>

      <div v-else class="sport-tournament-fixtures__empty">
        <div class="sport-tournament-fixtures__empty-card">
          <h3>{{ t('sportTournament.fixtures.notFoundTitle') }}</h3>
          <p>{{ t('sportTournament.fixtures.notFoundMessage') }}</p>
          <Button type="button" class="rounded-xl" :label="t('sportTournament.fixtures.backToList')" @click="router.push({ name: 'dashboard-sport-admin-tournaments' })" />
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

    <AlertSuccess
      :show="showSuccess"
      :title="t('sportTournament.fixtures.success.title')"
      :message="successMessage"
      :button-text="t('common.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.sport-tournament-fixtures {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-fixtures__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-fixtures__hero,
.sport-tournament-fixtures__top-grid,
.sport-tournament-fixtures__list-card,
.sport-tournament-fixtures__preview {
  display: grid;
  gap: 1rem;
}

.sport-tournament-fixtures__hero {
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-fixtures__hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-fixtures__page-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-fixtures__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-fixtures__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-fixtures__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-fixtures__subtitle {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.6;
}

.sport-tournament-fixtures__state-note {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
}

.sport-tournament-fixtures__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.sport-tournament-fixtures__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
}

.sport-tournament-fixtures__meta-item span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sport-tournament-fixtures__meta-item strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.5;
}

.sport-tournament-fixtures__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-self: flex-start;
}

.sport-tournament-fixtures__top-grid {
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  align-items: start;
}

.sport-tournament-fixtures__filters {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.sport-tournament-fixtures__preview,
.sport-tournament-fixtures__list-card {
  padding: 1.15rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 22px 45px -38px rgba(15, 23, 42, 0.38);
}

.sport-tournament-fixtures__preview-head,
.sport-tournament-fixtures__list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-fixtures__preview-head h3,
.sport-tournament-fixtures__list-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.sport-tournament-fixtures__preview-head p,
.sport-tournament-fixtures__list-head p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.sport-tournament-fixtures__preview-head span {
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.1);
  color: #0369a1;
  font-size: 0.82rem;
  font-weight: 800;
}

.sport-tournament-fixtures__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-fixtures__empty-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 34rem;
}

.sport-tournament-fixtures__empty-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.sport-tournament-fixtures__empty-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-fixtures__hero,
  .sport-tournament-fixtures__top-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-fixtures__hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .sport-tournament-fixtures__hero {
    padding: 1.1rem;
  }

  .sport-tournament-fixtures__title {
    font-size: 1.28rem;
  }

  .sport-tournament-fixtures__meta {
    grid-template-columns: 1fr;
  }
}
</style>

