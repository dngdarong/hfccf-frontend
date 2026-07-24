import { computed, ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import {
  fetchPreschoolWorkflowApprovals,
  fetchPreschoolWorkflowDefinitions,
  fetchPreschoolWorkflowSummary,
  fetchPreschoolWorkflows,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

function normalizeTimestamp(value) {
  return String(value ?? '').trim()
}

function latestTimestamp(values) {
  return values
    .map((value) => normalizeTimestamp(value))
    .filter(Boolean)
    .sort((left, right) => String(right).localeCompare(String(left)))[0] || ''
}

function collectWorkflowTimeline(workflows = []) {
  return workflows
    .flatMap((workflow) => {
      if (!Array.isArray(workflow?.timeline)) {
        return []
      }

      return workflow.timeline.map((event) => ({
        ...event,
        workflowId: workflow.id,
        workflowLabel: workflow.sourceLabel || workflow.workflowDefinitionName || workflow.workflowDefinitionKey || '',
      }))
    })
    .filter(Boolean)
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
}

export function useWorkflowData() {
  const userStore = useUserStore()
  const loading = ref(false)
  const errorMessage = ref('')
  const definitions = ref([])
  const summary = ref({
    total: 0,
    pendingWorkflows: 0,
    open: 0,
    inProgress: 0,
    pendingApproval: 0,
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
    completed: 0,
    cancelled: 0,
    escalated: 0,
    overdue: 0,
    myAssignments: 0,
    assignedToMe: 0,
    myApprovals: 0,
    byDefinition: [],
    byStatus: [],
    byPriority: [],
    recentlyUpdatedWorkflows: 0,
  })
  const workflows = ref([])
  const approvals = ref([])
  const pagination = ref(null)
  const approvalsPagination = ref(null)
  const timelinePreview = ref([])
  const generatedAt = ref('')

  const myAssignments = computed(() => {
    const currentUserId = String(userStore.currentUser?.id ?? '')
    const currentRole = String(userStore.currentUser?.role_code ?? userStore.currentUser?.role ?? '')

    return workflows.value.filter((workflow) => {
      const assignedUserId = String(workflow.assignedToUserId ?? '')
      const assignedRole = String(workflow.assignedRole ?? '')

      return (currentUserId && assignedUserId && assignedUserId === currentUserId)
        || (currentRole && assignedRole && assignedRole === currentRole)
    })
  })

  const overdueWorkflows = computed(() => workflows.value.filter((workflow) => workflow.status === 'overdue'))
  const escalatedWorkflows = computed(() => workflows.value.filter((workflow) => workflow.status === 'escalated'))
  const recentlyUpdatedWorkflows = computed(() => [...workflows.value]
    .sort((left, right) => String(right.updatedAt || right.createdAt || '').localeCompare(String(left.updatedAt || left.createdAt || '')))
    .slice(0, 8))

  const recentTimelineEvents = computed(() => timelinePreview.value.slice(0, 8))

  async function loadWorkflows(filters = {}) {
    loading.value = true
    errorMessage.value = ''

    try {
      const [
        definitionsResponse,
        workflowsResponse,
        summaryResponse,
        approvalsResponse,
      ] = await Promise.all([
        fetchPreschoolWorkflowDefinitions(),
        fetchPreschoolWorkflows(filters),
        fetchPreschoolWorkflowSummary(filters),
        fetchPreschoolWorkflowApprovals(filters),
      ])

      definitions.value = definitionsResponse.definitions || []
      workflows.value = workflowsResponse.items || []
      summary.value = summaryResponse
      approvals.value = approvalsResponse.items || []
      pagination.value = workflowsResponse.pagination || null
      approvalsPagination.value = approvalsResponse.pagination || null
      timelinePreview.value = collectWorkflowTimeline(workflows.value)
      generatedAt.value = latestTimestamp([
        summaryResponse.generatedAt,
        workflowsResponse.items?.[0]?.updatedAt,
        approvalsResponse.items?.[0]?.updatedAt,
        ...workflowsResponse.items.map((workflow) => workflow.updatedAt || workflow.createdAt),
      ])
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || error?.message || 'Unable to load workflows.'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    definitions,
    summary,
    workflows,
    approvals,
    pagination,
    approvalsPagination,
    timelinePreview,
    generatedAt,
    myAssignments,
    overdueWorkflows,
    escalatedWorkflows,
    recentlyUpdatedWorkflows,
    recentTimelineEvents,
    loadWorkflows,
  }
}

export { collectWorkflowTimeline }
