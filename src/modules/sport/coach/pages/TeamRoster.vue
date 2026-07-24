<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  PLAYER_LIFECYCLE_ACTIONS,
  PLAYER_ROSTER_STATUS,
  PLAYER_ROSTER_STATUSES,
  playerStatusTone,
} from '@/modules/sport/constants/playerStatus'
import { useCoachTeams } from '../composables/useCoachTeams'
import { usePlayerLifecycle } from '@/modules/sport/admin/composables/usePlayerLifecycle'
import { useTeamRoster } from '../composables/useTeamRoster'

defineOptions({ name: 'SportCoachTeamRosterPage' })

const { t, language } = useLanguage()
const route = useRoute()
const { items: teams, loadTeams } = useCoachTeams()
const { loadHistory, updateStatus } = usePlayerLifecycle()
const { team, players, memberships, candidates, loadRoster, loadCandidates, addPlayer, error, loading } = useTeamRoster()
const teamId = ref('')
const selectedPlayerId = ref('')
const rosterStatus = ref(PLAYER_ROSTER_STATUS.ACTIVE)
const notes = ref('')
const historyDialog = ref(false)
const historyPlayer = ref(null)
const historyMemberships = ref([])

const isKh = computed(() => language.value === 'KH')
const pageTitle = computed(() => team.value?.name || t('sportPlayerLifecycle.coachRoster.title'))
const pageSubtitle = computed(() => t('sportPlayerLifecycle.coachRoster.subtitle'))
const rosterSummary = computed(() => ({
  players: players.value.length,
  memberships: memberships.value.length,
}))
const rosterStatusValues = [
  PLAYER_ROSTER_STATUS.ACTIVE,
  PLAYER_ROSTER_STATUS.INJURED,
  PLAYER_ROSTER_STATUS.SUSPENDED,
  PLAYER_ROSTER_STATUS.INACTIVE,
  PLAYER_ROSTER_STATUS.RELEASED,
]

const rosterStatusOptions = computed(() => PLAYER_ROSTER_STATUSES.filter((value) => rosterStatusValues.includes(value)).map((value) => ({
    label: t(`sportPlayerLifecycle.statuses.${value}`),
    value,
  })))

const addablePlayers = computed(() => candidates.value)

function rosterTone(status) {
  return playerStatusTone(status)
}

async function refresh() {
  if (!teamId.value) {
    return
  }

  await loadRoster(teamId.value)
  await loadCandidates(teamId.value)
}

async function handleAddPlayer() {
  if (!teamId.value || !selectedPlayerId.value) return

  await addPlayer(teamId.value, {
    player_id: selectedPlayerId.value,
    membership_status: rosterStatus.value,
    notes: notes.value,
  })

  selectedPlayerId.value = ''
  notes.value = ''
  rosterStatus.value = PLAYER_ROSTER_STATUS.ACTIVE
  await refresh()
}

async function changePlayerStatus(player, status) {
  if (!player?.id) return

  await updateStatus(player.id, {
    roster_status: status,
    notes: t('sportPlayerLifecycle.statusNotes.coachChange'),
  })

  await refresh()
}

async function openHistory(player) {
  if (!player?.id) return

  const response = await loadHistory(player.id)
  historyPlayer.value = response.player || player
  historyMemberships.value = response.memberships || []
  historyDialog.value = true
}

watch(teamId, async () => {
  await refresh()
})

onMounted(async () => {
  await loadTeams({ perPage: 100 })
  teamId.value = String(route.query.teamId || teams.value[0]?.id || '')
})

watch(
  () => route.query.teamId,
  (value) => {
    if (value) {
      teamId.value = String(value)
    }
  },
)
</script>

