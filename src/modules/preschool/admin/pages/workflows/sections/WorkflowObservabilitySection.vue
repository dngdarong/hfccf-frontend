<script setup>
import { computed } from 'vue'
import WorkflowMetricCard from '../components/WorkflowMetricCard.vue'

const props = defineProps({
  dashboard: {
    type: Object,
    default: null,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  canOpenRun: {
    type: Function,
    default: () => false,
  },
  openRun: {
    type: Function,
    default: () => {},
  },
})

function formatCount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : '0'
}

function formatDuration(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    return '—'
  }

  if (number < 1000) {
    return `${Math.round(number)} ms`
  }

  const seconds = number / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return `${minutes.toFixed(2)} m`
  }

  return `${(minutes / 60).toFixed(2)} h`
}

function formatThroughput(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? `${number.toFixed(2)} / s` : '—'
}

function formatDateTime(value) {
  return String(value || '').trim() || '—'
}

function formatFailureCategory(category) {
  const key = String(category || '').trim()
  if (!key) {
    return 'unknown'
  }

  const labelKey = {
    validation_error: props.labels.validationError || 'validation_error',
    source_missing: props.labels.sourceMissing || 'source_missing',
    definition_missing: props.labels.definitionMissing || 'definition_missing',
    database_error: props.labels.databaseError || 'database_error',
    permission_error: props.labels.permissionError || 'permission_error',
    unexpected_error: props.labels.unexpectedError || 'unexpected_error',
    unknown: props.labels.unknown || 'unknown',
  }[key]

  return labelKey || key
}

function healthTone(status) {
  const key = String(status || '').toLowerCase()
  return {
    healthy: 'workflow-observability-section__status--healthy',
    warning: 'workflow-observability-section__status--warning',
    critical: 'workflow-observability-section__status--critical',
  }[key] || 'workflow-observability-section__status--neutral'
}

function runTone(status) {
  const key = String(status || '').toLowerCase()
  return {
    completed: 'workflow-observability-section__status--healthy',
    completed_with_errors: 'workflow-observability-section__status--warning',
    failed: 'workflow-observability-section__status--critical',
    running: 'workflow-observability-section__status--warning',
    pending: 'workflow-observability-section__status--neutral',
    cancelled: 'workflow-observability-section__status--neutral',
  }[key] || 'workflow-observability-section__status--neutral'
}

const summaryCards = computed(() => {
  const summary = props.dashboard?.summary || {}

  return [
    { title: props.labels.successfulRuns || 'Successful Runs', value: summary.successfulRuns ?? 0, tone: 'emerald' },
    { title: props.labels.runsWithErrors || 'Runs with Errors', value: summary.runsWithErrors ?? 0, tone: 'amber' },
    { title: props.labels.failedRuns || 'Failed Runs', value: summary.failedRuns ?? 0, tone: 'rose' },
    { title: props.labels.runningRuns || 'Running Runs', value: summary.runningRuns ?? 0, tone: 'blue' },
    { title: props.labels.staleRuns || 'Stale Runs', value: summary.staleRuns ?? 0, tone: 'amber' },
  ]
})

const processingCards = computed(() => {
  const summary = props.dashboard?.summary || {}

  return [
    { title: props.labels.processed || 'Processed', value: summary.totalProcessed ?? 0, tone: 'blue' },
    { title: props.labels.created || 'Created', value: summary.totalCreated ?? 0, tone: 'emerald' },
    { title: props.labels.existing || 'Existing', value: summary.totalExisting ?? 0, tone: 'slate' },
    { title: props.labels.skipped || 'Skipped', value: summary.totalSkipped ?? 0, tone: 'amber' },
    { title: props.labels.failedItems || 'Failed Items', value: summary.totalFailedItems ?? 0, tone: 'rose' },
  ]
})

const performanceCards = computed(() => {
  const performance = props.dashboard?.performance || {}
  const summary = props.dashboard?.summary || {}

  return [
    { title: props.labels.averageDuration || 'Average Duration', value: formatDuration(performance.averageDurationMs ?? summary.averageDurationMs), tone: 'blue' },
    { title: props.labels.longestDuration || 'Longest Duration', value: formatDuration(performance.longestDurationMs ?? summary.longestDurationMs), tone: 'amber' },
    { title: props.labels.averageItemsPerRun || 'Average Items per Run', value: Number(summary.averageItemsPerRun ?? 0).toFixed(2), tone: 'emerald' },
    { title: props.labels.throughput || 'Throughput', value: formatThroughput((performance.throughputTrend || []).reduce((total, item) => total + Number(item.throughputItemsPerSecond || 0), 0) / Math.max((performance.throughputTrend || []).length || 1, 1)), tone: 'slate' },
  ]
})

