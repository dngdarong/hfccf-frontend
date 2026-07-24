<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useCoachTeams } from '../composables/useCoachTeams'

defineOptions({ name: 'SportCoachMyTeamsPage' })

const router = useRouter()
const { t, language } = useLanguage()
const { items: teams, loading, error, loadTeams } = useCoachTeams()
const isKh = computed(() => language.value === 'KH')

const pageTitle = computed(() => t('sportCoachTeamManagement.myTeams.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.myTeams.subtitle'))

function teamStatusTone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'pending') return 'warning'
  if (value === 'inactive') return 'danger'
  return 'info'
}

function goToTeam(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-sport-coach-roster', query: { teamId: id } })
}

function goToPlayerRequest(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-sport-coach-player-request', query: { teamId: id } })
}

function goToMatchRequest(team) {
  const id = String(team?.id || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-sport-coach-match-request', query: { teamId: id } })
}

function goToRequests() {
  router.push({ name: 'dashboard-sport-coach-requests' })
}

onMounted(() => {
  void loadTeams({ perPage: 100 })
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>
          {{ t('sportCoachTeamManagement.myTeams.panelTitle') }}
        </template>
        <template #content>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p class="m-0 text-sm text-slate-500">
              {{ t('sportCoachTeamManagement.myTeams.panelText') }}
            </p>
            <Button :label="t('sportCoachTeamManagement.common.myRequests')" icon="pi pi-inbox" outlined @click="goToRequests" />
          </div>

          <DataTable :value="teams" :loading="loading" data-key="id" striped-rows>
            <Column field="name" :header="t('sportCoachTeamManagement.common.team')" />
            <Column field="division" :header="t('sportCoachTeamManagement.common.division')" />
            <Column field="playersCount" :header="t('sportCoachTeamManagement.common.players')" />
            <Column field="status" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="teamStatusTone(data.status)" :label="data.status" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportCoachTeamManagement.common.actions')">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Button size="small" :label="t('sportCoachTeamManagement.actions.viewPlayers')" @click="goToTeam(data)" />
                  <Button size="small" outlined :label="t('sportCoachTeamManagement.actions.addPlayer')" @click="goToPlayerRequest(data)" />
                  <Button size="small" text :label="t('sportCoachTeamManagement.actions.requestMatch')" @click="goToMatchRequest(data)" />
                </div>
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

