<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { MATCH_SQUAD_STATUS, normalizeMatchSquadStatus } from '@/modules/sport/constants/matchSquad'
import { useCoachTeams } from '../composables/useCoachTeams'
import MatchLineupCard from '@/modules/sport/match-squads/components/MatchLineupCard.vue'
import MatchSquadPlayerPicker from '@/modules/sport/match-squads/components/MatchSquadPlayerPicker.vue'
import MatchSquadStatusBadge from '@/modules/sport/match-squads/components/MatchSquadStatusBadge.vue'
import { useMatchEligibility } from '@/modules/sport/match-squads/composables/useMatchEligibility'
import { useMatchSquad } from '@/modules/sport/match-squads/composables/useMatchSquad'
import { useMatchSquadSelection } from '@/modules/sport/match-squads/composables/useMatchSquadSelection'
import { groupMatchSquadPlayers, resolveMatchTeamOptions } from '@/modules/sport/match-squads/matchSquadUtils'

defineOptions({ name: 'SportCoachMatchSquadSelectionPage' })

const route = useRoute()
const { t, language } = useLanguage()
const { items: coachTeams, loadTeams, loading: teamsLoading, error: teamsError } = useCoachTeams()
const { match, squad, loading, error, loadMatch, loadTeamSquad, saveSquad, submitSquad } = useMatchSquad()
const { players: eligibilityPlayers, loading: eligibilityLoading, error: eligibilityError, loadEligibility } = useMatchEligibility()
const { players: draftPlayers, starters, substitutes, syncFromEligibility, setRole, payload } =
  useMatchSquadSelection()

const teamId = ref('')
const notes = ref('')

const isKh = computed(() => language.value === 'KH')
const matchId = computed(() => String(route.params.matchId || route.query.matchId || ''))
const allowedTeamIds = computed(() => new Set(coachTeams.value.map((team) => String(team.id))))
const teamOptions = computed(() => resolveMatchTeamOptions(match.value, allowedTeamIds.value))
const selectedTeam = computed(() => teamOptions.value.find((option) => option.value === teamId.value) || null)
const selectedTeamLabel = computed(() => selectedTeam.value?.label || t('sportMatchSquad.coach.noTeamSelected'))
const pageTitle = computed(() => t('sportMatchSquad.coach.title'))
const pageSubtitle = computed(() => t('sportMatchSquad.coach.subtitle'))
const currentSquad = computed(() => squad.value)
const squadStatus = computed(() => normalizeMatchSquadStatus(currentSquad.value?.status))
const pageLoading = computed(() => teamsLoading.value || loading.value || eligibilityLoading.value)
const pageError = computed(() => teamsError.value || error.value || eligibilityError.value)
const groupedSquad = computed(() => groupMatchSquadPlayers(draftPlayers.value))
const canEdit = computed(() => squadStatus.value === MATCH_SQUAD_STATUS.DRAFT)
const canSave = computed(() => canEdit.value && Boolean(teamId.value) && draftPlayers.value.length > 0)
const canSubmit = computed(() => canSave.value)

async function refreshTeam() {
  if (!matchId.value || !teamId.value) {
    syncFromEligibility([], [])
    notes.value = ''
    return
  }

  const [eligibilityResponse, squadResponse] = await Promise.all([
    loadEligibility(matchId.value, teamId.value),
    loadTeamSquad(matchId.value, teamId.value),
  ])

  syncFromEligibility(eligibilityResponse.items || [], squadResponse.squad?.players || squadResponse.players || [])
  notes.value = squadResponse.squad?.notes || ''
}

async function saveDraft() {
  if (!matchId.value || !teamId.value) return

  const response = await saveSquad(matchId.value, teamId.value, {
    notes: notes.value,
    players: payload.value,
  })

  syncFromEligibility(eligibilityPlayers.value, response.squad?.players || [])
}

async function submitDraft() {
  if (!currentSquad.value?.id) {
    await saveDraft()
  }

  const targetSquadId = currentSquad.value?.id
  if (!targetSquadId) return

  await submitSquad(targetSquadId)
  await refreshTeam()
}

