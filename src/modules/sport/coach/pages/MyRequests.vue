<script setup>
import { computed, onMounted } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useRouter } from 'vue-router'
import { useCoachRequests } from '../composables/useCoachRequests'

defineOptions({ name: 'SportCoachRequestsPage' })

const router = useRouter()
const { t, language } = useLanguage()
const { loadRequests, playerRequests, matchRequests, loading, error } = useCoachRequests()
const isKh = computed(() => language.value === 'KH')

const pageTitle = computed(() => t('sportCoachTeamManagement.requests.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.requests.subtitle'))

function tone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'approved' || value === 'active') return 'success'
  if (value === 'pending') return 'warning'
  if (value === 'rejected') return 'danger'
  return 'info'
}

async function refresh() {
  await loadRequests()
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>{{ t('sportCoachTeamManagement.requests.playersTitle') }}</template>
        <template #content>
          <p v-if="error" class="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
          </p>
          <p v-else-if="!loading && !playerRequests.length" class="m-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {{ t('sportCoachTeamManagement.requests.emptyPlayers') }}
          </p>
          <DataTable v-else :value="playerRequests" :loading="loading" data-key="id" striped-rows>
            <Column field="name" :header="t('sportCoachTeamManagement.common.player')" />
            <Column field="team" :header="t('sportCoachTeamManagement.common.team')" />
            <Column field="approvalStatus" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <Card class="sport-coach-page__panel">
        <template #title>{{ t('sportCoachTeamManagement.requests.matchesTitle') }}</template>
        <template #content>
          <p v-if="!error && !loading && !matchRequests.length" class="m-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {{ t('sportCoachTeamManagement.requests.emptyMatches') }}
          </p>
          <DataTable v-else :value="matchRequests" :loading="loading" data-key="id" striped-rows>
            <Column field="homeTeam" :header="t('sportCoachTeamManagement.common.homeTeam')" />
            <Column field="awayTeam" :header="t('sportCoachTeamManagement.common.awayTeam')" />
            <Column field="approvalStatus" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
          </DataTable>
          <div class="mt-4 flex justify-end">
            <Button :label="t('sportCoachTeamManagement.actions.newRequest')" @click="router.push({ name: 'dashboard-sport-coach-match-request' })" />
          </div>
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

