<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useMatchSquad } from '@/modules/sport/match-squads/composables/useMatchSquad'
import MatchLineupCard from '@/modules/sport/match-squads/components/MatchLineupCard.vue'
import MatchSquadReviewPanel from '@/modules/sport/match-squads/components/MatchSquadReviewPanel.vue'
import MatchSquadStatusBadge from '@/modules/sport/match-squads/components/MatchSquadStatusBadge.vue'
import { groupMatchSquadPlayers, resolveMatchTeamOptions } from '@/modules/sport/match-squads/matchSquadUtils'

defineOptions({ name: 'SportAdminMatchSquadReviewPage' })

const route = useRoute()
const { t, language } = useLanguage()
const { match, squads, squad, loading, error, loadMatch, loadMatchSquads, loadTeamSquad, approveSquad, lockSquad } =
  useMatchSquad()

const teamId = ref('')
const isKh = computed(() => language.value === 'KH')
const matchId = computed(() => String(route.params.matchId || route.query.matchId || ''))
const teamOptions = computed(() => resolveMatchTeamOptions(match.value))
const selectedTeam = computed(() => teamOptions.value.find((option) => option.value === teamId.value) || null)
const pageTitle = computed(() => t('sportMatchSquad.admin.title'))
const pageSubtitle = computed(() => t('sportMatchSquad.admin.subtitle'))
const groupedSquad = computed(() => groupMatchSquadPlayers(squad.value?.players || []))
const pageError = computed(() => error.value)
const currentSquad = computed(() => squad.value)
const canApprove = computed(() => currentSquad.value?.status === 'submitted')
const canLock = computed(() => Boolean(currentSquad.value?.id) && currentSquad.value?.status !== 'locked')

async function refreshTeam() {
  if (!matchId.value || !teamId.value) {
    return
  }

  await loadTeamSquad(matchId.value, teamId.value)
}

async function handleApprove() {
  if (!currentSquad.value?.id) return

  await approveSquad(currentSquad.value.id)
  await refreshTeam()
}

async function handleLock() {
  if (!currentSquad.value?.id) return

  await lockSquad(currentSquad.value.id)
  await refreshTeam()
}

watch(teamId, async (value, previous) => {
  if (!value || value === previous) {
    return
  }

  await refreshTeam()
})

onMounted(async () => {
  await loadMatch(matchId.value)
  await loadMatchSquads(matchId.value)
  teamId.value =
    route.query.teamId && teamOptions.value.some((option) => option.value === String(route.query.teamId))
      ? String(route.query.teamId)
      : teamOptions.value[0]?.value || ''
})
</script>

<template>
  <MainLayout>
    <section :class="['match-squad-page', { 'match-squad-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="match-squad-page__panel">
        <template #title>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span>{{ t('sportMatchSquad.admin.panelTitle') }}</span>
            <MatchSquadStatusBadge :status="currentSquad?.status" />
          </div>
        </template>

        <template #content>
          <div class="grid gap-4 md:grid-cols-2">
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
                {{ match?.homeTeam || t('sportMatchSquad.admin.matchFallback') }}
                <span class="text-slate-400">{{ t('sportMatchSquad.common.vs') }}</span>
                {{ match?.awayTeam || t('sportMatchSquad.common.empty') }}
              </p>
            </div>
          </div>

          <p class="mt-3 text-sm text-slate-500">
            {{ t('sportMatchSquad.admin.summary', { squads: squads.length, team: selectedTeam?.label || t('sportMatchSquad.common.empty') }) }}
          </p>

          <MatchSquadReviewPanel
            class="mt-4"
            :squad="currentSquad"
            :loading="loading"
            :can-approve="canApprove"
            :can-lock="canLock"
            @approve="handleApprove"
            @lock="handleLock"
          />

          <p v-if="pageError" class="mt-4 text-sm text-red-600">{{ pageError }}</p>

          <div class="mt-6 grid gap-4 xl:grid-cols-2">
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

          <DataTable :value="squads" class="mt-6" data-key="id" striped-rows :loading="loading">
            <Column field="team.name" :header="t('sportMatchSquad.review.team')" />
            <Column field="status" :header="t('sportMatchSquad.review.status')">
              <template #body="{ data }">
                <StatusBadge :status="data.status" :label="t(`sportMatchSquad.statuses.${data.status}`)" :translate-label="false" size="sm" />
              </template>
            </Column>
            <Column field="playersCount" :header="t('sportMatchSquad.review.players')" />
          </DataTable>
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
