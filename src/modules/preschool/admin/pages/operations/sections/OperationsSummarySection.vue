<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import { resolveOperationsRoute } from '../composables/useOperationsActions'

const props = defineProps({
  operations: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()

const cards = computed(() => {
  const today = props.operations.today || {}
  const guardian = props.operations.guardianCommunications || {}
  const payments = props.operations.payments || {}
  const assessments = props.operations.assessments || {}
  const risks = props.operations.risks || {}
  const notifications = props.operations.notifications || {}
  const automationTasks = props.operations.automationTasks || {}

  return [
    {
      title: t('preschoolOperationsPage.attendanceRate'),
      value: today.attendanceRate ?? props.operations.summary?.attendanceRate ?? '—',
      caption: t('preschoolOperationsPage.todayOverview'),
      tone: 'emerald',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-dashboard'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.todaySessions'),
      value: Array.isArray(today.todaySessions) ? today.todaySessions.length : (today.todaySessionsCount ?? '—'),
      caption: t('preschoolOperationsPage.todayOverview'),
      tone: 'blue',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-history'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.openAlerts'),
      value: today.openAlerts ?? props.operations.summary?.openAlerts ?? '—',
      caption: t('preschoolOperationsPage.attendanceMonitoring'),
      tone: 'rose',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-alerts'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.missingSessions'),
      value: today.missingSessions ?? props.operations.summary?.missingSessions ?? '—',
      caption: t('preschoolOperationsPage.todayOverview'),
      tone: 'amber',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-attendance-history'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.overduePayments'),
      value: payments.summary?.overdue ?? payments.overdue?.length ?? '—',
      caption: t('preschoolOperationsPage.paymentOperations'),
      tone: 'violet',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-payment'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.pendingAssessments'),
      value: assessments.summary?.pending ?? assessments.summary?.pendingReviews ?? assessments.rows?.length ?? '—',
      caption: t('preschoolOperationsPage.assessmentOperations'),
      tone: 'slate',
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.guardianFollowUps'),
      value: guardian.summary?.outstandingFollowUps ?? guardian.summary?.followUps ?? '—',
      caption: t('preschoolOperationsPage.guardianFollowUp'),
      tone: 'amber',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-guardian-communications'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.unreadNotifications'),
      value: notifications.summary?.unread ?? '—',
      caption: t('preschoolOperationsPage.notificationsCenter'),
      tone: 'rose',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-notifications'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.openAutomationTasks'),
      value: automationTasks.summary?.open ?? '—',
      caption: t('preschoolOperationsPage.notificationsCenter'),
      tone: 'blue',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-notifications'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.overdueAutomationTasks'),
      value: automationTasks.summary?.overdue ?? '—',
      caption: t('preschoolOperationsPage.notificationsCenter'),
      tone: 'amber',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-notifications'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.criticalNotifications'),
      value: notifications.summary?.critical ?? '—',
      caption: t('preschoolOperationsPage.notificationsCenter'),
      tone: 'rose',
      to: resolveOperationsRoute(router, 'dashboard-preschool-admin-notifications'),
      detailsLabel: t('preschoolOperationsPage.viewDetails'),
    },
    {
      title: t('preschoolOperationsPage.criticalRisks'),
      value: risks.healthAlerts ?? risks.openAttendanceAlerts ?? '—',
      caption: t('preschoolOperationsPage.operationalRisks'),
      tone: 'rose',
    },
  ]
})
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.operationalSummary') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.todayOverview') }}</p>
    </div>

    <OperationsEmptyState
      v-if="!cards.length"
      :title="t('preschoolOperationsPage.noData')"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :caption="card.caption"
        :tone="card.tone"
        :to="card.to"
        :details-label="card.detailsLabel"
      />
    </div>
  </section>
</template>
