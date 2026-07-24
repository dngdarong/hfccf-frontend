<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentKnockoutHeader from '@/modules/sport/tournament/components/knockout/TournamentKnockoutHeader.vue'
import TournamentChampionCard from '@/modules/sport/tournament/components/knockout/TournamentChampionCard.vue'
import TournamentBracket from '@/modules/sport/tournament/components/knockout/TournamentBracket.vue'
import TournamentKnockoutResultForm from '@/modules/sport/tournament/components/knockout/TournamentKnockoutResultForm.vue'
import TournamentKnockoutSettings from '@/modules/sport/tournament/components/knockout/TournamentKnockoutSettings.vue'
import TournamentKnockoutValidationPanel from '@/modules/sport/tournament/components/knockout/TournamentKnockoutValidationPanel.vue'
import TournamentQualifierList from '@/modules/sport/tournament/components/knockout/TournamentQualifierList.vue'
import { useTournamentKnockout } from '@/modules/sport/tournament/composables/useTournamentKnockout'
import { useTournamentCatalog } from '@/modules/sport/tournament/composables/useTournamentCatalog'
import { getTournamentStateMeta } from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { fetchTournamentKnockout } from '@/modules/sport/tournament/api/tournamentApi'

defineOptions({
  name: 'SportTournamentKnockoutPage',
})

const route = useRoute()
const router = useRouter()
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
  qualification,
  validation,
  qualifiers,
  bracket,
  bracketSummary,
  champion,
  selectedMatch,
  statusOptions,
  previewVisible,
  canEdit,
  canGenerateBracket,
  updateSettings,
  generatePreview,
  applyPreview,
  saveMatchResult,
  selectMatch,
  updateDraft,
  resultDraft,
  resetKnockout,
  createKnockoutMatchDraft,
  isGenerating,
  isSaving,
} = useTournamentKnockout(tournament, { reloadTournament })
const bracketSize = qualification.bracketSize
const knockoutStats = computed(() => ([
  {
    label: t('sportTournament.knockout.labels.qualifiers'),
    value: qualifiers.length,
  },
  {
    label: t('sportTournament.knockout.labels.bracketSize'),
    value: bracketSize.value || '-',
  },
  {
    label: t('sportTournament.knockout.labels.completedMatches'),
    value: bracketSummary.value.completedMatches,
  },
  {
    label: t('sportTournament.knockout.labels.champion'),
    value: champion.value?.teamName || '-',
    emphasis: Boolean(champion.value?.teamName),
  },
]))

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.knockout.notFoundTitle'))
const pageSubtitle = computed(() => tournament.value?.description || t('sportTournament.knockout.notFoundMessage'))

function goBack() {
  if (tournament.value?.id) {
    router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id: tournament.value.id } })
    return
  }

  router.push({ name: 'dashboard-sport-admin-tournaments' })
}

function goToDetail() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id: tournament.value.id } })
}

function goToStandings() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-standings', params: { id: tournament.value.id } })
}

function goToFixtures() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-fixtures', params: { id: tournament.value.id } })
}

function goToResults() {
  if (!tournament.value?.id) return
  router.push({ name: 'dashboard-sport-admin-tournaments-results', params: { id: tournament.value.id } })
}

function notifyError(message) {
  errorMessage.value = message
  showError.value = true
}

function notifySuccess(message) {
  successMessage.value = message
  showSuccess.value = true
}

function handleGeneratePreview() {
  const result = generatePreview()
  if (!result?.valid) {
    notifyError(t('sportTournament.knockout.validation.generateFailed'))
    return
  }

  notifySuccess(t('sportTournament.knockout.preview.generated'))
}

async function handleApplyPreview() {
  const updated = await applyPreview().catch(() => null)
  if (!updated?.id) {
    notifyError(t('sportTournament.knockout.validation.applyFailed'))
    return
  }

  notifySuccess(t('sportTournament.knockout.preview.applied'))
}

async function handleSaveResult() {
  const updated = await saveMatchResult(resultDraft.value).catch(() => null)
  if (updated?.issue) {
    notifyError(
      updated.issue.code === 'drawWithoutPenaltyWinner'
        ? t('sportTournament.knockout.validation.drawWithoutPenaltyWinner')
        : t('sportTournament.knockout.validation.saveFailed'),
    )
    return
  }

  if (!updated?.id) {
    notifyError(t('sportTournament.knockout.validation.saveFailed'))
    return
  }

  notifySuccess(t('sportTournament.knockout.resultForm.saved'))
}

