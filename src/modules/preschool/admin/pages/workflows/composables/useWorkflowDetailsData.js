import { computed, ref } from 'vue'
import {
  fetchPreschoolWorkflow,
  fetchPreschoolWorkflowDefinitions,
  fetchPreschoolWorkflowTimeline,
} from '@/modules/preschool/services/api/preschoolWorkflowApi'

export function useWorkflowDetailsData() {
  const loading = ref(false)
  const errorMessage = ref('')
  const workflow = ref(null)
  const timeline = ref([])
  const definitions = ref([])
  const approvals = ref([])

  const sourceTypeLabel = computed(() => workflow.value?.sourceLabel || workflow.value?.sourceType || '—')
  const currentStep = computed(() => workflow.value?.currentStep?.name || workflow.value?.currentStep?.key || '—')

  async function loadWorkflowDetails(id) {
    if (!id) {
      workflow.value = null
      timeline.value = []
      approvals.value = []
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const [workflowResponse, timelineResponse, definitionsResponse] = await Promise.all([
        fetchPreschoolWorkflow(id),
        fetchPreschoolWorkflowTimeline(id),
        fetchPreschoolWorkflowDefinitions(),
      ])

      workflow.value = workflowResponse.workflow || null
      timeline.value = timelineResponse.timeline || workflow.value?.timeline || []
      approvals.value = workflow.value?.approvals || []
      definitions.value = definitionsResponse.definitions || []
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || error?.message || 'Unable to load workflow details.'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    workflow,
    timeline,
    definitions,
    approvals,
    sourceTypeLabel,
    currentStep,
    loadWorkflowDetails,
  }
}
