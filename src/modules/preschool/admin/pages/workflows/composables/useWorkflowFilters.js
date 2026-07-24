import { reactive } from 'vue'

const DEFAULT_FILTERS = Object.freeze({
  page: 1,
  perPage: 20,
  status: '',
  priority: '',
  search: '',
  sourceType: '',
  workflowDefinitionKey: '',
  assignedToUserId: '',
  assignedRole: '',
})

export function useWorkflowFilters() {
  const filters = reactive({ ...DEFAULT_FILTERS })

  function resetFilters() {
    Object.assign(filters, DEFAULT_FILTERS)
  }

  function cloneFilters() {
    return { ...filters }
  }

  return {
    filters,
    resetFilters,
    cloneFilters,
  }
}
