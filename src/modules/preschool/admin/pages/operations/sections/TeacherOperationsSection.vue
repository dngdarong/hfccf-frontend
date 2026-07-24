<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  teachers: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()

const summary = computed(() => props.teachers.summary || {})
const cards = computed(() => ([
  { title: t('preschoolOperationsPage.assignedClasses'), value: summary.value.assignedClasses ?? '—', tone: 'slate', to: resolveOperationsRoute(router, 'dashboard-preschool-admin-users') },
  { title: t('preschoolOperationsPage.students'), value: summary.value.students ?? '—', tone: 'blue' },
  { title: t('preschoolOperationsPage.attendanceSessions'), value: summary.value.attendanceSessions ?? '—', tone: 'emerald' },
  { title: t('preschoolOperationsPage.completedSessions'), value: summary.value.completedSessions ?? '—', tone: 'violet' },
  { title: t('preschoolOperationsPage.todayWorkload'), value: summary.value.todayWorkload ?? '—', tone: 'amber' },
  { title: t('preschoolOperationsPage.pendingAttendance'), value: summary.value.pendingAttendance ?? summary.value.alertCount ?? '—', tone: 'rose' },
]))

const rows = computed(() => Array.isArray(props.teachers.breakdowns?.byTeacher) ? props.teachers.breakdowns.byTeacher : Array.isArray(props.teachers.rows) ? props.teachers.rows : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.teacherOperations') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.todaySessions') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <OperationsMetricCard v-for="card in cards" :key="card.title" :title="card.title" :value="card.value" :tone="card.tone" :to="card.to" :details-label="card.to ? t('preschoolOperationsPage.viewDetails') : ''" />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolOperationsPage.viewDetails') }}</h3>
      <OperationsEmptyState v-if="rows.length === 0" :title="t('preschoolOperationsPage.noData')" />
      <div v-else class="mt-4 space-y-3">
        <OperationsTimelineItem v-for="item in rows" :key="item.id || item.teacherUserId || item.createdAt" :item="item" />
      </div>
    </div>
  </section>
</template>
