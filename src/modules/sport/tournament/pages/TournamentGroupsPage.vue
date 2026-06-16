<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import TournamentStatusBadge from '@/modules/sport/tournament/components/shared/TournamentStatusBadge.vue'
import TournamentStateTimeline from '@/modules/sport/tournament/components/shared/TournamentStateTimeline.vue'
import TournamentGroupAssignmentPanel from '@/modules/sport/tournament/components/groups/TournamentGroupAssignmentPanel.vue'
import TournamentGroupDrawControls from '@/modules/sport/tournament/components/groups/TournamentGroupDrawControls.vue'
import TournamentDrawPreviewDialog from '@/modules/sport/tournament/components/groups/TournamentDrawPreviewDialog.vue'
import TournamentGroupGrid from '@/modules/sport/tournament/components/groups/TournamentGroupGrid.vue'
import TournamentGroupSeedPanel from '@/modules/sport/tournament/components/groups/TournamentGroupSeedPanel.vue'
import TournamentGroupSettings from '@/modules/sport/tournament/components/groups/TournamentGroupSettings.vue'
import TournamentGroupStats from '@/modules/sport/tournament/components/groups/TournamentGroupStats.vue'
import { canEditTournamentConfiguration, getTournamentStateMeta } from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'
import { useTournamentGroups } from '@/modules/sport/tournament/composables/useTournamentGroups'

defineOptions({
  name: 'SportTournamentGroupsPage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const { getTournamentById, loadTournament, transitionTournament, isLoading: tournamentLoading } = useTournamentCrudCatalog()

const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const hasLoadedTournament = ref(false)

const tournamentId = computed(() => String(route.params.id || '').trim())
const tournament = computed(() => (tournamentId.value ? getTournamentById(tournamentId.value) : null))
const stateMeta = computed(() => getTournamentStateMeta(tournament.value?.state))

const {
  mode,
  settings,
  previewVisible,
  previewSummary,
  previewWarnings,
  resolvedGroups,
  resolvedPreviewGroups,
  groupOptions,
  seedTeams,
  unassignedTeams,
  summary,
  issues,
  canEdit,
  canFinalize,
  updateSettings,
  rebuildGroups,
  previewAutomaticDraw,
  applyPreview,
  loadGroups,
  assignTeamToGroup,
  removeTeamFromGroup,
  resetDraft,
  saveDraft,
  finalizeGroups,
  lastGeneratedAt,
  isLoading: groupsLoading,
} = useTournamentGroups(tournament, {
  loadTournament,
  transitionTournament,
})

const pageTitle = computed(() => tournament.value?.name || t('sportTournament.groups.notFoundTitle'))
const pageSubtitle = computed(() => tournament.value?.description || t('sportTournament.groups.notFoundMessage'))
const groupWarningItems = computed(() => issues.value.filter(Boolean))
const isViewOnly = computed(() => !canEdit.value)
const loadingTournament = computed(() => (tournamentLoading.value || groupsLoading.value) && !hasLoadedTournament.value)
const isWorkflowPending = computed(() => ['draft', 'registration_open'].includes(stateMeta.value.state))
const lockTitle = computed(() =>
  isWorkflowPending.value ? t('sportTournament.groups.notReadyTitle') : t('sportTournament.groups.locked'),
)
const lockMessage = computed(() =>
  isWorkflowPending.value ? t('sportTournament.groups.notReadyMessage') : t('sportTournament.groups.lockedMessage'),
)

function goBack() {
  if (tournament.value?.id) {
    router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id: tournament.value.id } })
    return
  }

  router.push({ name: 'dashboard-sport-admin-tournaments' })
}

function goToEdit() {
  const id = String(tournament.value?.id || tournamentId.value || '').trim()
  if (!id || !canEditTournamentConfiguration(tournament.value?.state)) return

  router.push({ name: 'dashboard-sport-admin-tournaments-edit', params: { id } })
}

function showSuccessAlert(message) {
  successMessage.value = message
  showSuccess.value = true
}

function showErrorAlert(message) {
  errorMessage.value = message
  showError.value = true
}

function handleSettingsUpdate(nextSettings) {
  const structureChanged = updateSettings(nextSettings)
  if (structureChanged) {
    rebuildGroups()
  }
}

function handlePreview() {
  previewAutomaticDraw()
}

function handleModeUpdate(nextMode) {
  mode.value = nextMode
}

function closePreview() {
  previewVisible.value = false
}

async function handleApplyPreview() {
  const record = await applyPreview()
  if (!record?.id) {
    showErrorAlert(t('sportTournament.groups.validation.saveFailed'))
    return
  }

  showSuccessAlert(t('sportTournament.groups.success.previewApplied'))
}

