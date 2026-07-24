<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useSportApprovals } from '@/modules/sport/admin/composables/useSportApprovals'

defineOptions({ name: 'SportPendingMatchApprovalsPage' })

const { t, language } = useLanguage()
const { loadPendingMatches, approvePendingMatch, rejectPendingMatch } = useSportApprovals()
const loading = ref(false)
const items = ref([])
const currentPage = ref(1)
const pageSize = 5
const isKh = computed(() => language.value === 'KH')
const totalPages = computed(() => Math.max(Math.ceil(items.value.length / pageSize), 1))
const paginatedItems = computed(() => items.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))

watch(() => items.value.length, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

async function refresh() {
  loading.value = true
  try {
    const response = await loadPendingMatches()
    items.value = response.items || []
    currentPage.value = 1
  } finally {
    loading.value = false
  }
}

async function approve(row) {
  await approvePendingMatch(row.id)
  await refresh()
}

async function reject(row) {
  await rejectPendingMatch(row.id, { rejection_reason: t('sportCoachTeamManagement.common.rejectedByAdmin') })
  await refresh()
}

function tone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'pending') return 'warning'
  if (value === 'approved') return 'success'
  if (value === 'rejected') return 'danger'
  return 'info'
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="t('sportCoachTeamManagement.approvals.matchesTitle')" :subtitle="t('sportCoachTeamManagement.approvals.matchesSubtitle')" />
      <Card class="sport-coach-page__panel">
        <template #content>
          <DataTable :value="paginatedItems" :loading="loading" data-key="id" striped-rows>
            <Column field="homeTeam" :header="t('sportCoachTeamManagement.common.homeTeam')" />
            <Column field="awayTeam" :header="t('sportCoachTeamManagement.common.awayTeam')" />
            <Column field="approvalStatus" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.approvalStatus)" :label="data.approvalStatus" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportCoachTeamManagement.common.actions')">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button size="small" :label="t('sportCoachTeamManagement.actions.approve')" @click="approve(data)" />
                  <Button size="small" outlined :label="t('sportCoachTeamManagement.actions.reject')" @click="reject(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-if="totalPages > 1" class="mt-4 flex justify-end">
            <Pagination v-model="currentPage" :total-pages="totalPages" />
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