function handleResetBracket() {
  if (!resetKnockout()) {
    notifyError(t('sportTournament.knockout.validation.resetFailed'))
    return
  }

  notifySuccess(t('sportTournament.knockout.preview.reset'))
}

function handleResetResult() {
  updateDraft(createKnockoutMatchDraft(selectedMatch.value || {}))
}

function handleSelectMatch(match) {
  if (!match?.id) return
  selectMatch(match.id)
  updateDraft(createKnockoutMatchDraft(match))
}

async function reloadTournament() {
  const detail = await loadTournament(tournamentId.value)
  const result = await fetchTournamentKnockout(tournamentId.value)
  setTournamentRecord({ ...detail, knockout: result.knockout })
}

onMounted(async () => {
  if (!tournamentId.value) return
  try {
    await reloadTournament()
  } catch (error) {
    notifyError(error?.message || t('sportTournament.knockout.notFoundMessage'))
  }
})
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-knockout">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="tournament" class="sport-tournament-knockout__content">
        <TournamentKnockoutHeader
          :title="tournament.name"
          :subtitle="t('sportTournament.knockout.hero.subtitle')"
          :state-label="t(stateMeta.labelKey)"
          :stats="knockoutStats"
        >
          <template #actions>
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.knockout.backToDetail')" @click="goBack" />
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.knockout.goToStandings')" @click="goToStandings" />
            <Button type="button" class="rounded-xl" outlined :label="t('sportTournament.knockout.goToFixtures')" @click="goToFixtures" />
            <Button type="button" class="rounded-xl" severity="info" :label="t('sportTournament.knockout.goToResults')" @click="goToResults" />
          </template>
        </TournamentKnockoutHeader>

        <div class="sport-tournament-knockout__toolbar">
          <Button
            type="button"
            class="rounded-xl"
            severity="success"
            :disabled="!canGenerateBracket || isGenerating"
            :label="t('sportTournament.knockout.actions.generatePreview')"
            @click="handleGeneratePreview"
          />
          <Button
            type="button"
            class="rounded-xl"
            severity="info"
            :disabled="!previewVisible || isGenerating"
            :label="t('sportTournament.knockout.actions.applyPreview')"
            @click="handleApplyPreview"
          />
          <Button
            type="button"
            class="rounded-xl"
            outlined
            :label="t('sportTournament.knockout.actions.resetBracket')"
            @click="handleResetBracket"
          />
        </div>

        <div class="sport-tournament-knockout__layout">
          <div class="sport-tournament-knockout__left">
            <TournamentKnockoutSettings :model-value="settings" @update:modelValue="updateSettings" />
            <TournamentKnockoutValidationPanel :validation="validation" :bracket-size="qualification.bracketSize.value" />
            <TournamentQualifierList
              :title="t('sportTournament.knockout.qualifiers.title')"
              :subtitle="t('sportTournament.knockout.qualifiers.subtitle')"
              :qualifiers="qualifiers"
            />
            <TournamentChampionCard :champion="champion" />
          </div>

          <div class="sport-tournament-knockout__right">
            <TournamentBracket
              :bracket="bracket"
              :selected-match-id="selectedMatch?.id || ''"
              @select="handleSelectMatch"
            />

            <TournamentKnockoutResultForm
              :match="selectedMatch || {}"
              :model-value="resultDraft"
              :status-options="statusOptions"
              :settings="settings"
              :disabled="!canEdit || isSaving"
              @update:modelValue="updateDraft"
              @save="handleSaveResult"
              @reset="handleResetResult"
            />
          </div>
        </div>
      </div>

      <div v-else class="sport-tournament-knockout__empty">
        <div class="sport-tournament-knockout__empty-card">
          <h3>{{ t('sportTournament.knockout.notFoundTitle') }}</h3>
          <p>{{ t('sportTournament.knockout.notFoundMessage') }}</p>
          <Button type="button" class="rounded-xl" :label="t('sportTournament.knockout.backToDetail')" @click="goToDetail" />
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
      :title="t('sportTournament.knockout.success.title')"
      :message="successMessage"
      :button-text="t('common.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.sport-tournament-knockout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-knockout__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-knockout__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.sport-tournament-knockout__layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1rem;
}

.sport-tournament-knockout__left,
.sport-tournament-knockout__right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-knockout__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-knockout__empty-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.sport-tournament-knockout__empty-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.sport-tournament-knockout__empty-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-knockout__layout {
    grid-template-columns: 1fr;
  }
}
</style>

