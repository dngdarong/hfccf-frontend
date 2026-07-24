<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import FormMatche from '@/modules/sport/admin/components/add-match/FormMatche.vue'
import MatchChecklist from '@/modules/sport/admin/components/add-match/MatchChecklist.vue'
import {
  createSportMatch,
  fetchSportMatch,
  fetchSportTeams,
  fetchSportTournaments,
  updateSportMatch,
} from '@/modules/sport/services/sportApi'
import {
  initializeMatchForm,
  getFormPayload,
  validateTeams,
} from './utils/addMatchHelpers'
import {
  COMPETITION_TYPES,
  MATCH_STATUS,
  DEFAULT_MATCH_STATUS,
  DEFAULT_COMPETITION_TYPE,
} from './constants/addMatchConstants'

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
const teamRows = ref([])
const tournamentRows = ref([])

const competitionType = ref(DEFAULT_COMPETITION_TYPE)
const tournament = ref('')
const tournamentId = ref('')
const dateTime = ref('')
const venue = ref('')
const status = ref(DEFAULT_MATCH_STATUS)
const homeTeam = ref('')
const awayTeam = ref('')

const competitionTypeOptions = computed(() => [
  { value: COMPETITION_TYPES.TOURNAMENT, label: t('sportMatchesManagement.competitionTypes.tournament') },
  { value: COMPETITION_TYPES.FRIENDLY, label: t('sportMatchesManagement.competitionTypes.friendly') },
])

const tournamentOptions = computed(() =>
  tournamentRows.value.map((item) => ({
    value: String(item.id),
    label: item.name || item.title || item.tournamentCode || String(item.id),
  })),
)

const statusOptions = computed(() => [
  { value: 'draft', label: t('sportMatchesManagement.status.draft') },
  { value: MATCH_STATUS.SCHEDULED, label: t('sportMatchesManagement.status.scheduled') },
  { value: MATCH_STATUS.LIVE, label: t('sportMatchesManagement.status.live') },
  { value: MATCH_STATUS.COMPLETED, label: t('sportMatchesManagement.status.completed') },
  { value: MATCH_STATUS.POSTPONED, label: t('sportMatchesManagement.status.postponed') },
  { value: MATCH_STATUS.CANCELLED, label: t('sportMatchesManagement.status.cancelled') },
])

const teamOptions = computed(() => {
  return [...new Set(teamRows.value.map((item) => String(item?.name || '').trim()).filter(Boolean))].sort()
})

const selectedCompetitionLabel = computed(() => {
  const selected = competitionTypeOptions.value.find((option) => option.value === competitionType.value)
  return selected?.label || t('sportMatchesManagement.competitionTypePlaceholder')
})

const selectedTournamentLabel = computed(() => {
  if (competitionType.value === COMPETITION_TYPES.FRIENDLY) {
    return tournament.value || t('sportMatchesManagement.tournamentNamePlaceholder')
  }

  const selected = tournamentOptions.value.find((option) => option.value === String(tournamentId.value))
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

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
  feedbackMessage.value = ''
}

watch(competitionType, (nextType) => {
  if (nextType === COMPETITION_TYPES.FRIENDLY) {
    tournamentId.value = ''
  } else {
    tournament.value = ''
  }
})

async function onSubmit() {
  resetFeedback()

  const validationError = validateTeams(homeTeam.value, awayTeam.value, t)
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    const payload = getFormPayload(
      competitionType.value,
      tournamentId.value,
      tournament.value,
      dateTime.value,
      venue.value,
      status.value,
      homeTeam.value,
      awayTeam.value,
    )

    if (isEditMode.value && matchId.value) {
      await updateSportMatch(matchId.value, payload)
    } else {
      await createSportMatch(payload)
    }
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

onMounted(async () => {
  await Promise.all([
    fetchSportTeams({ perPage: 100 })
      .then((response) => {
        teamRows.value = response.items || []
      })
      .catch(() => {
        teamRows.value = []
      }),
    fetchSportTournaments({ perPage: 100 })
      .then((response) => {
        tournamentRows.value = response.items || []
      })
      .catch(() => {
        tournamentRows.value = []
      }),
  ])

  if (!matchId.value) return

  fetchSportMatch(matchId.value)
    .then((match) => {
      if (!match?.id) return
      initializeMatchForm(match, {
        setCompetitionType: (value) => {
          competitionType.value = value
        },
        setTournamentId: (value) => {
          tournamentId.value = value
        },
        setTournament: (value) => {
          tournament.value = value
        },
        setDateTime: (value) => {
          dateTime.value = value
        },
        setVenue: (value) => {
          venue.value = value
        },
        setStatus: (value) => {
          status.value = value
        },
        setHomeTeam: (value) => {
          homeTeam.value = value
        },
        setAwayTeam: (value) => {
          awayTeam.value = value
        },
      })
    })
    .catch(() => {})
})
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
            :tournament-id="tournamentId"
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
            @update:tournament-id="tournamentId = $event"
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
