<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/store/userStore'
import { useWorkflowData } from './composables/useWorkflowData'
import { useWorkflowFilters } from './composables/useWorkflowFilters'
import WorkflowHeaderSection from './sections/WorkflowHeaderSection.vue'
import WorkflowSummarySection from './sections/WorkflowSummarySection.vue'
import PendingApprovalsSection from './sections/PendingApprovalsSection.vue'
import WorkflowQueueSection from './sections/WorkflowQueueSection.vue'
import OverdueWorkflowsSection from './sections/OverdueWorkflowsSection.vue'
import MyAssignmentsSection from './sections/MyAssignmentsSection.vue'
import RecentlyUpdatedWorkflowsSection from './sections/RecentlyUpdatedWorkflowsSection.vue'
import WorkflowTimelinePreviewSection from './sections/WorkflowTimelinePreviewSection.vue'
import WorkflowObservabilitySection from './sections/WorkflowObservabilitySection.vue'
import { useWorkflowActions } from './composables/useWorkflowActions'
import {
  fetchPreschoolWorkflowSyncPreview,
  fetchPreschoolWorkflowObservabilityDashboard,
  fetchPreschoolWorkflowSyncRuns,
  runPreschoolWorkflowSync,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

defineOptions({
  name: 'PreschoolWorkflowApprovalCenter',
})

const router = useRouter()
const { t } = useLanguage()
const userStore = useUserStore()
const { cloneFilters } = useWorkflowFilters()
const {
  loading,
  errorMessage,
  summary,
  workflows,
  definitions,
  approvals,
  overdueWorkflows,
  myAssignments,
  recentlyUpdatedWorkflows,
  recentTimelineEvents,
  generatedAt,
  loadWorkflows,
} = useWorkflowData()
const {
  approveApproval,
  rejectApproval,
  returnApproval,
  cancelApproval,
} = useWorkflowActions()

const labels = computed(() => ({
  title: t('preschoolWorkflowsPage.title'),
  subtitle: t('preschoolWorkflowsPage.subtitle'),
  refresh: t('preschoolWorkflowsPage.refresh'),
  generatedAt: t('preschoolWorkflowsPage.generatedAt'),
  totalWorkflows: t('preschoolWorkflowsPage.summary.totalWorkflows'),
  pendingApprovals: t('preschoolWorkflowsPage.summary.pendingApprovals'),
  overdueWorkflows: t('preschoolWorkflowsPage.summary.overdueWorkflows'),
  escalatedWorkflows: t('preschoolWorkflowsPage.summary.escalatedWorkflows'),
  myAssignments: t('preschoolWorkflowsPage.summary.myAssignments'),
  completedRecently: t('preschoolWorkflowsPage.summary.completedRecently'),
  workflowQueue: t('preschoolWorkflowsPage.workflowQueue'),
  approvalQueue: t('preschoolWorkflowsPage.approvalQueue'),
  pendingApprovalsSection: t('preschoolWorkflowsPage.pendingApprovals'),
  overdueWorkflowsSection: t('preschoolWorkflowsPage.overdueWorkflows'),
  recentlyUpdated: t('preschoolWorkflowsPage.recentlyUpdated'),
  timeline: t('preschoolWorkflowsPage.timeline'),
  currentStep: t('preschoolWorkflowsPage.currentStep'),
  sourceEntity: t('preschoolWorkflowsPage.sourceEntity'),
  workflowSource: t('preschoolWorkflowsPage.workflowSource'),
  sourceUnavailable: t('preschoolWorkflowsPage.sourceUnavailable'),
  assignee: t('preschoolWorkflowsPage.assignee'),
  dueDate: t('preschoolWorkflowsPage.dueDate'),
  sla: t('preschoolWorkflowsPage.sla'),
  viewWorkflow: t('preschoolWorkflowsPage.viewWorkflow'),
  viewSource: t('preschoolWorkflowsPage.viewSource'),
  approve: t('preschoolWorkflowsPage.approve'),
  reject: t('preschoolWorkflowsPage.reject'),
  return: t('preschoolWorkflowsPage.return'),
  assign: t('preschoolWorkflowsPage.assign'),
  transition: t('preschoolWorkflowsPage.transition'),
  completeWorkflow: t('preschoolWorkflowsPage.completeWorkflow'),
  cancelWorkflow: t('preschoolWorkflowsPage.cancelWorkflow'),
  escalateWorkflow: t('preschoolWorkflowsPage.escalateWorkflow'),
  noWorkflows: t('preschoolWorkflowsPage.noWorkflows'),
  noPendingApprovals: t('preschoolWorkflowsPage.noPendingApprovals'),
  noTimeline: t('preschoolWorkflowsPage.noTimeline'),
  emptyWorkflows: t('preschoolWorkflowsPage.empty.workflows'),
  emptyApprovals: t('preschoolWorkflowsPage.empty.approvals'),
  emptyTimeline: t('preschoolWorkflowsPage.empty.timeline'),
  workflow: t('preschoolWorkflowsPage.workflow'),
  workflowSync: t('preschoolWorkflowsPage.workflowSync'),
  previewSync: t('preschoolWorkflowsPage.previewSync'),
  runSync: t('preschoolWorkflowsPage.runSync'),
  syncResults: t('preschoolWorkflowsPage.syncResults'),
  eligible: t('preschoolWorkflowsPage.eligible'),
  created: t('preschoolWorkflowsPage.created'),
  existing: t('preschoolWorkflowsPage.existing'),
  skipped: t('preschoolWorkflowsPage.skipped'),
  failed: t('preschoolWorkflowsPage.failed'),
  dryRun: t('preschoolWorkflowsPage.dryRun'),
  syncWarning: t('preschoolWorkflowsPage.syncWarning'),
  adminControlledSync: t('preschoolWorkflowsPage.adminControlledSync'),
  noEligibleRecords: t('preschoolWorkflowsPage.noEligibleRecords'),
  syncCompleted: t('preschoolWorkflowsPage.syncCompleted'),
  syncHistory: t('preschoolWorkflowsPage.syncHistory'),
  recentSyncRuns: t('preschoolWorkflowsPage.recentSyncRuns'),
  syncRunDetails: t('preschoolWorkflowsPage.syncRunDetails'),
  allModes: t('preschoolWorkflowsPage.allModes'),
  startedBy: t('preschoolWorkflowsPage.startedBy'),
  startedAt: t('preschoolWorkflowsPage.startedAt'),
  completedAt: t('preschoolWorkflowsPage.completedAt'),
  processed: t('preschoolWorkflowsPage.processed'),
  batchSize: t('preschoolWorkflowsPage.batchSize'),
  completed: t('preschoolWorkflowsPage.completed'),
  completedWithErrors: t('preschoolWorkflowsPage.completedWithErrors'),
  failedItems: t('preschoolWorkflowsPage.failedItems'),
  resultItems: t('preschoolWorkflowsPage.resultItems'),
  viewRun: t('preschoolWorkflowsPage.viewRun'),
  noSyncHistory: t('preschoolWorkflowsPage.noSyncHistory'),
  workflowObservability: t('preschoolWorkflowsPage.workflowObservability'),
  syncHealth: t('preschoolWorkflowsPage.syncHealth'),
  processingSummary: t('preschoolWorkflowsPage.processingSummary'),
  performance: t('preschoolWorkflowsPage.performance'),
  failureAnalysis: t('preschoolWorkflowsPage.failureAnalysis'),
  runTrends: t('preschoolWorkflowsPage.runTrends'),
  staleRuns: t('preschoolWorkflowsPage.staleRuns'),
  recentOperationalActivity: t('preschoolWorkflowsPage.recentOperationalActivity'),
  governance: t('preschoolWorkflowsPage.governance'),
  investigationRequired: t('preschoolWorkflowsPage.investigationRequired'),
  healthy: t('preschoolWorkflowsPage.healthy'),
  warning: t('preschoolWorkflowsPage.warning'),
  critical: t('preschoolWorkflowsPage.critical'),
  successfulRuns: t('preschoolWorkflowsPage.successfulRuns'),
  runsWithErrors: t('preschoolWorkflowsPage.runsWithErrors'),
  failedRuns: t('preschoolWorkflowsPage.failedRuns'),
  runningRuns: t('preschoolWorkflowsPage.runningRuns'),
  totalProcessed: t('preschoolWorkflowsPage.totalProcessed'),
  totalCreated: t('preschoolWorkflowsPage.totalCreated'),
  totalExisting: t('preschoolWorkflowsPage.totalExisting'),
  totalSkipped: t('preschoolWorkflowsPage.totalSkipped'),
  totalFailedItems: t('preschoolWorkflowsPage.totalFailedItems'),
  averageDuration: t('preschoolWorkflowsPage.averageDuration'),
  longestDuration: t('preschoolWorkflowsPage.longestDuration'),
  averageItemsPerRun: t('preschoolWorkflowsPage.averageItemsPerRun'),
  throughput: t('preschoolWorkflowsPage.throughput'),
  failureCategory: t('preschoolWorkflowsPage.failureCategory'),
  totalFailures: t('preschoolWorkflowsPage.totalFailures'),
  runFailures: t('preschoolWorkflowsPage.runFailures'),
  itemFailures: t('preschoolWorkflowsPage.itemFailures'),
  run: t('preschoolWorkflowsPage.run'),
  definition: t('preschoolWorkflowsPage.definition'),
  sourceType: t('preschoolWorkflowsPage.sourceType'),
  totalRuns: t('preschoolWorkflowsPage.totalRuns'),
  definitionBreakdown: t('preschoolWorkflowsPage.definitionBreakdown'),
  sourceTypeBreakdown: t('preschoolWorkflowsPage.sourceTypeBreakdown'),
  runStatusBreakdown: t('preschoolWorkflowsPage.runStatusBreakdown'),
  actorBreakdown: t('preschoolWorkflowsPage.actorBreakdown'),
  oldestAuditRecord: t('preschoolWorkflowsPage.oldestAuditRecord'),
  totalRunRecords: t('preschoolWorkflowsPage.totalRunRecords'),
  totalItemRecords: t('preschoolWorkflowsPage.totalItemRecords'),
  retentionMode: t('preschoolWorkflowsPage.retentionMode'),
  automaticPruningDisabled: t('preschoolWorkflowsPage.automaticPruningDisabled'),
  noObservabilityData: t('preschoolWorkflowsPage.noObservabilityData'),
  noFailures: t('preschoolWorkflowsPage.noFailures'),
  noStaleRuns: t('preschoolWorkflowsPage.noStaleRuns'),
  noRecentRuns: t('preschoolWorkflowsPage.noRecentRuns'),
  noRecentFailures: t('preschoolWorkflowsPage.noRecentFailures'),
  noRecentCompletedRuns: t('preschoolWorkflowsPage.noRecentCompletedRuns'),
  runFilters: t('preschoolWorkflowsPage.runFilters'),
  executionMode: t('preschoolWorkflowsPage.executionMode'),
  previewMode: t('preschoolWorkflowsPage.previewMode'),
  actualRunMode: t('preschoolWorkflowsPage.actualRunMode'),
  allDefinitions: t('preschoolWorkflowsPage.allDefinitions'),
  allSourceTypes: t('preschoolWorkflowsPage.allSourceTypes'),
  allStatuses: t('preschoolWorkflowsPage.allStatuses'),
  dateFrom: t('preschoolWorkflowsPage.dateFrom'),
  dateTo: t('preschoolWorkflowsPage.dateTo'),
  limit: t('preschoolWorkflowsPage.limit'),
  syncStatusOptions: {
    submitted: t('preschoolWorkflowsPage.syncStatusOptions.submitted'),
    underReview: t('preschoolWorkflowsPage.syncStatusOptions.underReview'),
    approved: t('preschoolWorkflowsPage.syncStatusOptions.approved'),
    waitlisted: t('preschoolWorkflowsPage.syncStatusOptions.waitlisted'),
    enrolled: t('preschoolWorkflowsPage.syncStatusOptions.enrolled'),
    rejected: t('preschoolWorkflowsPage.syncStatusOptions.rejected'),
    cancelled: t('preschoolWorkflowsPage.syncStatusOptions.cancelled'),
    new: t('preschoolWorkflowsPage.syncStatusOptions.new'),
    acknowledged: t('preschoolWorkflowsPage.syncStatusOptions.acknowledged'),
    inProgress: t('preschoolWorkflowsPage.syncStatusOptions.inProgress'),
    resolved: t('preschoolWorkflowsPage.syncStatusOptions.resolved'),
    closed: t('preschoolWorkflowsPage.syncStatusOptions.closed'),
    issued: t('preschoolWorkflowsPage.syncStatusOptions.issued'),
    partial: t('preschoolWorkflowsPage.syncStatusOptions.partial'),
    paid: t('preschoolWorkflowsPage.syncStatusOptions.paid'),
    overdue: t('preschoolWorkflowsPage.syncStatusOptions.overdue'),
    open: t('preschoolWorkflowsPage.syncStatusOptions.open'),
    completed: t('preschoolWorkflowsPage.syncStatusOptions.completed'),
  },
}))

const currentRole = computed(() => String(userStore.currentUser?.role_code ?? userStore.currentUser?.role ?? ''))
const canManageSync = computed(() => ['superadmin', 'adminpreschool'].includes(currentRole.value))

const syncFilters = reactive({
  definitionKey: '',
  sourceType: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  limit: 25,
  batchSize: 25,
})
const syncLoading = ref(false)
const syncErrorMessage = ref('')
const syncResult = ref(null)
const syncPreviewReady = ref(false)
const syncHistoryLoading = ref(false)
const syncHistoryErrorMessage = ref('')
const syncRuns = ref([])
const syncHistoryPagination = ref(null)
const syncHistoryFilters = reactive({
  mode: '',
  status: '',
  definitionKey: '',
  sourceType: '',
  startedByUserId: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  perPage: 5,
})
const observabilityFilters = reactive({
  definitionKey: '',
  sourceType: '',
  status: '',
  startedByUserId: '',
  dateFrom: '',
  dateTo: '',
  mode: '',
})
const observabilityLoading = ref(false)
const observabilityErrorMessage = ref('')
const observabilityDashboard = ref(null)

const definitionOptions = computed(() => [
  { label: labels.value.allDefinitions, value: '' },
  ...definitions.value.map((definition) => ({
    label: definition.name || definition.key,
    value: definition.key,
  })),
])

const syncSourceTypeOptions = computed(() => ([
  { label: labels.value.allSourceTypes, value: '' },
  { label: t('preschoolWorkflowsPage.sourceTypes.enrollmentApplication'), value: 'preschool_enrollment_application' },
  { label: t('preschoolWorkflowsPage.sourceTypes.healthAlert'), value: 'preschool_health_alert' },
  { label: t('preschoolWorkflowsPage.sourceTypes.invoice'), value: 'preschool_invoice' },
  { label: t('preschoolWorkflowsPage.sourceTypes.automationTask'), value: 'preschool_automation_task' },
  { label: t('preschoolWorkflowsPage.sourceTypes.guardianCommunication'), value: 'preschool_guardian_communication' },
]))

const syncStatusOptions = computed(() => ([
  { label: labels.value.allStatuses, value: '' },
  { label: labels.value.syncStatusOptions.submitted, value: 'submitted' },
  { label: labels.value.syncStatusOptions.underReview, value: 'under_review' },
  { label: labels.value.syncStatusOptions.approved, value: 'approved' },
  { label: labels.value.syncStatusOptions.waitlisted, value: 'waitlisted' },
  { label: labels.value.syncStatusOptions.enrolled, value: 'enrolled' },
  { label: labels.value.syncStatusOptions.rejected, value: 'rejected' },
  { label: labels.value.syncStatusOptions.cancelled, value: 'cancelled' },
  { label: labels.value.syncStatusOptions.new, value: 'new' },
  { label: labels.value.syncStatusOptions.acknowledged, value: 'acknowledged' },
  { label: labels.value.syncStatusOptions.inProgress, value: 'in_progress' },
  { label: labels.value.syncStatusOptions.resolved, value: 'resolved' },
  { label: labels.value.syncStatusOptions.closed, value: 'closed' },
  { label: labels.value.syncStatusOptions.issued, value: 'issued' },
  { label: labels.value.syncStatusOptions.partial, value: 'partial' },
  { label: labels.value.syncStatusOptions.paid, value: 'paid' },
  { label: labels.value.syncStatusOptions.overdue, value: 'overdue' },
  { label: labels.value.syncStatusOptions.open, value: 'open' },
  { label: labels.value.syncStatusOptions.completed, value: 'completed' },
]))

async function refreshWorkflows() {
  await loadWorkflows(cloneFilters())
}

watch(syncFilters, () => {
  syncPreviewReady.value = false
}, { deep: true })

function currentSyncFilters() {
  return {
    definitionKey: syncFilters.definitionKey,
    sourceType: syncFilters.sourceType,
    status: syncFilters.status,
    dateFrom: syncFilters.dateFrom,
    dateTo: syncFilters.dateTo,
    limit: syncFilters.limit,
    batchSize: syncFilters.batchSize,
    dryRun: false,
  }
}

function currentSyncHistoryFilters() {
  return {
    mode: syncHistoryFilters.mode,
    status: syncHistoryFilters.status,
    definitionKey: syncHistoryFilters.definitionKey,
    sourceType: syncHistoryFilters.sourceType,
    startedByUserId: syncHistoryFilters.startedByUserId,
    dateFrom: syncHistoryFilters.dateFrom,
    dateTo: syncHistoryFilters.dateTo,
    page: syncHistoryFilters.page,
    perPage: syncHistoryFilters.perPage,
  }
}

function currentObservabilityFilters() {
  return {
    definitionKey: observabilityFilters.definitionKey,
    sourceType: observabilityFilters.sourceType,
    status: observabilityFilters.status,
    startedByUserId: observabilityFilters.startedByUserId,
    dateFrom: observabilityFilters.dateFrom,
    dateTo: observabilityFilters.dateTo,
    mode: observabilityFilters.mode,
  }
}

async function previewWorkflowSync() {
  syncLoading.value = true
  syncErrorMessage.value = ''

  try {
    syncResult.value = await fetchPreschoolWorkflowSyncPreview(currentSyncFilters())
    syncPreviewReady.value = true
  } catch (error) {
    syncErrorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
    syncPreviewReady.value = false
  } finally {
    syncLoading.value = false
  }
}

async function runWorkflowSync() {
  if (!syncPreviewReady.value) {
    return
  }

  syncLoading.value = true
  syncErrorMessage.value = ''

  try {
    syncResult.value = await runPreschoolWorkflowSync(currentSyncFilters())
    syncPreviewReady.value = true
    await loadSyncRuns()
  } catch (error) {
    syncErrorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    syncLoading.value = false
  }
}

async function loadSyncRuns() {
  if (!canManageSync.value) {
    return
  }

  syncHistoryLoading.value = true
  syncHistoryErrorMessage.value = ''

  try {
    const payload = await fetchPreschoolWorkflowSyncRuns(currentSyncHistoryFilters())
    syncRuns.value = payload.items || []
    syncHistoryPagination.value = payload.pagination || null
  } catch (error) {
    syncHistoryErrorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    syncHistoryLoading.value = false
  }
}

async function loadObservability() {
  if (!canManageSync.value) {
    return
  }

  observabilityLoading.value = true
  observabilityErrorMessage.value = ''

  try {
    observabilityDashboard.value = await fetchPreschoolWorkflowObservabilityDashboard(currentObservabilityFilters())
  } catch (error) {
    observabilityErrorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    observabilityLoading.value = false
  }
}

function formatSyncStatus(status) {
  const key = String(status || '').toLowerCase()
  if (['created', 'existing', 'skipped', 'failed'].includes(key)) {
    return labels.value[key]
  }

  const labelKey = {
    submitted: 'submitted',
    under_review: 'underReview',
    approved: 'approved',
    waitlisted: 'waitlisted',
    enrolled: 'enrolled',
    rejected: 'rejected',
    cancelled: 'cancelled',
    new: 'new',
    acknowledged: 'acknowledged',
    in_progress: 'inProgress',
    resolved: 'resolved',
    closed: 'closed',
    issued: 'issued',
    partial: 'partial',
    paid: 'paid',
    overdue: 'overdue',
    open: 'open',
    completed: 'completed',
    created: 'created',
    existing: 'existing',
    skipped: 'skipped',
    failed: 'failed',
  }[key]

  return labelKey ? labels.value.syncStatusOptions[labelKey] : key || '—'
}

function formatRunMode(mode) {
  return String(mode || '').toLowerCase() === 'preview'
    ? labels.value.previewMode
    : labels.value.actualRunMode
}

function formatRunStatus(status) {
  const key = String(status || '').toLowerCase()

  return {
    pending: 'Pending',
    running: 'Running',
    completed: labels.value.completed,
    completed_with_errors: labels.value.completedWithErrors,
    failed: labels.value.failed,
    cancelled: 'Cancelled',
  }[key] || key || '—'
}

function openWorkflow(workflow) {
  if (!workflow?.id || !router.hasRoute('dashboard-preschool-admin-workflow-details')) {
    return
  }

  router.push({
    name: 'dashboard-preschool-admin-workflow-details',
    params: { id: workflow.id },
  })
}

function openSource(workflow) {
  const routeName = String(workflow?.sourceRouteName || '').trim()

  if (!routeName || workflow?.sourceExists === false || !router.hasRoute(routeName)) {
    return
  }

  router.push({
    name: routeName,
    params: workflow.sourceRouteParams || {},
  })
}

function openSyncRun(run) {
  if (!run?.id || !router.hasRoute('dashboard-preschool-admin-workflow-sync-run')) {
    return
  }

  router.push({
    name: 'dashboard-preschool-admin-workflow-sync-run',
    params: { id: run.id },
  })
}

function canOpenSyncRun(run) {
  return Boolean(run?.id && router.hasRoute('dashboard-preschool-admin-workflow-sync-run'))
}

async function approvePendingApproval(approval) {
  if (!approval?.id) {
    return
  }

  await approveApproval(approval.id, {}, refreshWorkflows)
}

async function rejectPendingApproval(approval) {
  if (!approval?.id) {
    return
  }

  await rejectApproval(approval.id, {}, refreshWorkflows)
}

async function returnPendingApproval(approval) {
  if (!approval?.id) {
    return
  }

  await returnApproval(approval.id, {}, refreshWorkflows)
}

async function cancelPendingApproval(approval) {
  if (!approval?.id) {
    return
  }

  await cancelApproval(approval.id, {}, refreshWorkflows)
}

onMounted(refreshWorkflows)
watch(canManageSync, (enabled) => {
  if (enabled) {
    loadSyncRuns()
    loadObservability()
  }
}, { immediate: true })
</script>

<template>
  <MainLayout>
    <section class="workflow-center">
      <WorkflowHeaderSection
        :title="labels.title"
        :subtitle="labels.subtitle"
        :generated-at="generatedAt ? `${labels.generatedAt}: ${generatedAt}` : ''"
        :loading="loading"
        :refresh-label="labels.refresh"
        @refresh="refreshWorkflows"
      />

      <div
        v-if="errorMessage"
        class="workflow-center__error"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="workflow-center__loading"
      >
        {{ t('preschoolWorkflowsPage.loading') }}
      </div>

      <WorkflowSummarySection
        :summary="summary"
        :labels="labels"
      />

      <section
        v-if="canManageSync"
        class="workflow-observability-panel"
      >
        <div class="workflow-observability-panel__header">
          <div>
            <div class="workflow-observability-panel__eyebrow">{{ labels.workflowObservability }}</div>
            <h2 class="workflow-observability-panel__title">{{ labels.syncHealth }}</h2>
          </div>
          <button
            type="button"
            class="workflow-observability-panel__refresh"
            :disabled="observabilityLoading"
            @click="loadObservability"
          >
            {{ labels.refresh }}
          </button>
        </div>

        <div class="workflow-observability-panel__filters">
          <label class="workflow-observability-panel__field">
            <span>{{ labels.workflow }}</span>
            <select v-model="observabilityFilters.definitionKey">
              <option value="">{{ labels.allDefinitions }}</option>
              <option
                v-for="option in definitionOptions"
                :key="`observability-definition-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.sourceEntity }}</span>
            <select v-model="observabilityFilters.sourceType">
              <option value="">{{ labels.allSourceTypes }}</option>
              <option
                v-for="option in syncSourceTypeOptions"
                :key="`observability-source-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.status }}</span>
            <select v-model="observabilityFilters.status">
              <option value="">{{ labels.allStatuses }}</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">{{ labels.completed }}</option>
              <option value="completed_with_errors">{{ labels.completedWithErrors }}</option>
              <option value="failed">{{ labels.failed }}</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.startedBy }}</span>
            <input
              v-model="observabilityFilters.startedByUserId"
              type="text"
              placeholder="user id"
            >
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.dateFrom }}</span>
            <input
              v-model="observabilityFilters.dateFrom"
              type="date"
            >
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.dateTo }}</span>
            <input
              v-model="observabilityFilters.dateTo"
              type="date"
            >
          </label>

          <label class="workflow-observability-panel__field">
            <span>{{ labels.executionMode }}</span>
            <select v-model="observabilityFilters.mode">
              <option value="">{{ labels.allModes }}</option>
              <option value="preview">{{ labels.previewMode }}</option>
              <option value="run">{{ labels.actualRunMode }}</option>
            </select>
          </label>
        </div>

        <div class="workflow-observability-panel__actions">
          <button
            type="button"
            class="workflow-observability-panel__button"
            :disabled="observabilityLoading"
            @click="loadObservability"
          >
            {{ labels.runFilters }}
          </button>
        </div>

        <div
          v-if="observabilityErrorMessage"
          class="workflow-observability-panel__error"
        >
          {{ observabilityErrorMessage }}
        </div>

        <div
          v-if="observabilityLoading"
          class="workflow-observability-panel__loading"
        >
          {{ t('preschoolWorkflowsPage.loading') }}
        </div>

        <WorkflowObservabilitySection
          v-else
          :dashboard="observabilityDashboard"
          :labels="labels"
          :can-open-run="canOpenSyncRun"
          :open-run="openSyncRun"
        />
      </section>

      <section
        v-if="canManageSync"
        class="workflow-sync-panel"
      >
        <div class="workflow-sync-panel__header">
          <div>
            <div class="workflow-sync-panel__eyebrow">{{ labels.adminControlledSync }}</div>
            <h2 class="workflow-sync-panel__title">{{ labels.workflowSync }}</h2>
          </div>
          <span class="workflow-sync-panel__badge">{{ labels.dryRun }}</span>
        </div>

        <p class="workflow-sync-panel__warning">
          {{ labels.syncWarning }}
        </p>

        <div class="workflow-sync-panel__grid">
          <label class="workflow-sync-panel__field">
            <span>{{ labels.workflow }}</span>
            <select v-model="syncFilters.definitionKey">
              <option
                v-for="option in definitionOptions"
                :key="`definition-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.sourceEntity }}</span>
            <select v-model="syncFilters.sourceType">
              <option
                v-for="option in syncSourceTypeOptions"
                :key="`source-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.status }}</span>
            <select v-model="syncFilters.status">
              <option
                v-for="option in syncStatusOptions"
                :key="`status-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.dateFrom }}</span>
            <input
              v-model="syncFilters.dateFrom"
              type="date"
            >
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.dateTo }}</span>
            <input
              v-model="syncFilters.dateTo"
              type="date"
            >
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.limit }}</span>
            <input
              v-model.number="syncFilters.limit"
              type="number"
              min="1"
              max="500"
            >
          </label>

          <label class="workflow-sync-panel__field">
            <span>{{ labels.batchSize }}</span>
            <input
              v-model.number="syncFilters.batchSize"
              type="number"
              min="1"
              max="100"
            >
          </label>
        </div>

        <div class="workflow-sync-panel__actions">
          <button
            type="button"
            class="workflow-sync-panel__button workflow-sync-panel__button--secondary"
            :disabled="syncLoading"
            @click="previewWorkflowSync"
          >
            {{ labels.previewSync }}
          </button>

          <button
            type="button"
            class="workflow-sync-panel__button workflow-sync-panel__button--primary"
            :disabled="syncLoading || !syncPreviewReady"
            @click="runWorkflowSync"
          >
            {{ labels.runSync }}
          </button>
        </div>

        <div
          v-if="syncErrorMessage"
          class="workflow-sync-panel__error"
        >
          {{ syncErrorMessage }}
        </div>

        <div
          v-if="syncResult"
          class="workflow-sync-panel__results"
        >
          <div class="workflow-sync-panel__summary">
            <div class="workflow-sync-panel__metric">
              <span>{{ labels.eligible }}</span>
              <strong>{{ syncResult.summary.eligible }}</strong>
            </div>
            <div class="workflow-sync-panel__metric">
              <span>{{ labels.created }}</span>
              <strong>{{ syncResult.summary.created }}</strong>
            </div>
            <div class="workflow-sync-panel__metric">
              <span>{{ labels.existing }}</span>
              <strong>{{ syncResult.summary.existing }}</strong>
            </div>
            <div class="workflow-sync-panel__metric">
              <span>{{ labels.skipped }}</span>
              <strong>{{ syncResult.summary.skipped }}</strong>
            </div>
            <div class="workflow-sync-panel__metric">
              <span>{{ labels.failed }}</span>
              <strong>{{ syncResult.summary.failed }}</strong>
            </div>
          </div>

          <div class="workflow-sync-panel__results-header">
            <h3>{{ labels.syncResults }}</h3>
            <span>{{ syncResult.dryRun ? labels.dryRun : labels.syncCompleted }}</span>
          </div>

          <ul
            v-if="syncResult.items.length > 0"
            class="workflow-sync-panel__items"
          >
            <li
              v-for="item in syncResult.items"
              :key="`${item.definitionKey}-${item.sourceType}-${item.sourceId}`"
              class="workflow-sync-panel__item"
            >
              <div class="workflow-sync-panel__item-main">
                <strong>{{ item.sourceLabel || item.sourceId }}</strong>
                <span>{{ item.definitionKey }}</span>
              </div>
              <div class="workflow-sync-panel__item-meta">
                <span>{{ item.sourceType }}</span>
                <span>{{ formatSyncStatus(item.status) }}</span>
                <span v-if="item.reason">{{ item.reason }}</span>
              </div>
            </li>
          </ul>

          <div
            v-else
            class="workflow-sync-panel__empty"
          >
            {{ labels.noEligibleRecords }}
          </div>
        </div>
      </section>

      <section
        v-if="canManageSync"
        class="workflow-sync-history"
      >
        <div class="workflow-sync-history__header">
          <div>
            <div class="workflow-sync-history__eyebrow">{{ labels.syncHistory }}</div>
            <h2 class="workflow-sync-history__title">{{ labels.recentSyncRuns }}</h2>
          </div>
          <button
            type="button"
            class="workflow-sync-history__refresh"
            :disabled="syncHistoryLoading"
            @click="loadSyncRuns"
          >
            {{ labels.refresh }}
          </button>
        </div>

        <p class="workflow-sync-history__warning">
          {{ labels.adminControlledSync }}. {{ labels.syncWarning }}
        </p>

        <div class="workflow-sync-history__filters">
          <label class="workflow-sync-history__field">
            <span>{{ labels.executionMode }}</span>
            <select v-model="syncHistoryFilters.mode">
              <option value="">{{ labels.allModes }}</option>
              <option value="preview">{{ labels.previewMode }}</option>
              <option value="run">{{ labels.actualRunMode }}</option>
            </select>
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.status }}</span>
            <select v-model="syncHistoryFilters.status">
              <option value="">{{ labels.allStatuses }}</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">{{ labels.completed }}</option>
              <option value="completed_with_errors">{{ labels.completedWithErrors }}</option>
              <option value="failed">{{ labels.failed }}</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.workflow }}</span>
            <select v-model="syncHistoryFilters.definitionKey">
              <option value="">{{ labels.allDefinitions }}</option>
              <option
                v-for="option in definitionOptions"
                :key="`history-definition-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.sourceEntity }}</span>
            <select v-model="syncHistoryFilters.sourceType">
              <option value="">{{ labels.allSourceTypes }}</option>
              <option
                v-for="option in syncSourceTypeOptions"
                :key="`history-source-${option.value || 'all'}`"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.startedBy }}</span>
            <input
              v-model="syncHistoryFilters.startedByUserId"
              type="text"
              placeholder="user id"
            >
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.dateFrom }}</span>
            <input
              v-model="syncHistoryFilters.dateFrom"
              type="date"
            >
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.dateTo }}</span>
            <input
              v-model="syncHistoryFilters.dateTo"
              type="date"
            >
          </label>

          <label class="workflow-sync-history__field">
            <span>{{ labels.batchSize }}</span>
            <input
              v-model.number="syncHistoryFilters.perPage"
              type="number"
              min="1"
              max="100"
            >
          </label>
        </div>

        <div class="workflow-sync-history__actions">
          <button
            type="button"
            class="workflow-sync-history__button"
            :disabled="syncHistoryLoading"
            @click="loadSyncRuns"
          >
            {{ labels.runFilters }}
          </button>
        </div>

        <div
          v-if="syncHistoryErrorMessage"
          class="workflow-sync-history__error"
        >
          {{ syncHistoryErrorMessage }}
        </div>

        <div
          v-if="syncHistoryLoading"
          class="workflow-sync-history__loading"
        >
          {{ t('preschoolWorkflowsPage.loading') }}
        </div>

        <div
          v-else-if="syncRuns.length > 0"
          class="workflow-sync-history__table"
        >
          <div class="workflow-sync-history__table-head">
            <span>{{ labels.executionMode }}</span>
            <span>{{ labels.status }}</span>
            <span>{{ labels.workflow }}</span>
            <span>{{ labels.sourceEntity }}</span>
            <span>{{ labels.startedBy }}</span>
            <span>{{ labels.startedAt }}</span>
            <span>{{ labels.completedAt }}</span>
            <span>{{ labels.processed }}</span>
            <span />
          </div>

          <div
            v-for="run in syncRuns"
            :key="run.id"
            class="workflow-sync-history__row"
          >
            <span>{{ formatRunMode(run.mode) }}</span>
            <span>{{ formatRunStatus(run.status) }}</span>
            <span>{{ run.definitionKey || '—' }}</span>
            <span>{{ run.sourceType || '—' }}</span>
            <span>{{ run.startedBy?.name || run.startedByUserId || '—' }}</span>
            <span>{{ run.startedAt || '—' }}</span>
            <span>{{ run.completedAt || '—' }}</span>
            <span>{{ run.processedCount }}</span>
            <button
              type="button"
              class="workflow-sync-history__view"
              :disabled="!canOpenSyncRun(run)"
              @click="openSyncRun(run)"
            >
              {{ labels.viewRun }}
            </button>
          </div>
        </div>

        <div
          v-if="syncHistoryPagination"
          class="workflow-sync-history__pagination"
        >
          Page {{ syncHistoryPagination.currentPage }} / {{ syncHistoryPagination.lastPage }}
        </div>

        <div
          v-else
          class="workflow-sync-history__empty"
        >
          {{ labels.noSyncHistory }}
        </div>
      </section>

      <PendingApprovalsSection
        :approvals="approvals"
        :labels="labels"
        :can-act="currentRole === 'superadmin' || currentRole === 'adminpreschool'"
        @approve="approvePendingApproval"
        @reject="rejectPendingApproval"
        @return="returnPendingApproval"
        @cancel="cancelPendingApproval"
        @view-workflow="openWorkflow"
      />

      <WorkflowQueueSection
        :workflows="workflows"
        :labels="labels"
        @view-workflow="openWorkflow"
        @view-source="openSource"
      />

      <OverdueWorkflowsSection
        :workflows="overdueWorkflows"
        :labels="labels"
        @view-workflow="openWorkflow"
      />

      <MyAssignmentsSection
        :workflows="myAssignments"
        :labels="labels"
        @view-workflow="openWorkflow"
      />

      <RecentlyUpdatedWorkflowsSection
        :workflows="recentlyUpdatedWorkflows"
        :labels="labels"
        @view-workflow="openWorkflow"
        @view-source="openSource"
      />

      <WorkflowTimelinePreviewSection
        :events="recentTimelineEvents"
        :labels="labels"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.workflow-center {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-center__error,
.workflow-center__loading {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}

.workflow-observability-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #d8e1ec;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.97)),
    linear-gradient(135deg, rgba(15, 118, 110, 0.06), rgba(14, 165, 233, 0.04));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.workflow-observability-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workflow-observability-panel__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.workflow-observability-panel__title {
  margin: 0.15rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-observability-panel__refresh,
.workflow-observability-panel__button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  border-radius: 0.85rem;
  font-weight: 700;
  padding: 0.65rem 0.95rem;
}

.workflow-observability-panel__refresh:disabled,
.workflow-observability-panel__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.workflow-observability-panel__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-observability-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-observability-panel__field select,
.workflow-observability-panel__field input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
}

