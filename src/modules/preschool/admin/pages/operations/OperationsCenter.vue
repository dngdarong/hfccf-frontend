<script setup>
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useOperationsFilters } from './composables/useOperationsFilters'
import { useOperationsData } from './composables/useOperationsData'
import { useOperationsActions } from './composables/useOperationsActions'
import { useOperationsDateTime } from './composables/useOperationsDateTime'
import OperationsHeaderSection from './sections/OperationsHeaderSection.vue'
import OperationsFilterBar from './components/OperationsFilterBar.vue'
import OperationsSummarySection from './sections/OperationsSummarySection.vue'
import TodaySessionsSection from './sections/TodaySessionsSection.vue'
import AttendanceOperationsSection from './sections/AttendanceOperationsSection.vue'
import GuardianOperationsSection from './sections/GuardianOperationsSection.vue'
import HealthOperationsSection from './sections/HealthOperationsSection.vue'
import PaymentOperationsSection from './sections/PaymentOperationsSection.vue'
import TeacherOperationsSection from './sections/TeacherOperationsSection.vue'
import OperationalRisksSection from './sections/OperationalRisksSection.vue'
import OperationsTimelineSection from './sections/OperationsTimelineSection.vue'
import OperationsQuickActionsSection from './sections/OperationsQuickActionsSection.vue'
import WorkflowVisibilitySection from './sections/WorkflowVisibilitySection.vue'

defineOptions({
  name: 'PreschoolOperationsCenterPage',
})

const { t } = useLanguage()
const { formatDateTime } = useOperationsDateTime()
const { filters, resetFilters, cloneFilters } = useOperationsFilters()
const { loading, errorMessage, operations, loadOperations } = useOperationsData()
const { resolveQuickAction, resolveSessionAction } = useOperationsActions()

const operationsTitle = computed(() => t('preschoolOperationsPage.title'))
const operationsSubtitle = computed(() => t('preschoolOperationsPage.subtitle'))
const generatedAtLabel = computed(() => (
  operations.value.generatedAt
    ? `${t('preschoolOperationsPage.generatedAt')}: ${formatDateTime(operations.value.generatedAt)}`
    : ''
))

async function refreshOperations() {
  await loadOperations(cloneFilters())
}

async function applyFilters() {
  await refreshOperations()
}

async function resetAndRefresh() {
  resetFilters()
  await refreshOperations()
}

onMounted(refreshOperations)
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <OperationsHeaderSection
        :title="operationsTitle"
        :subtitle="operationsSubtitle"
        :generated-at="generatedAtLabel"
        :loading="loading"
        :refresh-label="t('preschoolOperationsPage.refresh')"
        @refresh="refreshOperations"
      />

      <OperationsFilterBar
        v-model="filters"
        :loading="loading"
        :labels="{
          title: t('preschoolOperationsPage.filters.title'),
          subtitle: t('preschoolOperationsPage.filters.subtitle'),
          dateFrom: t('preschoolOperationsPage.filters.dateFrom'),
          dateTo: t('preschoolOperationsPage.filters.dateTo'),
          class: t('preschoolOperationsPage.filters.class'),
          teacher: t('preschoolOperationsPage.filters.teacher'),
          status: t('preschoolOperationsPage.filters.status'),
          apply: t('preschoolOperationsPage.filters.apply'),
          reset: t('preschoolOperationsPage.filters.reset'),
        }"
        @apply="applyFilters"
        @reset="resetAndRefresh"
      />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
        data-testid="operations-loading"
      >
        {{ t('preschoolOperationsPage.loading') }}
      </div>

      <OperationsSummarySection :operations="operations" />
      <WorkflowVisibilitySection :workflows="operations.workflows" />
      <TodaySessionsSection
        :today="operations.today"
        :resolve-session-action="resolveSessionAction"
      />
      <AttendanceOperationsSection :attendance="operations.attendance" :alerts="operations.alerts" />
      <GuardianOperationsSection :guardian-communications="operations.guardianCommunications" />
      <HealthOperationsSection :health="operations.health" />
      <PaymentOperationsSection :payments="operations.payments" />
      <TeacherOperationsSection :teachers="operations.teachers" />
      <OperationalRisksSection :risks="operations.risks" />
      <OperationsTimelineSection :timeline="operations.timeline" />
      <OperationsQuickActionsSection
        :quick-actions="operations.quickActions"
        :resolve-quick-action="resolveQuickAction"
      />
    </section>
  </MainLayout>
</template>
