import { computed, ref } from 'vue'
import { fetchPreschoolOperationsDashboard } from '@/modules/preschool/services/api/preschoolOperationsApi'

const defaultOperations = {
  scope: 'operations',
  summary: {},
  today: {},
  attendance: {},
  sessions: {},
  alerts: {},
  guardianCommunications: {},
  health: {},
  payments: {},
  assessments: {},
  teachers: {},
  students: {},
  risks: {},
  workflows: {
    summary: {},
    items: [],
    recentActivity: [],
  },
  timeline: [],
  quickActions: [],
  generatedAt: '',
}

export function useOperationsData() {
  const loading = ref(false)
  const errorMessage = ref('')
  const operations = ref({ ...defaultOperations })

  async function loadOperations(filters = {}) {
    loading.value = true
    errorMessage.value = ''

    try {
      operations.value = await fetchPreschoolOperationsDashboard(filters)
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || error?.message || 'Failed to load operations dashboard.'
    } finally {
      loading.value = false
    }
  }

  const hasOperationsData = computed(() => {
    const value = operations.value || {}
    return Boolean(
      Object.keys(value.summary || {}).length
      || Object.keys(value.today || {}).length
      || Object.keys(value.attendance || {}).length
      || Object.keys(value.sessions || {}).length
      || Object.keys(value.alerts || {}).length
      || Object.keys(value.guardianCommunications || {}).length
      || Object.keys(value.health || {}).length
      || Object.keys(value.payments || {}).length
      || Object.keys(value.assessments || {}).length
      || Object.keys(value.teachers || {}).length
      || Object.keys(value.students || {}).length
      || Object.keys(value.risks || {}).length
      || Object.keys(value.workflows?.summary || {}).length
      || (value.workflows?.items || []).length
      || (value.workflows?.recentActivity || []).length
      || (value.timeline || []).length
      || (value.quickActions || []).length,
    )
  })

  return {
    loading,
    errorMessage,
    operations,
    hasOperationsData,
    loadOperations,
  }
}
