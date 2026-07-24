import { ref } from 'vue'
import {
  fetchCoachEquipmentAssignment,
  fetchCoachEquipmentAssignments,
  fetchEquipmentAssignment,
  fetchEquipmentAssignments,
  fetchEquipmentItemAssignments,
  fetchTeamEquipmentAssignments,
} from '@/modules/sport/services/api/sportEquipmentApi'

function resolveRole(role) {
  if (role && typeof role === 'object' && 'value' in role) return role.value
  return typeof role === 'function' ? role() : role
}

function createPagination() {
  return { page: 1, perPage: 5, total: 0, totalPages: 1 }
}

export function useSportEquipmentAssignments(options = {}) {
  const assignments = ref([])
  const selectedAssignment = ref(null)
  const loading = ref(false)
  const detailLoading = ref(false)
  const error = ref('')
  const pagination = ref(createPagination())
  const filters = ref({ ...options.filters })
  let requestSequence = 0

  function isCoach() {
    return resolveRole(options.role || 'admin') === 'coach'
  }

  function beginRequest() {
    requestSequence += 1
    return requestSequence
  }

  async function fetchAssignments(nextFilters = {}) {
    const sequence = beginRequest()
    filters.value = { ...filters.value, ...nextFilters }
    loading.value = true
    error.value = ''

    try {
      const response = isCoach()
        ? await fetchCoachEquipmentAssignments({ ...filters.value })
        : await fetchEquipmentAssignments({ ...filters.value })

      if (sequence !== requestSequence) return response

      assignments.value = response.items || []
      pagination.value = response.pagination || createPagination()
      return response
    } catch (requestError) {
      if (sequence === requestSequence) {
        assignments.value = []
        pagination.value = createPagination()
        error.value = requestError
      }
      throw requestError
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  async function fetchAssignment(id) {
    detailLoading.value = true
    error.value = ''

    try {
      const assignment = isCoach()
        ? await fetchCoachEquipmentAssignment(id)
        : await fetchEquipmentAssignment(id)
      selectedAssignment.value = assignment
      return assignment
    } catch (requestError) {
      error.value = requestError
      selectedAssignment.value = null
      throw requestError
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchEquipmentAssignmentsForItem(equipmentItemId, nextFilters = {}) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchEquipmentItemAssignments(equipmentItemId, { ...filters.value, ...nextFilters })
      assignments.value = response.items || []
      pagination.value = response.pagination || createPagination()
      return response
    } catch (requestError) {
      error.value = requestError
      assignments.value = []
      pagination.value = createPagination()
      throw requestError
    } finally {
      loading.value = false
    }
  }

  async function fetchTeamAssignments(teamId, nextFilters = {}) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetchTeamEquipmentAssignments(teamId, { ...filters.value, ...nextFilters })
      assignments.value = response.items || []
      pagination.value = response.pagination || createPagination()
      return response
    } catch (requestError) {
      error.value = requestError
      assignments.value = []
      pagination.value = createPagination()
      throw requestError
    } finally {
      loading.value = false
    }
  }

  function clearSelectedAssignment() {
    selectedAssignment.value = null
  }

  function resetFilters() {
    filters.value = {}
    pagination.value = createPagination()
  }

  return {
    assignments,
    selectedAssignment,
    loading,
    detailLoading,
    error,
    pagination,
    filters,
    fetchAssignments,
    fetchAssignment,
    fetchEquipmentAssignments: fetchEquipmentAssignmentsForItem,
    fetchEquipmentItemAssignments: fetchEquipmentAssignmentsForItem,
    fetchTeamAssignments,
    clearSelectedAssignment,
    resetFilters,
  }
}
