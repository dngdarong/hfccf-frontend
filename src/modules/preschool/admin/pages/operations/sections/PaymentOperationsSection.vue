<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  payments: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()

const summary = computed(() => props.payments.summary || {})
const cards = computed(() => ([
  { title: t('preschoolOperationsPage.overduePayments'), value: summary.value.overdue ?? props.payments.overdue?.length ?? '—', tone: 'rose', to: resolveOperationsRoute(router, 'dashboard-preschool-admin-payment') },
  { title: t('preschoolOperationsPage.outstandingBalance'), value: summary.value.outstandingBalance ?? summary.value.outstanding ?? '—', tone: 'amber' },
  { title: t('preschoolOperationsPage.pendingReceipts'), value: summary.value.pendingReceipts ?? summary.value.pending ?? '—', tone: 'blue' },
  { title: t('preschoolOperationsPage.completed'), value: summary.value.completed ?? summary.value.paid ?? '—', tone: 'emerald' },
]))

const overdue = computed(() => Array.isArray(props.payments.overdue) ? props.payments.overdue : [])
const outstanding = computed(() => Array.isArray(props.payments.outstanding) ? props.payments.outstanding : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.paymentOperations') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.overduePayments') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" :to="card.to" :details-label="card.to ? t('preschoolOperationsPage.viewDetails') : ''" />
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.overduePayments') }}</h3>
        <OperationsEmptyState v-if="overdue.length === 0" :title="t('preschoolOperationsPage.noData')" />
        <div v-else class="mt-4 space-y-3">
          <OperationsTimelineItem v-for="item in overdue" :key="item.id || item.invoiceId || item.createdAt" :item="item" />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.outstandingBalance') }}</h3>
        <OperationsEmptyState v-if="outstanding.length === 0" :title="t('preschoolOperationsPage.noData')" />
        <div v-else class="mt-4 space-y-3">
          <OperationsTimelineItem v-for="item in outstanding" :key="item.id || item.invoiceId || item.createdAt" :item="item" />
        </div>
      </div>
    </div>
  </section>
</template>
