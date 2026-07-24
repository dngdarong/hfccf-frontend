<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  guardianCommunications: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()

const summary = computed(() => props.guardianCommunications.summary || {})
const cards = computed(() => ([
  { title: t('preschoolOperationsPage.contactLogs'), value: summary.value.contactLogs ?? '—', tone: 'blue', to: resolveOperationsRoute(router, 'dashboard-preschool-admin-guardian-communications') },
  { title: t('preschoolOperationsPage.followUps'), value: summary.value.followUps ?? '—', tone: 'amber' },
  { title: t('preschoolOperationsPage.completed'), value: summary.value.completed ?? '—', tone: 'emerald' },
  { title: t('preschoolOperationsPage.outstandingFollowUps'), value: summary.value.outstandingFollowUps ?? '—', tone: 'rose' },
]))

const items = computed(() => Array.isArray(props.guardianCommunications.items) ? props.guardianCommunications.items : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.guardianFollowUp') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.guardianFollowUps') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" :to="card.to" :details-label="card.to ? t('preschoolOperationsPage.viewDetails') : ''" />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.quickActions') }}</h3>
      <OperationsEmptyState v-if="items.length === 0" :title="t('preschoolOperationsPage.noData')" />
      <div v-else class="mt-4 grid gap-3 md:grid-cols-2">
        <OperationsTimelineItem v-for="item in items" :key="item.id || item.createdAt || item.subject" :item="item" />
      </div>
    </div>
  </section>
</template>
