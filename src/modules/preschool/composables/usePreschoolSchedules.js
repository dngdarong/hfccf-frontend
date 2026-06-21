// Keep Preschool schedule orchestration in one composable so the management
// page can coordinate loading, edits, conflicts, and refreshes without direct
// HTTP calls in the template.
import { computed, ref } from 'vue'
import { getCurrentUser } from '@/services/auth'
import { useLanguage } from '@/composables/useLanguage'
import {
  archiveSchedule,
  createSchedule,
  fetchSchedules,
  updateSchedule,
} from '@/modules/preschool/services/api/preschoolScheduleApi'
import { fetchAcademicLifecycle } from '@/modules/preschool/services/api/preschoolAcademicLifecycleApi'
import { fetchPreschoolClasses, fetchPreschoolTeachers } from '@/modules/preschool/services/preschoolApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function buildClassOptions(items = []) {
  return items.map((item) => ({
    label: `${normalizeText(item.code)} - ${normalizeText(item.name)}`,
    value: item.id,
    raw: item,
  }))
}

function buildTeacherOptions(items = []) {
  return items.map((item) => ({
    label: `${normalizeText(item.fullName || item.name)}${item.username ? ` (${item.username})` : ''}`,
    value: item.id,
    raw: item,
  }))
}

export function usePreschoolSchedules() {
  const currentUser = computed(() => getCurrentUser() || {})
  const { t } = useLanguage()
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const schedules = ref([])
  const pagination = ref({ page: 1, perPage: 10, total: 0, totalPages: 1 })
  const classOptions = ref([])
  const teacherOptions = ref([])
  const selectedSchedule = ref(null)
  const conflicts = ref([])
  const selectedDayOfWeek = ref('')
  const selectedStatus = ref('')
  const selectedClassId = ref('')
  const selectedTeacherId = ref('')
  const searchQuery = ref('')
  const lifecycleContext = ref({})

  async function loadLookups() {
    loading.value = true
    errorMessage.value = ''

    try {
      const [classesResponse, teachersResponse] = await Promise.all([
        fetchPreschoolClasses({ page: 1, perPage: 100 }),
        fetchPreschoolTeachers({ page: 1, perPage: 100 }),
      ])

      classOptions.value = buildClassOptions(classesResponse.items || [])
      teacherOptions.value = buildTeacherOptions(teachersResponse.items || [])
      try {
        const lifecycle = await fetchAcademicLifecycle()
        lifecycleContext.value = lifecycle.currentContext || {}
      } catch {
        lifecycleContext.value = {}
      }
    } catch (error) {
      classOptions.value = []
      teacherOptions.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool schedule lookup data.'
    } finally {
      loading.value = false
    }
  }

  async function loadSchedules(params = {}) {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await fetchSchedules({
        page: params.page ?? pagination.value.page ?? 1,
        perPage: params.perPage ?? pagination.value.perPage ?? 10,
        search: params.search ?? searchQuery.value,
        status: params.status ?? selectedStatus.value,
        classId: params.classId ?? selectedClassId.value,
        teacherUserId: params.teacherUserId ?? selectedTeacherId.value,
        dayOfWeek: params.dayOfWeek ?? selectedDayOfWeek.value,
      })

      schedules.value = response.items || []
      pagination.value = response.pagination || pagination.value
      selectedSchedule.value = null
    } catch (error) {
      schedules.value = []
      pagination.value = { page: 1, perPage: 10, total: 0, totalPages: 1 }
      errorMessage.value = error?.message || 'Failed to load Preschool schedules.'
    } finally {
      loading.value = false
    }
  }

  async function saveSchedule(payload, scheduleId = '') {
    saving.value = true
    errorMessage.value = ''
    conflicts.value = []

    try {
      const result = scheduleId
        ? await updateSchedule(scheduleId, payload)
        : await createSchedule(payload)

      await loadSchedules()
      return result
    } catch (error) {
      conflicts.value = Array.isArray(error?.response?.data?.data?.conflicts)
        ? error.response.data.data.conflicts
        : []
      errorMessage.value = error?.response?.data?.message || error?.message || 'Unable to save the Preschool schedule right now.'
      throw error
    } finally {
      saving.value = false
    }
  }

  async function removeSchedule(scheduleId) {
    if (!scheduleId) return false

    saving.value = true
    errorMessage.value = ''

    try {
      const result = await archiveSchedule(scheduleId)
      await loadSchedules()
      return result
    } catch (error) {
      if (error?.status !== 409) {
        errorMessage.value = error?.message || 'Unable to archive the Preschool schedule right now.'
      } else {
        errorMessage.value = ''
      }
      throw error
    } finally {
      saving.value = false
    }
  }

  function setSelectedSchedule(schedule) {
    selectedSchedule.value = schedule || null
  }

  function setSelectedDayOfWeek(dayOfWeek) {
    selectedDayOfWeek.value = String(dayOfWeek || '').trim()
  }

  function setSelectedStatus(status) {
    selectedStatus.value = String(status || '').trim()
  }

  function setSelectedClassId(classId) {
    selectedClassId.value = String(classId || '').trim()
  }

  function setSelectedTeacherId(teacherId) {
    selectedTeacherId.value = String(teacherId || '').trim()
  }

  function setSearchQuery(search) {
    searchQuery.value = String(search || '')
  }

  const lockedReportStatuses = ['finalized', 'locked', 'archived']
  const isTermLocked = computed(() => ['closed', 'archived'].includes(String(lifecycleContext.value.term_status || '').toLowerCase()))
  const lockMessage = computed(() => {
    const status = String(lifecycleContext.value.term_status || '').toLowerCase()
    const reportPeriodStatus = String(
      lifecycleContext.value.report_period_status || lifecycleContext.value.reportPeriodStatus || '',
    ).toLowerCase()

    if (status === 'closed') {
      return t('preschoolLifecyclePage.messages.termClosed')
    }

    if (status === 'archived') {
      return t('preschoolLifecyclePage.messages.termArchived')
    }

    if (reportPeriodStatus === 'finalized') {
      return t('preschoolLifecyclePage.messages.reportPeriodFinalized')
    }

    if (reportPeriodStatus === 'archived') {
      return t('preschoolLifecyclePage.messages.reportPeriodArchived')
    }

    if (lockedReportStatuses.includes(reportPeriodStatus)) {
      return t('preschoolLifecyclePage.messages.reportPeriodLocked')
    }

    return ''
  })

  const isReportPeriodLocked = computed(() =>
    lockedReportStatuses.includes(
      String(lifecycleContext.value.report_period_status || lifecycleContext.value.reportPeriodStatus || '').toLowerCase(),
    ),
  )

  return {
    archiveSchedule: removeSchedule,
    classOptions,
    conflicts,
    currentUser,
    errorMessage,
    loading,
    loadLookups,
    loadSchedules,
    lifecycleContext,
    isTermLocked,
    isReportPeriodLocked,
    pagination,
    saveSchedule,
    schedules,
    searchQuery,
    selectedClassId,
    selectedDayOfWeek,
    selectedSchedule,
    selectedStatus,
    selectedTeacherId,
    setSearchQuery,
    setSelectedClassId,
    setSelectedDayOfWeek,
    setSelectedSchedule,
    setSelectedStatus,
    setSelectedTeacherId,
    saving,
    teacherOptions,
    lockMessage,
  }
}
