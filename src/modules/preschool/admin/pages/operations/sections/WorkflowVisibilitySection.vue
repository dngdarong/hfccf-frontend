<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { resolveOperationsRoute } from '../composables/useOperationsActions'
import { useOperationsDateTime } from '../composables/useOperationsDateTime'
import OperationsMetricCard from '../components/OperationsMetricCard.vue'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'

const props = defineProps({
  workflows: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const { t } = useLanguage()
const { formatDateTime } = useOperationsDateTime()

const summary = computed(() => props.workflows.summary || {})
const recentActivity = computed(() => {
  if (Array.isArray(props.workflows.recentActivity) && props.workflows.recentActivity.length > 0) {
    return props.workflows.recentActivity
  }

  return Array.isArray(props.workflows.items) ? props.workflows.items : []
})

const cards = computed(() => [
  {
    title: t('preschoolOperationsPage.pendingWorkflows'),
    value: summary.value.pendingWorkflows ?? summary.value.total ?? 0,
    tone: 'blue',
    to: resolveOperationsRoute(router, 'dashboard-preschool-admin-workflows'),
    detailsLabel: t('preschoolOperationsPage.viewDetails'),
  },
  {
    title: t('preschoolOperationsPage.pendingApprovals'),
    value: summary.value.pendingApprovals ?? 0,
    tone: 'amber',
    to: resolveOperationsRoute(router, 'dashboard-preschool-admin-workflows'),
    detailsLabel: t('preschoolOperationsPage.viewDetails'),
  },
  {
    title: t('preschoolOperationsPage.overdueWorkflows'),
    value: summary.value.overdueWorkflows ?? 0,
    tone: 'rose',
    to: resolveOperationsRoute(router, 'dashboard-preschool-admin-workflows'),
    detailsLabel: t('preschoolOperationsPage.viewDetails'),
  },
  {
    title: t('preschoolOperationsPage.escalatedWorkflows'),
    value: summary.value.escalatedWorkflows ?? 0,
    tone: 'amber',
    to: resolveOperationsRoute(router, 'dashboard-preschool-admin-workflows'),
    detailsLabel: t('preschoolOperationsPage.viewDetails'),
  },
])

function openWorkflow(workflow) {
  if (!workflow?.id || !router.hasRoute('dashboard-preschool-admin-workflow-details')) {
    return
  }

  router.push({
    name: 'dashboard-preschool-admin-workflow-details',
    params: { id: workflow.id },
  })
}
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.workflowVisibility') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.workflowActivity') }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OperationsMetricCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :tone="card.tone"
        :to="card.to"
        :details-label="card.detailsLabel"
      />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {{ t('preschoolOperationsPage.recentlyUpdatedWorkflows') }}
          </div>
          <h3 class="mt-1 text-base font-semibold text-slate-900">
            {{ t('preschoolOperationsPage.workflowActivity') }}
          </h3>
        </div>
        <Button
          v-if="router.hasRoute('dashboard-preschool-admin-workflows')"
          type="button"
          severity="secondary"
          outlined
          size="small"
          @click="router.push({ name: 'dashboard-preschool-admin-workflows' })"
        >
          {{ t('preschoolOperationsPage.openWorkflowCenter') }}
        </Button>
      </div>

      <OperationsEmptyState
        v-if="recentActivity.length === 0"
        :title="t('preschoolOperationsPage.noWorkflowActivity')"
      />

      <div v-else class="mt-4 space-y-3">
        <article
          v-for="workflow in recentActivity"
          :key="workflow.id"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 class="font-semibold text-slate-900">
                {{ workflow.sourceLabel || workflow.workflowDefinitionName || t('preschoolOperationsPage.pendingWorkflows') }}
              </h4>
              <p class="mt-1 text-sm text-slate-500">
                {{ workflow.currentStep?.name || workflow.currentStep?.key || workflow.status || '—' }}
                <span class="mx-1">·</span>
                {{ workflow.priority || 'normal' }}
              </p>
            </div>

            <div class="text-right text-xs text-slate-500">
              <div>{{ formatDateTime(workflow.updatedAt) }}</div>
              <div v-if="workflow.sourceType">{{ workflow.sourceType }}</div>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              v-if="router.hasRoute('dashboard-preschool-admin-workflow-details')"
              type="button"
              severity="secondary"
              outlined
              size="small"
              @click="openWorkflow(workflow)"
            >
              {{ t('preschoolOperationsPage.openWorkflow') }}
            </Button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
