<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'

const props = defineProps({
  risks: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const hasRiskValues = computed(() => Object.values(props.risks || {}).some((value) => value !== null && value !== undefined && String(value).trim() !== ''))
const cards = computed(() => ([
  { title: t('preschoolOperationsPage.criticalRisks'), value: props.risks.healthAlerts ?? '—', tone: 'rose' },
  { title: t('preschoolOperationsPage.blockedWorkflows'), value: props.risks.guardianIssues ?? '—', tone: 'amber' },
  { title: t('preschoolOperationsPage.overduePayments'), value: props.risks.overdueInvoices ?? '—', tone: 'violet' },
  { title: t('preschoolOperationsPage.missingSessions'), value: props.risks.missingSessions ?? '—', tone: 'blue' },
  { title: t('preschoolOperationsPage.openAlerts'), value: props.risks.openAttendanceAlerts ?? '—', tone: 'emerald' },
]))
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.operationalRisks') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.criticalRisks') }}</p>
    </div>

    <OperationsEmptyState v-if="!hasRiskValues" :title="t('preschoolOperationsPage.noRisks')" />

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" />
    </div>
  </section>
</template>
