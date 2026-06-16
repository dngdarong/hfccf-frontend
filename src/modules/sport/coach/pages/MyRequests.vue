<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useAuthStore } from '@/store/userStore'
import { useSportApprovals } from '@/modules/sport/admin/composables/useSportApprovals'
import { useRouter } from 'vue-router'

defineOptions({ name: 'SportCoachRequestsPage' })

const router = useRouter()
const authStore = useAuthStore()
const { t, language } = useLanguage()
const { loadPendingPlayers, loadPendingMatches } = useSportApprovals()
const pendingPlayers = ref([])
const pendingMatches = ref([])
const loading = ref(false)
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

function currentUserId() {
  return String(authStore.currentUser?.id || '').trim()
}

async function refresh() {
  loading.value = true
  try {
    const [players, matches] = await Promise.all([
      loadPendingPlayers(),
      loadPendingMatches(),
    ])

    pendingPlayers.value = (players.items || []).filter((item) => String(item.createdByUserId || '') === currentUserId())
    pendingMatches.value = (matches.items || []).filter((item) => String(item.createdByUserId || '') === currentUserId())
  } finally {
    loading.value = false
  }
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
          <DataTable :value="pendingPlayers" :loading="loading" data-key="id" striped-rows>
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
          <DataTable :value="pendingMatches" :loading="loading" data-key="id" striped-rows>
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
