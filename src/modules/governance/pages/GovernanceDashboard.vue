<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchGovernanceDashboard } from '@/modules/governance/services/api/governanceApi'
import GovernanceSummaryCards from '@/modules/governance/components/GovernanceSummaryCards.vue'
import AuditTimeline from '@/modules/governance/components/AuditTimeline.vue'
import SecurityEventsTable from '@/modules/governance/components/SecurityEventsTable.vue'
import RiskHeatMap from '@/modules/governance/components/RiskHeatMap.vue'
import ConfigurationDiffViewer from '@/modules/governance/components/ConfigurationDiffViewer.vue'

defineOptions({
  name: 'GovernanceDashboardPage',
})

const { t } = useLanguage()
const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const dashboard = ref(createEmptyDashboard())

const summaryCards = computed(() => [
  {
    id: 'security-failures',
    eyebrow: t('governance.dashboard.cards.security.eyebrow'),
    title: t('governance.dashboard.cards.security.title'),
    value: dashboard.value.securitySummary.failedLoginsToday,
    description: t('governance.dashboard.cards.security.description'),
    statusLabel: t('governance.statuses.watch'),
    statusClass: 'bg-amber-100 text-amber-700',
    trend: `${dashboard.value.securitySummary.activeSecurityEvents} active events`,
    actionLabel: t('governance.dashboard.cards.security.action'),
  },
  {
    id: 'audit-activity',
    eyebrow: t('governance.dashboard.cards.audit.eyebrow'),
    title: t('governance.dashboard.cards.audit.title'),
    value: dashboard.value.auditSummary.auditEventsToday,
    description: t('governance.dashboard.cards.audit.description'),
    statusLabel: t('governance.statuses.stable'),
    statusClass: 'bg-emerald-100 text-emerald-700',
    trend: `${dashboard.value.auditSummary.auditEventsThisMonth} this month`,
    actionLabel: t('governance.dashboard.cards.audit.action'),
  },
  {
    id: 'risk',
    eyebrow: t('governance.dashboard.cards.risk.eyebrow'),
    title: t('governance.dashboard.cards.risk.title'),
    value: dashboard.value.riskSummary.criticalEvents,
    description: t('governance.dashboard.cards.risk.description'),
    statusLabel: t('governance.statuses.critical'),
    statusClass: 'bg-rose-100 text-rose-700',
    trend: `${dashboard.value.riskSummary.atRiskStudents} at-risk students`,
    actionLabel: t('governance.dashboard.cards.risk.action'),
  },
  {
    id: 'configuration',
    eyebrow: t('governance.dashboard.cards.configuration.eyebrow'),
    title: t('governance.dashboard.cards.configuration.title'),
    value: dashboard.value.configurationSummary.changesToday,
    description: t('governance.dashboard.cards.configuration.description'),
    statusLabel: t('governance.statuses.info'),
    statusClass: 'bg-sky-100 text-sky-700',
    trend: dashboard.value.configurationSummary.lastConfigurationUpdate || t('governance.emptyStates.noUpdates'),
    actionLabel: t('governance.dashboard.cards.configuration.action'),
  },
])

const riskCards = computed(() => [
  {
    id: 'students',
    label: t('governance.dashboard.risk.students'),
    value: dashboard.value.riskSummary.atRiskStudents,
    description: t('governance.dashboard.risk.studentsDescription'),
    statusClass: 'border-rose-200 bg-rose-50 text-rose-900',
  },
  {
    id: 'payments',
    label: t('governance.dashboard.risk.payments'),
    value: dashboard.value.riskSummary.overduePayments,
    description: t('governance.dashboard.risk.paymentsDescription'),
    statusClass: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  {
    id: 'health',
    label: t('governance.dashboard.risk.health'),
    value: dashboard.value.riskSummary.openHealthAlerts,
    description: t('governance.dashboard.risk.healthDescription'),
    statusClass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  {
    id: 'guardians',
    label: t('governance.dashboard.risk.guardians'),
    value: dashboard.value.riskSummary.openGuardianIssues,
    description: t('governance.dashboard.risk.guardiansDescription'),
    statusClass: 'border-sky-200 bg-sky-50 text-sky-900',
  },
])

function createEmptyDashboard() {
  return {
    securitySummary: {
      failedLoginsToday: 0,
      passwordResets: 0,
      activeSecurityEvents: 0,
      criticalEvents: 0,
      recentEvents: [],
    },
    auditSummary: {
      auditEventsToday: 0,
      auditEventsThisMonth: 0,
      topModules: [],
      recentEvents: [],
    },
    riskSummary: {
      atRiskStudents: 0,
      overduePayments: 0,
      openHealthAlerts: 0,
      openGuardianIssues: 0,
    },
    configurationSummary: {
      changesToday: 0,
      changesThisMonth: 0,
      lastConfigurationUpdate: '',
      recentChanges: [],
    },
  }
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''

  try {
    dashboard.value = await fetchGovernanceDashboard()
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
    dashboard.value = createEmptyDashboard()
  } finally {
    loading.value = false
  }
}

function goTo(routeName) {
  router.push({ name: routeName })
}

function handleSummaryAction(card) {
  if (card.id === 'security-failures') goTo('governance-security-monitoring')
  if (card.id === 'audit-activity') goTo('governance-audit-logs')
  if (card.id === 'risk') goTo('governance-risk-management')
  if (card.id === 'configuration') goTo('governance-configuration-history')
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('governance.pageTitle')"
        :subtitle="t('governance.dashboard.pageSubtitle')"
      />

      <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="index in 4" :key="index" class="rounded-2xl border border-slate-200 bg-white p-6">
          <div class="h-3 w-28 animate-pulse rounded bg-slate-100" />
          <div class="mt-4 h-8 w-20 animate-pulse rounded bg-slate-100" />
          <div class="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div v-else class="space-y-6">
        <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <GovernanceSummaryCards
          :title="t('governance.dashboard.summaryTitle')"
        :subtitle="t('governance.dashboard.summarySubtitle')"
        :cards="summaryCards"
        @action="handleSummaryAction"
        />

        <div class="grid gap-6 xl:grid-cols-2">
          <AuditTimeline
            :title="t('governance.dashboard.sections.auditTimeline')"
            :items="dashboard.auditSummary.recentEvents"
            :empty-label="t('governance.emptyStates.auditTimeline')"
          />
          <SecurityEventsTable
            :title="t('governance.dashboard.sections.securityEvents')"
            :items="dashboard.securitySummary.recentEvents"
            :empty-label="t('governance.emptyStates.securityEvents')"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <RiskHeatMap
            :title="t('governance.dashboard.sections.riskOverview')"
            :items="riskCards"
            :empty-label="t('governance.emptyStates.risk')"
          />
          <ConfigurationDiffViewer
            :title="t('governance.dashboard.sections.configurationChanges')"
            :before-state="dashboard.configurationSummary.previousConfiguration"
            :after-state="dashboard.configurationSummary.latestConfiguration"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <Button :label="t('governance.dashboard.actions.auditLogs')" variant="outline" @click="goTo('governance-audit-logs')" />
          <Button :label="t('governance.dashboard.actions.security')" variant="outline" @click="goTo('governance-security-monitoring')" />
          <Button :label="t('governance.dashboard.actions.configuration')" variant="outline" @click="goTo('governance-configuration-history')" />
          <Button :label="t('governance.dashboard.actions.risk')" variant="outline" @click="goTo('governance-risk-management')" />
          <Button :label="t('governance.dashboard.actions.investigations')" variant="outline" @click="goTo('governance-investigations')" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
