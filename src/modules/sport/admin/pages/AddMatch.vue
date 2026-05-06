<script setup>
/**
 * SportAdminAddMatchPage
 * Placeholder shell for creating or editing a match record.
 *
 * The page stays UI-only, but it now supports add/edit/delete flows so the
 * Manage Matches table can route to a real destination immediately.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import FormMatche from '@/modules/sport/admin/components/add-match/FormMatche.vue'
import MatchChecklist from '@/modules/sport/admin/components/add-match/MatchChecklist.vue'
import teamsManagementData from '@/mocks/sport/teams-management-data.json'
import matchesManagementData from '@/mocks/sport/matches-management-data.json'

defineOptions({
  name: 'SportAdminAddMatchPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const isKh = computed(() => language.value === 'KH')
const matchId = computed(() => String(route.params.id || route.query.id || '').trim())
const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(matchId.value)) return 'edit'
  return 'add'
})
const isEditMode = computed(() => mode.value === 'edit')

const pageTitle = computed(() => {
  if (isEditMode.value) return t('sportMatchesManagement.updateTitle')
  return t('sportMatchesManagement.addTitle')
})

const pageSubtitle = computed(() => {
  if (isEditMode.value) return t('sportMatchesManagement.updateSubtitle')
  return t('sportMatchesManagement.addSubtitle')
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const feedbackMessage = ref('')

const competitionType = ref('')
const tournament = ref('')
const dateTime = ref('')
const venue = ref('')
const status = ref('scheduled')
const homeTeam = ref('')
const awayTeam = ref('')

const competitionTypeOptions = computed(() => [
  { value: 'tournament', label: t('sportMatchesManagement.competitionTypes.tournament') },
  { value: 'friendly', label: t('sportMatchesManagement.competitionTypes.friendly') },
])

const tournamentOptions = computed(() => [
  { value: 'hfccf_cup_2026', label: 'HFCCF Cup 2026' },
  { value: 'friendly_league', label: 'Friendly League' },
  { value: 'summer_showcase', label: 'Summer Showcase' },
])

const statusOptions = computed(() => [
  { value: 'scheduled', label: t('sportMatchesManagement.status.scheduled') },
  { value: 'live', label: t('sportMatchesManagement.status.live') },
  { value: 'completed', label: t('sportMatchesManagement.status.completed') },
  { value: 'postponed', label: t('sportMatchesManagement.status.postponed') },
  { value: 'cancelled', label: t('sportMatchesManagement.status.cancelled') },
])

const teamOptions = computed(() => {
  // Reuse the live team directory so match team selection stays aligned with sport data.
  const teams = Array.isArray(teamsManagementData) ? teamsManagementData : []
  const values = teams
    .map((item) => String(item?.name || '').trim())
    .filter(Boolean)
  return [...new Set(values)].sort()
})

const selectedCompetitionLabel = computed(() => {
  const selected = competitionTypeOptions.value.find((option) => option.value === competitionType.value)
  return selected?.label || t('sportMatchesManagement.competitionTypePlaceholder')
})

const selectedTournamentLabel = computed(() => {
  if (competitionType.value === 'friendly') {
    return tournament.value || t('sportMatchesManagement.tournamentNamePlaceholder')
  }

  const selected = tournamentOptions.value.find((option) => option.value === tournament.value)
  return selected?.label || t('sportMatchesManagement.tournamentSelectPlaceholder')
})

const matchChecklistItems = computed(() => [
  {
    title: t('sportMatchesManagement.sidebarItems.competition'),
    text: selectedCompetitionLabel.value,
  },
  {
    title: t('sportMatchesManagement.sidebarItems.tournament'),
    text: selectedTournamentLabel.value,
  },
  {
    title: t('sportMatchesManagement.sidebarItems.teams'),
    text:
      homeTeam.value && awayTeam.value
        ? `${homeTeam.value} vs ${awayTeam.value}`
        : t('sportMatchesManagement.sidebarItems.teamsDetail'),
  },
  {
    title: t('sportMatchesManagement.sidebarItems.schedule'),
    text: dateTime.value || t('sportMatchesManagement.sidebarItems.scheduleDetail'),
  },
])

const checklistHighlightLabel = computed(() => t('sportMatchesManagement.sidebarHighlightLabel'))
const checklistHighlightValue = computed(() =>
  isEditMode.value ? t('sportMatchesManagement.sidebarHighlightEdit') : t('sportMatchesManagement.sidebarHighlightAdd'),
)

const selectedMatch = computed(() => {
  if (!matchId.value) return null
  const matches = Array.isArray(matchesManagementData) ? matchesManagementData : []
  return matches.find((item) => String(item?.id || '').trim() === matchId.value) || null
})

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
  feedbackMessage.value = ''
}

function parseSchedule(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const [datePart, timePart = ''] = raw.split(/\s+/)
  if (!datePart || !timePart) return raw
  return `${datePart}T${timePart.slice(0, 5)}`
}

function inferCompetitionType(match) {
  const tournamentName = String(match?.tournament || '').trim().toLowerCase()
  return tournamentName.includes('friendly') ? 'friendly' : 'tournament'
}

function applySelectedMatch(match) {
  if (!match) return

  // Hydrate the form from the mock row so edit mode behaves like a real record view.
  competitionType.value = inferCompetitionType(match)
  tournament.value = String(match.tournament || '')
  dateTime.value = parseSchedule(match.schedule)
  venue.value = String(match.venue || '')
  status.value = String(match.status || 'scheduled')
  homeTeam.value = String(match.homeTeam || '')
  awayTeam.value = String(match.awayTeam || '')
}

watch(
  selectedMatch,
  (match) => {
    if (match) {
      applySelectedMatch(match)
      return
    }

    // Keep the add flow clean when there is no record to hydrate.
    competitionType.value = ''
    tournament.value = ''
    dateTime.value = ''
    venue.value = ''
    status.value = 'scheduled'
    homeTeam.value = ''
    awayTeam.value = ''
  },
  { immediate: true },
)

async function onSubmit() {
  resetFeedback()

  if (homeTeam.value && homeTeam.value === awayTeam.value) {
    errorMessage.value = t('sportMatchesManagement.teamSelectionError')
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    // Placeholder submit: the real match form will replace this shell later.
    await new Promise((resolve) => setTimeout(resolve, 700))
    feedbackMessage.value = isEditMode.value
      ? t('sportMatchesManagement.updateSuccessMessage')
      : t('sportMatchesManagement.addSuccessMessage')
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportMatchesManagement.addFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onErrorClose() {
  showError.value = false
}

function onSuccessClose() {
  showSuccess.value = false
}

function onCancel() {
  router.push({ name: 'dashboard-sport-admin-matches' })
}
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-match-page add-match-page--kh' : 'add-match-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="add-match-page__shell">
        <div class="add-match-page__layout">
          <FormMatche
            :title="pageTitle"
            :description="''"
            :submit-text="
              isEditMode
                ? t('sportMatchesManagement.actions.updateButton')
                : t('sportMatchesManagement.actions.addButton')
            "
            :loading="isSubmitting"
            :competition-type="competitionType"
            :competition-type-options="competitionTypeOptions"
            :tournament="tournament"
            :tournament-options="tournamentOptions"
            :date-time="dateTime"
            :venue="venue"
            :status="status"
            :home-team="homeTeam"
            :away-team="awayTeam"
            :team-options="teamOptions"
            :status-options="statusOptions"
            :show-delete="isEditMode"
            :cancel-text="t('common.cancel')"
            @update:competition-type="competitionType = $event"
            @update:tournament="tournament = $event"
            @update:date-time="dateTime = $event"
            @update:venue="venue = $event"
            @update:status="status = $event"
            @update:home-team="homeTeam = $event"
            @update:away-team="awayTeam = $event"
            @submit="onSubmit"
            @cancel="onCancel"
          />

          <div class="add-match-page__rail">
            <MatchChecklist
              :title="t('sportMatchesManagement.sidebarTitle')"
              :description="t('sportMatchesManagement.sidebarText')"
              :items="matchChecklistItems"
              :highlight-label="checklistHighlightLabel"
              :highlight-value="checklistHighlightValue"
            />
          </div>
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('sportMatchesManagement.addErrorTitle')"
      :message="errorMessage || t('common.errorTryAgain')"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('sportMatchesManagement.updateSuccessTitle') : t('sportMatchesManagement.addSuccessTitle')"
      :message="feedbackMessage || t('common.actionCompleted')"
      :button-text="t('common.close')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-match-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-match-page__shell {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.add-match-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-match-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-match-page--kh .add-match-page__shell {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-match-page--kh :deep(.match-checklist .p-card-title),
.add-match-page--kh :deep(.match-checklist .p-card-content),
.add-match-page--kh :deep(.match-checklist .p-card-body),
.add-match-page--kh :deep(.match-checklist .p-card),
.add-match-page--kh :deep(.match-checklist p) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 1024px) {
  .add-match-page__layout {
    grid-template-columns: 1fr;
  }

  .add-match-page__rail {
    position: static;
  }
}
</style>