.workflow-observability-panel__actions {
  display: flex;
  justify-content: flex-end;
}

.workflow-observability-panel__error,
.workflow-observability-panel__loading {
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
}

.workflow-observability-panel__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.workflow-observability-panel__loading {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.workflow-center__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.workflow-center__loading {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.workflow-sync-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #dbe4f0;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 251, 0.95)),
    linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(15, 23, 42, 0.03));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.workflow-sync-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workflow-sync-panel__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0369a1;
}

.workflow-sync-panel__title {
  margin: 0.15rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-sync-panel__badge {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-size: 0.75rem;
  font-weight: 700;
}

.workflow-sync-panel__warning {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  color: #155e75;
  font-size: 0.9rem;
}

.workflow-sync-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-sync-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-sync-panel__field select,
.workflow-sync-panel__field input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
}

.workflow-sync-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.workflow-sync-panel__button {
  padding: 0.7rem 1rem;
  border-radius: 0.85rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.workflow-sync-panel__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.workflow-sync-panel__button--secondary {
  border-color: #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.workflow-sync-panel__button--primary {
  background: linear-gradient(135deg, #0369a1, #0f766e);
  color: #fff;
}

.workflow-sync-panel__error {
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.workflow-sync-panel__results {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.workflow-sync-panel__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-sync-panel__metric {
  padding: 0.8rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.workflow-sync-panel__metric span {
  font-size: 0.76rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.workflow-sync-panel__metric strong {
  font-size: 1.25rem;
  color: #0f172a;
}

.workflow-sync-panel__results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-sync-panel__results-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.workflow-sync-panel__results-header span {
  font-size: 0.82rem;
  color: #475569;
}

.workflow-sync-panel__items {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow-sync-panel__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.workflow-sync-panel__item-main,
.workflow-sync-panel__item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.85rem;
  color: #475569;
}

.workflow-sync-panel__item-main strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.workflow-sync-panel__empty {
  padding: 0.95rem 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.95rem;
  color: #64748b;
  background: #f8fafc;
}

.workflow-sync-history {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #d8e1ec;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.workflow-sync-history__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workflow-sync-history__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c3aed;
}

.workflow-sync-history__title {
  margin: 0.15rem 0 0;
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-sync-history__refresh,
.workflow-sync-history__button,
.workflow-sync-history__view {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  border-radius: 0.85rem;
  font-weight: 700;
  padding: 0.65rem 0.95rem;
}

.workflow-sync-history__warning {
  margin: 0;
  padding: 0.8rem 0.95rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.workflow-sync-history__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-sync-history__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #334155;
}

.workflow-sync-history__field select,
.workflow-sync-history__field input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #fff;
  color: #0f172a;
}

.workflow-sync-history__actions {
  display: flex;
  justify-content: flex-end;
}

.workflow-sync-history__error,
.workflow-sync-history__loading,
.workflow-sync-history__empty {
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
}

.workflow-sync-history__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.workflow-sync-history__loading {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.workflow-sync-history__empty {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.workflow-sync-history__pagination {
  font-size: 0.82rem;
  color: #64748b;
}

.workflow-sync-history__table {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.workflow-sync-history__table-head,
.workflow-sync-history__row {
  display: grid;
  grid-template-columns: 0.8fr 0.8fr 1fr 1fr 1fr 1fr 1fr 0.7fr 0.7fr;
  gap: 0.5rem;
  align-items: center;
}

.workflow-sync-history__table-head {
  padding: 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.workflow-sync-history__row {
  padding: 0.85rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #fff;
  font-size: 0.86rem;
  color: #334155;
}

@media (max-width: 1024px) {
  .workflow-observability-panel__filters,
  .workflow-sync-panel__grid,
  .workflow-sync-panel__summary,
  .workflow-sync-history__filters,
  .workflow-sync-history__table-head,
  .workflow-sync-history__row {
    grid-template-columns: 1fr;
  }
}
</style>