async function handleSaveDraft() {
  const record = await saveDraft()
  if (!record?.id) {
    showErrorAlert(t('sportTournament.groups.validation.saveFailed'))
    return
  }

  showSuccessAlert(t('sportTournament.groups.success.draftSaved'))
}

async function handleFinalize() {
  const record = await finalizeGroups()
  if (!record?.id) {
    showErrorAlert(t('sportTournament.groups.validation.finalizeFailed'))
    return
  }

  showSuccessAlert(t('sportTournament.groups.success.finalized'))
}

function handleReset() {
  resetDraft()
  showSuccessAlert(t('sportTournament.groups.success.reset'))
}

function handleAssignTeam(payload) {
  if (!payload?.teamId || !payload?.groupId) return

  assignTeamToGroup(payload.teamId, payload.groupId)
}

function handleRemoveTeam(teamId) {
  removeTeamFromGroup(teamId)
}

onMounted(async () => {
  if (!tournamentId.value) {
    hasLoadedTournament.value = true
    return
  }

  try {
    await loadTournament(tournamentId.value)
    await loadGroups()
  } catch {
    showErrorAlert(t('sportTournament.groups.validation.saveFailed'))
  } finally {
    hasLoadedTournament.value = true
  }
})
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-groups">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div v-if="loadingTournament" class="sport-tournament-groups__empty">
        <div class="sport-tournament-groups__empty-card">
          <h3>{{ t('common.loading') }}</h3>
        </div>
      </div>

      <div v-else-if="tournament" class="sport-tournament-groups__content">
        <div class="sport-tournament-groups__hero">
          <div class="sport-tournament-groups__hero-copy">
            <p class="sport-tournament-groups__page-label">{{ t('sportTournament.groups.title') }}</p>
            <div class="sport-tournament-groups__hero-head">
              <div>
                <p class="sport-tournament-groups__eyebrow">{{ t('sportTournament.groups.hero.eyebrow') }}</p>
                <h2 class="sport-tournament-groups__title">{{ tournament.name }}</h2>
                <p class="sport-tournament-groups__subtitle">{{ t('sportTournament.groups.hero.subtitle') }}</p>
              </div>

              <TournamentStatusBadge :state="tournament.state" />
            </div>

            <div class="sport-tournament-groups__meta">
              <div class="sport-tournament-groups__meta-item">
                <span>{{ t('sportTournament.detail.settings.organizer') }}</span>
                <strong>{{ tournament.organizer || '-' }}</strong>
              </div>
              <div class="sport-tournament-groups__meta-item">
                <span>{{ t('sportTournament.detail.settings.location') }}</span>
                <strong>{{ tournament.location || '-' }}</strong>
              </div>
              <div class="sport-tournament-groups__meta-item">
                <span>{{ t('sportTournament.create.fields.sportType') }}</span>
                <strong>{{ t(`sportTournament.sportTypes.${tournament.sportType}`) }}</strong>
              </div>
              <div class="sport-tournament-groups__meta-item">
                <span>{{ t('sportTournament.groups.modeLabel') }}</span>
                <strong>{{ t(`sportTournament.groups.mode.${mode}`) }}</strong>
              </div>
            </div>

            <p class="sport-tournament-groups__state-note">
              {{ t(stateMeta.descriptionKey) }}
            </p>
          </div>

          <div class="sport-tournament-groups__hero-actions">
            <Button
              type="button"
              outlined
              class="rounded-xl"
              :label="t('sportTournament.groups.backToDetail')"
              @click="goBack"
            />
            <Button
              type="button"
              class="rounded-xl"
              :label="t('sportTournament.detail.editTournament')"
              :disabled="!canEditTournamentConfiguration(tournament.state)"
              @click="goToEdit"
            />
          </div>
        </div>

        <div v-if="isViewOnly" class="sport-tournament-groups__lock">
          <strong>{{ lockTitle }}</strong>
          <p>{{ lockMessage }}</p>
        </div>

        <div class="sport-tournament-groups__top-grid">
          <TournamentGroupSettings
            :model-value="settings"
            :disabled="isViewOnly"
            @update:modelValue="handleSettingsUpdate"
          />
          <TournamentGroupStats :summary="summary" />
        </div>

        <div class="sport-tournament-groups__workflow-grid">
          <TournamentStateTimeline :state="tournament.state" compact />
          <TournamentGroupDrawControls
            :mode="mode"
            :can-edit="!isViewOnly"
            :can-finalize="canFinalize"
            :locked="isViewOnly"
            :issue-count="groupWarningItems.length"
            :last-generated-at="lastGeneratedAt"
            @update:mode="handleModeUpdate"
            @preview="handlePreview"
            @save="handleSaveDraft"
            @finalize="handleFinalize"
            @reset="handleReset"
          />
        </div>

        <div v-if="groupWarningItems.length" class="sport-tournament-groups__warnings">
          <p class="sport-tournament-groups__warnings-title">{{ t('sportTournament.groups.validation.title') }}</p>
          <ul class="sport-tournament-groups__warning-list">
            <li v-for="issue in groupWarningItems" :key="`${issue.type}-${issue.groupId || issue.count}`" class="sport-tournament-groups__warning-item">
              {{ t(issue.messageKey) }}
            </li>
          </ul>
        </div>

        <TournamentGroupSeedPanel
          v-if="settings.seededMode"
          :teams="seedTeams"
          :seeded-mode="settings.seededMode"
        />

        <TournamentGroupAssignmentPanel
          v-if="!isViewOnly && mode === 'manual'"
          :teams="unassignedTeams"
          :group-options="groupOptions"
          :disabled="isViewOnly"
          @assign="handleAssignTeam"
        />

        <TournamentGroupGrid
          :groups="resolvedGroups"
          :editable="!isViewOnly && mode === 'manual'"
          @remove-team="handleRemoveTeam"
        />
      </div>

      <div v-else class="sport-tournament-groups__empty">
        <div class="sport-tournament-groups__empty-card">
          <h3>{{ t('sportTournament.groups.notFoundTitle') }}</h3>
          <p>{{ t('sportTournament.groups.notFoundMessage') }}</p>
          <Button
            type="button"
            class="rounded-xl"
            :label="t('sportTournament.groups.backToList')"
            @click="router.push({ name: 'dashboard-sport-admin-tournaments' })"
          />
        </div>
      </div>
    </section>

    <TournamentDrawPreviewDialog
      v-model:visible="previewVisible"
      :title="t('sportTournament.groups.preview.title')"
      :subtitle="t('sportTournament.groups.preview.subtitle')"
      :groups="resolvedPreviewGroups"
      :summary="previewSummary || summary"
      :warnings="previewWarnings"
      :can-apply="canEdit"
      @close="closePreview"
      @apply="handleApplyPreview"
    />

    <AlertError
      :show="showError"
      :title="t('common.errorOccurred')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="showError = false"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('sportTournament.groups.success.title')"
      :message="successMessage"
      :button-text="t('common.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.sport-tournament-groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-groups__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-groups__hero,
