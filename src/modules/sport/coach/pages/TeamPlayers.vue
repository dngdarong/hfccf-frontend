<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useTeamRoster } from '../composables/useTeamRoster'
import { playerStatusTone } from '@/modules/sport/constants/playerStatus'

defineOptions({ name: 'SportCoachTeamPlayersPage' })

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()
const { team, players, loadRoster, loading, error } = useTeamRoster()
const isKh = computed(() => language.value === 'KH')

const pageTitle = computed(() => team.value?.name || t('sportCoachTeamManagement.teamPlayers.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.teamPlayers.subtitle'))

function statusTone(status) {
  return playerStatusTone(status)
}

async function load(teamId) {
  if (!teamId) return
  await loadRoster(teamId)
}

function goToAddPlayer() {
  const id = String(route.params.teamId || team.value?.id || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-sport-coach-player-request', query: { teamId: id } })
}

watch(
  () => route.params.teamId,
  (value) => {
    void load(value)
  },
  { immediate: true },
)
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>
          {{ t('sportCoachTeamManagement.teamPlayers.panelTitle') }}
        </template>
        <template #content>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p class="m-0 text-sm text-slate-500">
              {{ team?.name || t('sportCoachTeamManagement.teamPlayers.emptyTeam') }}
            </p>
            <Button :label="t('sportCoachTeamManagement.actions.addPlayer')" icon="pi pi-plus" @click="goToAddPlayer" />
          </div>

          <DataTable :value="players" :loading="loading" data-key="id" striped-rows>
            <Column field="name" :header="t('sportCoachTeamManagement.common.player')" />
            <Column field="jerseyNumber" :header="t('sportCoachTeamManagement.common.jersey')" />
            <Column field="primaryPosition" :header="t('sportCoachTeamManagement.common.position')" />
            <Column field="approvalStatus" :header="t('sportCoachTeamManagement.common.approval')">
              <template #body="{ data }">
                <StatusBadge :status="statusTone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
          </DataTable>

          <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
        </template>
      </Card>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-coach-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-coach-page__panel {
  border-radius: 1.5rem;
  border: 1px solid #dbe6f4;
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.sport-coach-page--kh {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>

