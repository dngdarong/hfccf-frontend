<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'

const props = defineProps({
  health: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()
const summary = computed(() => props.health.summary || {})
const cards = computed(() => ([
  { title: t('preschoolOperationsPage.openHealthAlerts'), value: summary.value.openAlerts ?? summary.value.healthAlerts ?? '—', tone: 'rose' },
  { title: t('preschoolOperationsPage.criticalIncidents'), value: summary.value.criticalAlerts ?? summary.value.criticalIncidents ?? '—', tone: 'amber' },
  { title: t('preschoolOperationsPage.medicationReminders'), value: summary.value.medicationReminders ?? '—', tone: 'blue' },
  { title: t('preschoolOperationsPage.studentsRequiringAttention'), value: summary.value.studentsRequiringAttention ?? '—', tone: 'slate' },
]))

const alerts = computed(() => Array.isArray(props.health.alerts) ? props.health.alerts : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.healthMonitoring') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.healthAlerts') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.healthMonitoring') }}</h3>
      <OperationsEmptyState v-if="alerts.length === 0" :title="t('preschoolOperationsPage.noData')" />
      <div v-else class="mt-4 grid gap-3 md:grid-cols-2">
        <OperationsTimelineItem v-for="item in alerts" :key="item.id || item.createdAt || item.title" :item="item" />
      </div>
    </div>
  </section>
</template>