<template>
  <MainLayout>
    <section :class="['sport-lifecycle-page', { 'sport-lifecycle-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-lifecycle-page__panel">
        <template #title>{{ t('sportPlayerLifecycle.coachRoster.panelTitle') }}</template>
        <template #content>
          <div class="grid gap-4 lg:grid-cols-4">
            <Select v-model="teamId" :options="teams" option-label="name" option-value="id" :placeholder="t('sportPlayerLifecycle.common.selectTeam')" />
            <Select v-model="selectedPlayerId" :options="addablePlayers" option-label="name" option-value="id" :placeholder="t('sportPlayerLifecycle.common.selectPlayer')" />
            <Select v-model="rosterStatus" :options="rosterStatusOptions" option-label="label" option-value="value" :placeholder="t('sportPlayerLifecycle.common.rosterStatus')" />
            <Button :label="t('sportPlayerLifecycle.actions.addToRoster')" :loading="loading" @click="handleAddPlayer" />
          </div>
          <p class="mt-3 text-sm text-slate-500">
            {{ t('sportPlayerLifecycle.coachRoster.summary', { players: rosterSummary.players, memberships: rosterSummary.memberships }) }}
          </p>
          <p v-if="!error && !loading && !addablePlayers.length" class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {{ t('sportPlayerLifecycle.coachRoster.noCandidates') }}
          </p>
          <Textarea v-model="notes" class="mt-4 w-full" rows="3" auto-resize :placeholder="t('sportPlayerLifecycle.common.notes')" />

          <DataTable :value="players" class="mt-4" data-key="id" striped-rows :loading="loading">
            <Column field="name" :header="t('sportPlayerLifecycle.common.player')" />
            <Column field="jerseyNumber" :header="t('sportPlayerLifecycle.common.jersey')" />
            <Column field="primaryPosition" :header="t('sportPlayerLifecycle.common.position')" />
            <Column field="approvalStatus" :header="t('sportPlayerLifecycle.common.approval')">
              <template #body="{ data }">
                <StatusBadge :status="rosterTone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
            <Column field="rosterStatus" :header="t('sportPlayerLifecycle.common.rosterStatus')">
              <template #body="{ data }">
                <StatusBadge :status="rosterTone(data.rosterStatus)" :label="data.rosterStatus" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportPlayerLifecycle.common.actions')">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Button size="small" text :label="t('sportPlayerLifecycle.actions.history')" @click="openHistory(data)" />
                  <Button size="small" outlined :label="t('sportPlayerLifecycle.actions.injured')" @click="changePlayerStatus(data, PLAYER_LIFECYCLE_ACTIONS.INJURED)" />
                  <Button size="small" outlined :label="t('sportPlayerLifecycle.actions.suspended')" @click="changePlayerStatus(data, PLAYER_LIFECYCLE_ACTIONS.SUSPENDED)" />
                  <Button size="small" severity="warning" :label="t('sportPlayerLifecycle.actions.released')" @click="changePlayerStatus(data, PLAYER_LIFECYCLE_ACTIONS.RELEASED)" />
                </div>
              </template>
            </Column>
          </DataTable>

          <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
        </template>
      </Card>
    </section>

    <Dialog v-model:visible="historyDialog" modal :header="t('sportPlayerLifecycle.history.title')" :style="{ width: 'min(920px, 95vw)' }">
      <div class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="m-0 text-sm text-slate-500">{{ t('sportPlayerLifecycle.history.player') }}</p>
          <p class="m-0 text-lg font-semibold text-slate-900">{{ historyPlayer?.name }}</p>
        </div>
        <DataTable :value="historyMemberships" data-key="id" striped-rows>
          <Column field="team.name" :header="t('sportPlayerLifecycle.common.team')" />
          <Column field="status" :header="t('sportPlayerLifecycle.common.membershipStatus')" />
          <Column field="joinedAt" :header="t('sportPlayerLifecycle.history.joinedAt')" />
          <Column field="leftAt" :header="t('sportPlayerLifecycle.history.leftAt')" />
        </DataTable>
      </div>
    </Dialog>
  </MainLayout>
</template>

<style scoped>
.sport-lifecycle-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-lifecycle-page__panel {
  border-radius: 1.5rem;
  border: 1px solid #dbe6f4;
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.sport-lifecycle-page--kh {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>

