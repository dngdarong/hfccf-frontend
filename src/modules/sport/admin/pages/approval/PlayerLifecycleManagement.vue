<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  PLAYER_APPROVAL_STATUS,
  PLAYER_LIFECYCLE_ACTIONS,
  PLAYER_ROSTER_STATUSES,
  playerStatusTone,
} from '@/modules/sport/constants/playerStatus'
import { usePlayerLifecycle } from '@/modules/sport/admin/composables/usePlayerLifecycle'

defineOptions({ name: 'SportAdminPlayerLifecyclePage' })

const { t, language } = useLanguage()
const { items, loadPlayers, loadHistory, updateStatus, markInjury, markSuspension, release, archive, loading, error } = usePlayerLifecycle()
const selectedStatus = ref('')
const selectedApproval = ref('')
const historyDialog = ref(false)
const historyPlayer = ref(null)
const historyMemberships = ref([])

const isKh = computed(() => language.value === 'KH')
const pageTitle = computed(() => t('sportPlayerLifecycle.adminLifecycle.title'))
const pageSubtitle = computed(() => t('sportPlayerLifecycle.adminLifecycle.subtitle'))
const filteredPlayers = computed(() => items.value.filter((player) => {
  const status = String(player.rosterStatus || player.status || '').toLowerCase()
  const approval = String(player.approvalStatus || '').toLowerCase()

  if (selectedStatus.value && status !== selectedStatus.value) return false
  if (selectedApproval.value && approval !== selectedApproval.value) return false
  return true
}))

const statusOptions = computed(() => [
  { label: t('sportPlayerLifecycle.filters.allStatuses'), value: '' },
  ...PLAYER_ROSTER_STATUSES.map((value) => ({
    label: t(`sportPlayerLifecycle.statuses.${value}`),
    value,
  })),
])

const approvalOptions = computed(() => [
  { label: t('sportPlayerLifecycle.filters.allApprovals'), value: '' },
  { label: t('sportPlayerLifecycle.approvals.pending'), value: PLAYER_APPROVAL_STATUS.PENDING },
  { label: t('sportPlayerLifecycle.approvals.approved'), value: PLAYER_APPROVAL_STATUS.APPROVED },
  { label: t('sportPlayerLifecycle.approvals.rejected'), value: PLAYER_APPROVAL_STATUS.REJECTED },
])

function tone(status) {
  return playerStatusTone(status)
}

async function refresh() {
  await loadPlayers({
    // The backend caps player listings to keep pagination responses bounded.
    perPage: 100,
    status: selectedStatus.value,
  })
}

async function changeStatus(player, status) {
  if (!player?.id) return

  const payload = { roster_status: status, notes: t('sportPlayerLifecycle.statusNotes.adminChange') }

  if (status === PLAYER_LIFECYCLE_ACTIONS.INJURED) {
    await markInjury(player.id, { notes: t('sportPlayerLifecycle.statusNotes.adminChange') })
  } else if (status === PLAYER_LIFECYCLE_ACTIONS.SUSPENDED) {
    await markSuspension(player.id, { notes: t('sportPlayerLifecycle.statusNotes.adminChange') })
  } else if (status === PLAYER_LIFECYCLE_ACTIONS.RELEASED) {
    await release(player.id, { notes: t('sportPlayerLifecycle.statusNotes.adminChange') })
  } else if (status === PLAYER_LIFECYCLE_ACTIONS.ARCHIVED) {
    await archive(player.id, { notes: t('sportPlayerLifecycle.statusNotes.adminChange') })
  } else {
    await updateStatus(player.id, payload)
  }

  await refresh()
}

async function openHistory(player) {
  if (!player?.id) return

  const response = await loadHistory(player.id)
  historyPlayer.value = response.player || player
  historyMemberships.value = response.memberships || []
  historyDialog.value = true
}

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-lifecycle-page', { 'sport-lifecycle-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-lifecycle-page__panel">
        <template #title>{{ t('sportPlayerLifecycle.adminLifecycle.panelTitle') }}</template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-2">
            <Select v-model="selectedStatus" :options="statusOptions" option-label="label" option-value="value" :placeholder="t('sportPlayerLifecycle.filters.status')" @change="refresh" />
            <Select v-model="selectedApproval" :options="approvalOptions" option-label="label" option-value="value" :placeholder="t('sportPlayerLifecycle.filters.approval')" />
          </div>

          <DataTable :value="filteredPlayers" class="mt-4" data-key="id" striped-rows :loading="loading">
            <Column field="name" :header="t('sportPlayerLifecycle.common.player')" />
            <Column field="team.name" :header="t('sportPlayerLifecycle.common.team')" />
            <Column field="approvalStatus" :header="t('sportPlayerLifecycle.common.approval')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
            <Column field="rosterStatus" :header="t('sportPlayerLifecycle.common.rosterStatus')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.rosterStatus)" :label="data.rosterStatus" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportPlayerLifecycle.common.actions')">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Button size="small" text :label="t('sportPlayerLifecycle.actions.history')" @click="openHistory(data)" />
                  <Button size="small" outlined :label="t('sportPlayerLifecycle.actions.active')" @click="changeStatus(data, PLAYER_LIFECYCLE_ACTIONS.ACTIVE)" />
                  <Button size="small" outlined :label="t('sportPlayerLifecycle.actions.injured')" @click="changeStatus(data, PLAYER_LIFECYCLE_ACTIONS.INJURED)" />
                  <Button size="small" outlined :label="t('sportPlayerLifecycle.actions.suspended')" @click="changeStatus(data, PLAYER_LIFECYCLE_ACTIONS.SUSPENDED)" />
                  <Button size="small" severity="warning" :label="t('sportPlayerLifecycle.actions.released')" @click="changeStatus(data, PLAYER_LIFECYCLE_ACTIONS.RELEASED)" />
                  <Button size="small" severity="danger" :label="t('sportPlayerLifecycle.actions.archive')" @click="changeStatus(data, PLAYER_LIFECYCLE_ACTIONS.ARCHIVED)" />
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
