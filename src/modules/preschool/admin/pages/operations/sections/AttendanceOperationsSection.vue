<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  attendance: {
    type: Object,
    default: () => ({}),
  },
  alerts: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()

const cards = computed(() => {
  const summary = props.attendance.summary || {}
  return [
    { title: t('preschoolOperationsPage.attendanceRate'), value: summary.attendanceRate ?? '—', tone: 'emerald', to: resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-dashboard') },
    { title: t('preschoolOperationsPage.present'), value: summary.present ?? '—', tone: 'blue' },
    { title: t('preschoolOperationsPage.absent'), value: summary.absent ?? '—', tone: 'rose' },
    { title: t('preschoolOperationsPage.late'), value: summary.late ?? '—', tone: 'amber' },
    { title: t('preschoolOperationsPage.excused'), value: summary.excused ?? '—', tone: 'slate' },
    { title: t('preschoolOperationsPage.unexcused'), value: summary.unexcused ?? '—', tone: 'violet' },
  ]
})

const recentAlerts = computed(() => Array.isArray(props.alerts?.datasets?.recentAlerts) ? props.alerts.datasets.recentAlerts : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.attendanceMonitoring') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.openAlerts') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" :to="card.to" :details-label="card.to ? t('preschoolOperationsPage.viewDetails') : ''" />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.openAlerts') }}</h3>
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ recentAlerts.length }}</span>
      </div>

      <OperationsEmptyState v-if="recentAlerts.length === 0" :title="t('preschoolOperationsPage.noData')" />

      <div v-else class="mt-4 grid gap-3 md:grid-cols-2">
        <OperationsTimelineItem v-for="item in recentAlerts" :key="item.id || item.createdAt || item.alertLabel" :item="item" />
      </div>
    </div>
  </section>
</template>