const failureCategoryRows = computed(() => props.dashboard?.breakdowns?.byFailureCategory || [])
const definitionRows = computed(() => props.dashboard?.breakdowns?.byDefinition || [])
const sourceTypeRows = computed(() => props.dashboard?.breakdowns?.bySourceType || [])
const statusRows = computed(() => props.dashboard?.breakdowns?.byRunStatus || [])
const actorRows = computed(() => props.dashboard?.breakdowns?.byActor || [])
const staleRuns = computed(() => props.dashboard?.health?.staleRuns || [])
const recentFailures = computed(() => props.dashboard?.recentActivity?.recentFailures || [])
const recentRuns = computed(() => props.dashboard?.recentActivity?.recentRuns || [])
const recentlyCompletedRuns = computed(() => props.dashboard?.recentActivity?.recentlyCompletedRuns || [])
</script>

<template>
  <section class="workflow-observability-section">
    <div class="workflow-observability-section__header">
      <div>
        <div class="workflow-observability-section__eyebrow">{{ labels.workflowObservability || 'Workflow Observability' }}</div>
        <h2 class="workflow-observability-section__title">{{ labels.syncHealth || 'Sync Health' }}</h2>
      </div>
      <div class="workflow-observability-section__generated">
        {{ dashboard?.generatedAt || '—' }}
      </div>
    </div>

    <div
      v-if="!dashboard"
      class="workflow-observability-section__empty"
    >
      {{ labels.noObservabilityData || 'No observability data is available.' }}
    </div>

    <template v-else>
      <div class="workflow-observability-section__summary">
        <WorkflowMetricCard
          v-for="card in summaryCards"
          :key="card.title"
          :title="card.title"
          :value="formatCount(card.value)"
          :tone="card.tone"
        />
      </div>

      <div class="workflow-observability-section__summary">
        <WorkflowMetricCard
          v-for="card in processingCards"
          :key="card.title"
          :title="card.title"
          :value="formatCount(card.value)"
          :tone="card.tone"
        />
      </div>

      <div class="workflow-observability-section__summary workflow-observability-section__summary--compact">
        <WorkflowMetricCard
          v-for="card in performanceCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :tone="card.tone"
        />
      </div>

      <div class="workflow-observability-section__grid">
        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.failureAnalysis || 'Failure Analysis' }}</h3>
          </div>

          <div
            v-if="failureCategoryRows.length > 0"
            class="workflow-observability-section__table"
          >
            <div class="workflow-observability-section__table-head workflow-observability-section__table-head--failure">
              <span>{{ labels.failureCategory || 'Failure Category' }}</span>
              <span>{{ labels.totalFailures || 'Total Failures' }}</span>
              <span>{{ labels.runFailures || 'Run Failures' }}</span>
              <span>{{ labels.itemFailures || 'Item Failures' }}</span>
            </div>

            <div
              v-for="row in failureCategoryRows"
              :key="row.failureCategory"
              class="workflow-observability-section__table-row workflow-observability-section__table-row--failure"
            >
              <span>{{ formatFailureCategory(row.failureCategory) }}</span>
              <span>{{ formatCount(row.totalFailures) }}</span>
              <span>{{ formatCount(row.runFailures) }}</span>
              <span>{{ formatCount(row.itemFailures) }}</span>
            </div>
          </div>

          <div
            v-else
            class="workflow-observability-section__empty workflow-observability-section__empty--inline"
          >
            {{ labels.noFailures || 'No failures captured yet.' }}
          </div>
        </article>

        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.runTrends || 'Run Trends' }}</h3>
          </div>

          <div class="workflow-observability-section__trend-list">
            <div
              v-for="row in props.dashboard?.trends?.runsOverTime || []"
              :key="`runs-${row.date}`"
              class="workflow-observability-section__trend-row"
            >
              <span>{{ row.date }}</span>
              <strong>{{ formatCount(row.totalRuns) }}</strong>
              <span>{{ formatCount(row.failedRuns) }} {{ labels.failedRuns || 'Failed Runs' }}</span>
            </div>
          </div>
        </article>
      </div>

      <div class="workflow-observability-section__grid">
        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.staleRuns || 'Stale Runs' }}</h3>
            <span class="workflow-observability-section__panel-subtitle">{{ labels.investigationRequired || 'Investigation required' }}</span>
          </div>

          <div
            v-if="staleRuns.length > 0"
            class="workflow-observability-section__table"
          >
            <div class="workflow-observability-section__table-head workflow-observability-section__table-head--stale">
              <span>{{ labels.run || 'Run' }}</span>
              <span>{{ labels.definition || 'Definition' }}</span>
              <span>{{ labels.sourceType || 'Source Type' }}</span>
              <span>{{ labels.startedBy || 'Started By' }}</span>
              <span>{{ labels.startedAt || 'Started At' }}</span>
              <span>{{ labels.age || 'Age' }}</span>
              <span />
            </div>

            <div
              v-for="run in staleRuns"
              :key="`stale-${run.run?.id || run.id}`"
              class="workflow-observability-section__table-row workflow-observability-section__table-row--stale"
            >
              <span>
                <span :class="['workflow-observability-section__status', healthTone(props.dashboard?.health?.status)]">
                  {{ run.staleReason || labels.investigationRequired || 'Investigation required' }}
                </span>
              </span>
              <span>{{ run.run?.definitionName || run.run?.definitionKey || run.definitionName || run.definitionKey || '—' }}</span>
              <span>{{ run.run?.sourceType || run.sourceType || '—' }}</span>
              <span>{{ run.run?.startedBy?.name || run.run?.startedByUserId || run.startedBy?.name || run.startedByUserId || '—' }}</span>
              <span>{{ formatDateTime(run.run?.startedAt || run.startedAt) }}</span>
              <span>{{ formatDuration(run.ageMs) }}</span>
              <span>
                <button
                  v-if="canOpenRun(run.run || run)"
                  type="button"
                  class="workflow-observability-section__button"
                  @click="openRun(run.run || run)"
                >
                  {{ labels.viewRun || 'View Run' }}
                </button>
              </span>
            </div>
          </div>

          <div
            v-else
            class="workflow-observability-section__empty workflow-observability-section__empty--inline"
          >
            {{ labels.noStaleRuns || 'No stale runs detected.' }}
          </div>
        </article>

        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.recentOperationalActivity || 'Recent Operational Activity' }}</h3>
          </div>

          <div class="workflow-observability-section__activity">
            <div class="workflow-observability-section__activity-block">
              <h4>{{ labels.recentRuns || 'Recent Runs' }}</h4>
              <div
                v-for="run in recentRuns"
                :key="`recent-${run.id}`"
                class="workflow-observability-section__activity-row"
              >
                <span>{{ run.definitionName || run.definitionKey || '—' }}</span>
                <span :class="['workflow-observability-section__status', runTone(run.status)]">{{ run.status }}</span>
              </div>
              <div
                v-if="recentRuns.length === 0"
                class="workflow-observability-section__empty workflow-observability-section__empty--inline"
              >
                {{ labels.noRecentRuns || 'No recent runs.' }}
              </div>
            </div>

            <div class="workflow-observability-section__activity-block">
              <h4>{{ labels.recentFailures || 'Recent Failures' }}</h4>
              <div
                v-for="failure in recentFailures"
                :key="failure.id"
                class="workflow-observability-section__activity-row"
              >
                <span>{{ formatFailureCategory(failure.failureCategory) }}</span>
                <span>{{ failure.definitionKey || failure.sourceType || '—' }}</span>
              </div>
              <div
                v-if="recentFailures.length === 0"
                class="workflow-observability-section__empty workflow-observability-section__empty--inline"
              >
                {{ labels.noRecentFailures || 'No recent failures.' }}
              </div>
            </div>

            <div class="workflow-observability-section__activity-block">
              <h4>{{ labels.recentlyCompletedRuns || 'Recently Completed Runs' }}</h4>
              <div
                v-for="run in recentlyCompletedRuns"
                :key="`completed-${run.id}`"
                class="workflow-observability-section__activity-row"
              >
                <span>{{ run.definitionName || run.definitionKey || '—' }}</span>
                <span :class="['workflow-observability-section__status', runTone(run.status)]">{{ run.status }}</span>
              </div>
              <div
                v-if="recentlyCompletedRuns.length === 0"
                class="workflow-observability-section__empty workflow-observability-section__empty--inline"
              >
                {{ labels.noRecentCompletedRuns || 'No recently completed runs.' }}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="workflow-observability-section__grid">
        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.definitionBreakdown || 'By Definition' }}</h3>
          </div>
          <div class="workflow-observability-section__table">
            <div class="workflow-observability-section__table-head">
              <span>{{ labels.definition || 'Definition' }}</span>
              <span>{{ labels.totalRuns || 'Total Runs' }}</span>
              <span>{{ labels.failedRuns || 'Failed Runs' }}</span>
              <span>{{ labels.averageDuration || 'Average Duration' }}</span>
            </div>
            <div
              v-for="row in definitionRows"
              :key="`definition-${row.definitionKey || 'unknown'}`"
              class="workflow-observability-section__table-row"
            >
              <span>{{ row.definitionName || row.definitionKey || '—' }}</span>
              <span>{{ formatCount(row.totalRuns) }}</span>
              <span>{{ formatCount(row.failedRuns) }}</span>
              <span>{{ formatDuration(row.averageDurationMs) }}</span>
            </div>
          </div>
        </article>

        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.sourceTypeBreakdown || 'By Source Type' }}</h3>
          </div>
          <div class="workflow-observability-section__table">
            <div class="workflow-observability-section__table-head">
              <span>{{ labels.sourceType || 'Source Type' }}</span>
              <span>{{ labels.totalRuns || 'Total Runs' }}</span>
              <span>{{ labels.failedRuns || 'Failed Runs' }}</span>
              <span>{{ labels.staleRuns || 'Stale Runs' }}</span>
            </div>
            <div
              v-for="row in sourceTypeRows"
              :key="`source-${row.sourceType || 'unknown'}`"
              class="workflow-observability-section__table-row"
            >
              <span>{{ row.sourceLabel || row.sourceType || '—' }}</span>
              <span>{{ formatCount(row.totalRuns) }}</span>
              <span>{{ formatCount(row.failedRuns) }}</span>
              <span>{{ formatCount(row.staleRuns) }}</span>
            </div>
          </div>
        </article>
      </div>

      <div class="workflow-observability-section__grid">
        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.runStatusBreakdown || 'By Run Status' }}</h3>
          </div>
          <div class="workflow-observability-section__table">
            <div class="workflow-observability-section__table-head">
              <span>{{ labels.status || 'Status' }}</span>
              <span>{{ labels.totalRuns || 'Total Runs' }}</span>
            </div>
            <div
              v-for="row in statusRows"
              :key="`status-${row.status}`"
              class="workflow-observability-section__table-row"
            >
              <span>{{ row.status }}</span>
              <span>{{ formatCount(row.totalRuns) }}</span>
            </div>
          </div>
        </article>

        <article class="workflow-observability-section__panel">
          <div class="workflow-observability-section__panel-header">
            <h3>{{ labels.actorBreakdown || 'By Actor' }}</h3>
          </div>
          <div class="workflow-observability-section__table">
            <div class="workflow-observability-section__table-head">
              <span>{{ labels.startedBy || 'Started By' }}</span>
              <span>{{ labels.totalRuns || 'Total Runs' }}</span>
              <span>{{ labels.failedRuns || 'Failed Runs' }}</span>
            </div>
            <div
              v-for="row in actorRows"
              :key="`actor-${row.startedByUserId || 'unknown'}`"
              class="workflow-observability-section__table-row"
            >
              <span>{{ row.startedBy?.name || row.startedByUserId || '—' }}</span>
              <span>{{ formatCount(row.totalRuns) }}</span>
              <span>{{ formatCount(row.failedRuns) }}</span>
            </div>
          </div>
        </article>
      </div>

      <article class="workflow-observability-section__panel">
        <div class="workflow-observability-section__panel-header">
          <h3>{{ labels.governance || 'Governance' }}</h3>
        </div>

        <div class="workflow-observability-section__governance">
          <div>
            <span>{{ labels.oldestAuditRecord || 'Oldest Audit Record' }}</span>
            <strong>{{ formatDateTime(props.dashboard?.governance?.oldestRunAt) }}</strong>
          </div>
          <div>
            <span>{{ labels.totalRunRecords || 'Run Records' }}</span>
            <strong>{{ formatCount(props.dashboard?.governance?.totalRunRecords) }}</strong>
          </div>
          <div>
            <span>{{ labels.totalItemRecords || 'Item Records' }}</span>
            <strong>{{ formatCount(props.dashboard?.governance?.totalItemRecords) }}</strong>
          </div>
          <div>
            <span>{{ labels.retentionMode || 'Retention Mode' }}</span>
            <strong>{{ props.dashboard?.governance?.retentionMode || 'policy_only' }}</strong>
          </div>
          <div>
            <span>{{ labels.automaticPruningDisabled || 'Automatic pruning disabled' }}</span>
            <strong>{{ props.dashboard?.governance?.automaticPruningEnabled ? 'No' : 'Yes' }}</strong>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>
