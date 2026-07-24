<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolWorkflowSyncRun,
  fetchPreschoolWorkflowSyncRunItems,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

defineOptions({
  name: 'PreschoolWorkflowSyncRunDetailsPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()

const loading = ref(false)
const errorMessage = ref('')
const run = ref(null)
const runItems = ref([])
const pagination = ref(null)

const itemFilters = reactive({
  resultStatus: '',
  page: 1,
  perPage: 20,
})

const labels = computed(() => ({
  workflowSync: t('preschoolWorkflowsPage.workflowSync'),
  syncHistory: t('preschoolWorkflowsPage.syncHistory'),
  syncRunDetails: t('preschoolWorkflowsPage.syncRunDetails'),
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
  runFilters: t('preschoolWorkflowsPage.runFilters'),
  executionMode: t('preschoolWorkflowsPage.executionMode'),
  previewMode: t('preschoolWorkflowsPage.previewMode'),
  actualRunMode: t('preschoolWorkflowsPage.actualRunMode'),
  definition: t('preschoolWorkflowsPage.workflow'),
  sourceEntity: t('preschoolWorkflowsPage.sourceEntity'),
  status: t('preschoolWorkflowsPage.status'),
  sourceLabel: t('preschoolWorkflowsPage.workflowSource'),
  reason: t('preschoolWorkflowsPage.decisionNotes'),
  noEligibleRecords: t('preschoolWorkflowsPage.noEligibleRecords'),
  viewWorkflow: t('preschoolWorkflowsPage.viewWorkflow'),
  viewSource: t('preschoolWorkflowsPage.viewSource'),
  noHistoryItems: t('preschoolWorkflowsPage.noSyncHistory'),
  allStatuses: t('preschoolWorkflowsPage.allStatuses'),
}))

const currentRunId = computed(() => route.params.id)

function normalizeFilters() {
  return {
    resultStatus: itemFilters.resultStatus,
    page: itemFilters.page,
    perPage: itemFilters.perPage,
  }
}

function resolveWorkflowRoute(item) {
  const routeName = String(item?.workflowRouteName || '').trim()

  if (routeName && router.hasRoute(routeName)) {
    return { name: routeName, params: item.workflowRouteParams || {} }
  }

  if (item?.workflowInstanceId && router.hasRoute('dashboard-preschool-admin-workflow-details')) {
    return {
      name: 'dashboard-preschool-admin-workflow-details',
      params: { id: item.workflowInstanceId },
    }
  }

  return null
}

function resolveSourceRoute(item) {
  const routeName = String(item?.sourceRouteName || '').trim()

  if (!routeName || item?.sourceExists === false || !router.hasRoute(routeName)) {
    return null
  }

  return {
    name: routeName,
    params: item.sourceRouteParams || {},
  }
}

function openWorkflow(item) {
  const resolved = resolveWorkflowRoute(item)

  if (!resolved) {
    return
  }

  router.push(resolved)
}

function openSource(item) {
  const resolved = resolveSourceRoute(item)

  if (!resolved) {
    return
  }

  router.push(resolved)
}

function formatRunStatus(status) {
  const value = String(status || '').toLowerCase()

  return {
    pending: 'Pending',
    running: 'Running',
    completed: labels.value.completed,
    completed_with_errors: labels.value.completedWithErrors,
    failed: labels.value.failed,
    cancelled: 'Cancelled',
  }[value] || value || '—'
}

function formatMode(mode) {
  return String(mode || '').toLowerCase() === 'preview'
    ? labels.value.previewMode
    : labels.value.actualRunMode
}

async function loadRunDetails() {
  if (!currentRunId.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const [runResponse, itemsResponse] = await Promise.all([
      fetchPreschoolWorkflowSyncRun(currentRunId.value),
      fetchPreschoolWorkflowSyncRunItems(currentRunId.value, normalizeFilters()),
    ])

    run.value = runResponse.run
    runItems.value = itemsResponse.items || []
    pagination.value = itemsResponse.pagination || null
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || error?.message || t('common.errorOccurred')
  } finally {
    loading.value = false
  }
}

watch(
  () => currentRunId.value,
  async () => {
    itemFilters.page = 1
    await loadRunDetails()
  },
  { immediate: true },
)
</script>

<template>
  <MainLayout>
    <section class="workflow-sync-run">
      <Breadcrumb />
      <div class="workflow-sync-run__header">
        <div>
          <div class="workflow-sync-run__eyebrow">{{ labels.syncHistory }}</div>
          <h1 class="workflow-sync-run__title">{{ labels.syncRunDetails }}</h1>
        </div>
        <button
          type="button"
          class="workflow-sync-run__refresh"
          :disabled="loading"
          @click="loadRunDetails"
        >
          {{ labels.viewRun }}
        </button>
      </div>

      <div
        v-if="errorMessage"
        class="workflow-sync-run__error"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="workflow-sync-run__loading"
      >
        {{ t('preschoolWorkflowsPage.loading') }}
      </div>

      <template v-else-if="run">
        <div class="workflow-sync-run__summary">
          <div class="workflow-sync-run__card">
            <span>{{ labels.executionMode }}</span>
            <strong>{{ formatMode(run.mode) }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.status }}</span>
            <strong>{{ formatRunStatus(run.status) }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.startedBy }}</span>
            <strong>{{ run.startedBy?.name || run.startedByUserId || '—' }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.startedAt }}</span>
            <strong>{{ run.startedAt || '—' }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.completedAt }}</span>
            <strong>{{ run.completedAt || '—' }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.processed }}</span>
            <strong>{{ run.processedCount }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.batchSize }}</span>
            <strong>{{ run.batchSize || '—' }}</strong>
          </div>
          <div class="workflow-sync-run__card">
            <span>{{ labels.failedItems }}</span>
            <strong>{{ run.failedCount }}</strong>
          </div>
        </div>

        <div class="workflow-sync-run__filters">
          <label class="workflow-sync-run__field">
            <span>{{ labels.status }}</span>
            <select v-model="itemFilters.resultStatus">
              <option value="">{{ labels.allStatuses }}</option>
              <option value="created">Created</option>
              <option value="existing">Existing</option>
              <option value="skipped">Skipped</option>
              <option value="failed">Failed</option>
            </select>
          </label>

          <label class="workflow-sync-run__field">
            <span>{{ labels.batchSize }}</span>
            <input
              v-model.number="itemFilters.perPage"
              type="number"
              min="1"
              max="100"
            >
          </label>

          <div class="workflow-sync-run__actions">
            <button
              type="button"
              class="workflow-sync-run__button"
              :disabled="loading"
              @click="loadRunDetails"
            >
              {{ labels.runFilters }}
            </button>
          </div>
        </div>

        <div class="workflow-sync-run__section-head">
          <h2>{{ labels.resultItems }}</h2>
          <span>{{ runItems.length }} / {{ pagination?.total ?? runItems.length }}</span>
        </div>

        <div
          v-if="runItems.length > 0"
          class="workflow-sync-run__items"
        >
          <div
            v-for="item in runItems"
            :key="item.id"
            class="workflow-sync-run__item"
          >
            <div class="workflow-sync-run__item-main">
              <strong>{{ item.sourceLabel || item.sourceId }}</strong>
              <span>{{ item.definitionKey }}</span>
              <span>{{ item.sourceType }}</span>
            </div>
            <div class="workflow-sync-run__item-meta">
              <span>{{ item.resultStatus }}</span>
              <span v-if="item.reason">{{ item.reason }}</span>
              <span v-if="item.errorMessage">{{ item.errorMessage }}</span>
            </div>
            <div class="workflow-sync-run__item-actions">
              <button
                type="button"
                class="workflow-sync-run__button workflow-sync-run__button--secondary"
                :disabled="!resolveSourceRoute(item)"
                @click="openSource(item)"
              >
                {{ labels.viewSource }}
              </button>
              <button
                type="button"
                class="workflow-sync-run__button"
                :disabled="!resolveWorkflowRoute(item)"
                @click="openWorkflow(item)"
              >
                {{ labels.viewWorkflow }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="workflow-sync-run__empty"
        >
          {{ labels.noHistoryItems }}
        </div>
      </template>
    </section>
  </MainLayout>
</template>

<style scoped>
.workflow-sync-run {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workflow-sync-run__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workflow-sync-run__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c3aed;
}

.workflow-sync-run__title {
  margin: 0.15rem 0 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-sync-run__refresh,
.workflow-sync-run__button {
  padding: 0.7rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #0369a1, #0f766e);
  color: #fff;
  font-weight: 700;
}

.workflow-sync-run__button--secondary {
  background: #fff;
  color: #0f172a;
  border-color: #cbd5e1;
}

.workflow-sync-run__error,
.workflow-sync-run__loading,
.workflow-sync-run__empty {
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
}

.workflow-sync-run__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.workflow-sync-run__loading {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.workflow-sync-run__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.workflow-sync-run__card {
  padding: 0.85rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.workflow-sync-run__card span,
.workflow-sync-run__item-main span,
.workflow-sync-run__item-meta span {
  font-size: 0.78rem;
  color: #64748b;
}

.workflow-sync-run__card strong,
.workflow-sync-run__item-main strong {
  color: #0f172a;
}

.workflow-sync-run__filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.workflow-sync-run__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.workflow-sync-run__field select,
.workflow-sync-run__field input {
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #fff;
}

.workflow-sync-run__actions {
  display: flex;
  justify-content: flex-end;
}

.workflow-sync-run__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.workflow-sync-run__section-head h2 {
  margin: 0;
  font-size: 1.05rem;
}

.workflow-sync-run__items {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.workflow-sync-run__item {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  gap: 0.75rem;
  padding: 0.9rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #fff;
}

.workflow-sync-run__item-main,
.workflow-sync-run__item-meta,
.workflow-sync-run__item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.workflow-sync-run__item-actions {
  align-items: flex-end;
}

.workflow-sync-run__empty {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

@media (max-width: 1024px) {
  .workflow-sync-run__summary,
  .workflow-sync-run__filters,
  .workflow-sync-run__item {
    grid-template-columns: 1fr;
  }

  .workflow-sync-run__item-actions {
    align-items: flex-start;
  }
}
</style>