.sport-tournament-groups__top-grid,
.sport-tournament-groups__workflow-grid {
  display: grid;
  gap: 1rem;
}

.sport-tournament-groups__hero {
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(253, 193, 22, 0.12), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.sport-tournament-groups__hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-groups__page-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-groups__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-groups__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sport-tournament-groups__title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-groups__subtitle {
  margin: 0.5rem 0 0;
  color: #475569;
  font-size: 0.93rem;
  line-height: 1.6;
}

.sport-tournament-groups__state-note {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
}

.sport-tournament-groups__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.sport-tournament-groups__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.85rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
}

.sport-tournament-groups__meta-item span {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sport-tournament-groups__meta-item strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.5;
}

.sport-tournament-groups__hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-self: flex-start;
}

.sport-tournament-groups__top-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: start;
}

.sport-tournament-groups__workflow-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  align-items: start;
}

.sport-tournament-groups__warnings {
  padding: 1rem 1.05rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(253, 193, 22, 0.22);
  background: rgba(255, 251, 235, 0.9);
}

.sport-tournament-groups__warnings-title {
  margin: 0 0 0.55rem;
  color: #92400e;
  font-size: 0.9rem;
  font-weight: 800;
}

.sport-tournament-groups__warning-list {
  margin: 0;
  padding-left: 1.1rem;
  color: #92400e;
  line-height: 1.6;
}

.sport-tournament-groups__warning-item + .sport-tournament-groups__warning-item {
  margin-top: 0.35rem;
}

.sport-tournament-groups__lock {
  padding: 1rem 1.05rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(0, 174, 239, 0.18);
  background: rgba(239, 246, 255, 0.9);
  color: #1d4ed8;
}

.sport-tournament-groups__lock strong {
  display: block;
  margin-bottom: 0.25rem;
}

.sport-tournament-groups__lock p {
  margin: 0;
  line-height: 1.6;
}

.sport-tournament-groups__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-groups__empty-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 34rem;
}

.sport-tournament-groups__empty-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.sport-tournament-groups__empty-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .sport-tournament-groups__hero,
  .sport-tournament-groups__top-grid,
  .sport-tournament-groups__workflow-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-groups__hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .sport-tournament-groups__hero {
    padding: 1.1rem;
  }

  .sport-tournament-groups__title {
    font-size: 1.28rem;
  }

  .sport-tournament-groups__meta {
    grid-template-columns: 1fr;
  }
}
</style>