.workflow-observability-section {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #d8e1ec;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.97)),
    linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(15, 118, 110, 0.04));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.workflow-observability-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workflow-observability-section__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.workflow-observability-section__title {
  margin: 0.15rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-observability-section__generated {
  font-size: 0.82rem;
  color: #64748b;
}

.workflow-observability-section__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-observability-section__summary--compact {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.workflow-observability-section__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.workflow-observability-section__panel {
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.workflow-observability-section__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.workflow-observability-section__panel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.workflow-observability-section__panel-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}

.workflow-observability-section__table,
.workflow-observability-section__trend-list,
.workflow-observability-section__activity,
.workflow-observability-section__governance {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.workflow-observability-section__table-head,
.workflow-observability-section__table-row,
.workflow-observability-section__trend-row,
.workflow-observability-section__activity-row {
  display: grid;
  gap: 0.6rem;
  align-items: center;
}

.workflow-observability-section__table-head {
  grid-template-columns: 1.4fr repeat(3, 0.7fr);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.workflow-observability-section__table-head--stale {
  grid-template-columns: 1.2fr 1fr 0.9fr 1fr 0.9fr 0.7fr 0.7fr;
}

.workflow-observability-section__table-head--failure {
  grid-template-columns: 1.2fr repeat(3, 0.7fr);
}

.workflow-observability-section__table-row {
  grid-template-columns: 1.4fr repeat(3, 0.7fr);
  padding: 0.7rem 0.85rem;
  border-radius: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-observability-section__table-row--stale {
  grid-template-columns: 1.2fr 1fr 0.9fr 1fr 0.9fr 0.7fr 0.7fr;
}

.workflow-observability-section__table-row--failure {
  grid-template-columns: 1.2fr repeat(3, 0.7fr);
}

.workflow-observability-section__trend-row {
  grid-template-columns: 1fr 0.7fr 1fr;
  padding: 0.7rem 0.85rem;
  border-radius: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-observability-section__activity {
  gap: 0.75rem;
}

.workflow-observability-section__activity-block h4 {
  margin: 0 0 0.45rem;
  font-size: 0.84rem;
  color: #0f172a;
}

.workflow-observability-section__activity-row {
  grid-template-columns: 1fr auto;
  padding: 0.7rem 0.85rem;
  border-radius: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-observability-section__governance {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.workflow-observability-section__governance > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.8rem 0.85rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.workflow-observability-section__governance span {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.workflow-observability-section__governance strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.workflow-observability-section__status {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: capitalize;
}

.workflow-observability-section__status--healthy {
  color: #047857;
  background: #dcfce7;
}

.workflow-observability-section__status--warning {
  color: #b45309;
  background: #fef3c7;
}

.workflow-observability-section__status--critical {
  color: #b91c1c;
  background: #fee2e2;
}

.workflow-observability-section__status--neutral {
  color: #334155;
  background: #e2e8f0;
}

.workflow-observability-section__button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  font-weight: 700;
}

.workflow-observability-section__empty {
  padding: 0.95rem 1rem;
  border-radius: 0.9rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.workflow-observability-section__empty--inline {
  margin-top: 0.25rem;
}

@media (max-width: 1100px) {
  .workflow-observability-section__summary,
  .workflow-observability-section__summary--compact,
  .workflow-observability-section__grid,
  .workflow-observability-section__governance {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .workflow-observability-section__table-head,
  .workflow-observability-section__table-row,
  .workflow-observability-section__table-head--stale,
  .workflow-observability-section__table-row--stale,
  .workflow-observability-section__table-head--failure,
  .workflow-observability-section__table-row--failure,
  .workflow-observability-section__trend-row,
  .workflow-observability-section__activity-row {
    grid-template-columns: 1fr;
  }
}
</style>