function handleRoleChange({ playerId, role }) {
  setRole(playerId, role)
}

watch(teamId, async (value, previous) => {
  if (!value || value === previous) {
    return
  }

  await refreshTeam()
})

onMounted(async () => {
  await loadTeams({ perPage: 100 })
  await loadMatch(matchId.value)

  const initialTeam =
    route.query.teamId && teamOptions.value.some((team) => team.value === String(route.query.teamId))
      ? String(route.query.teamId)
      : teamOptions.value[0]?.value || ''

  teamId.value = initialTeam
})
</script>

<template>
  <MainLayout>
    <section :class="['match-squad-page', { 'match-squad-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="match-squad-page__panel">
        <template #title>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span>{{ t('sportMatchSquad.coach.panelTitle') }}</span>
            <MatchSquadStatusBadge :status="currentSquad?.status" />
          </div>
        </template>

        <template #content>
          <div class="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
            <Select
              v-model="teamId"
              :options="teamOptions"
              option-label="label"
              option-value="value"
              append-to="self"
              :placeholder="t('sportMatchSquad.common.selectTeam')"
            />
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.common.match') }}</p>
              <p class="m-0 mt-1 font-semibold text-slate-900">
                {{ match?.homeTeam || t('sportMatchSquad.coach.matchFallback') }}
                <span class="text-slate-400">{{ t('sportMatchSquad.common.vs') }}</span>
                {{ match?.awayTeam || t('sportMatchSquad.common.empty') }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="m-0 text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('sportMatchSquad.common.team') }}</p>
              <p class="m-0 mt-1 font-semibold text-slate-900">{{ selectedTeamLabel }}</p>
            </div>
          </div>

          <p class="mt-3 text-sm text-slate-500">
            {{ t('sportMatchSquad.coach.summary', { players: draftPlayers.length, starters: starters.length, substitutes: substitutes.length }) }}
          </p>

          <Textarea v-model="notes" class="mt-4 w-full" rows="3" auto-resize :placeholder="t('sportMatchSquad.common.notes')" />

          <div class="mt-4 flex flex-wrap gap-3">
            <Button :label="t('sportMatchSquad.actions.saveDraft')" :loading="pageLoading" :disabled="!canSave" @click="saveDraft" />
            <Button
              outlined
              :label="t('sportMatchSquad.actions.submitSquad')"
              :loading="pageLoading"
              :disabled="!canSubmit"
              @click="submitDraft"
            />
          </div>

          <p v-if="pageError" class="mt-4 text-sm text-red-600">{{ pageError }}</p>

          <div class="mt-6 grid gap-4 xl:grid-cols-2">
            <MatchSquadPlayerPicker
              :players="draftPlayers"
              :loading="pageLoading"
              :disabled="!canEdit"
              @change-role="handleRoleChange"
            />

            <div class="grid gap-4">
              <MatchLineupCard
                :title="t('sportMatchSquad.sections.starters')"
                :players="groupedSquad.starters"
                :empty-label="t('sportMatchSquad.sections.emptyStarters')"
                status="starter"
              />
              <MatchLineupCard
                :title="t('sportMatchSquad.sections.substitutes')"
                :players="groupedSquad.substitutes"
                :empty-label="t('sportMatchSquad.sections.emptySubstitutes')"
                status="substitute"
              />
              <MatchLineupCard
                :title="t('sportMatchSquad.sections.reserves')"
                :players="groupedSquad.reserves"
                :empty-label="t('sportMatchSquad.sections.emptyReserves')"
                status="reserve"
              />
              <MatchLineupCard
                :title="t('sportMatchSquad.sections.unavailable')"
                :players="groupedSquad.unavailable"
                :empty-label="t('sportMatchSquad.sections.emptyUnavailable')"
                status="unavailable"
              />
            </div>
          </div>
        </template>
      </Card>
    </section>
  </MainLayout>
</template>

<style scoped>
.match-squad-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.match-squad-page__panel {
  border-radius: 1.5rem;
  border: 1px solid #dbe6f4;
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.match-squad-page--kh {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>

