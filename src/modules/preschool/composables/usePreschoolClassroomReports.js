// Keep classroom reporting state separate so the teacher/admin class summary
// page can stay focused on one selected class and one reporting period.
import { computed, ref } from 'vue'
import { getCurrentUser } from '@/services/auth'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchMyPreschoolClasses,
  fetchPreschoolClasses,
} from '@/modules/preschool/services/preschoolApi'
import {
  fetchClassroomReport,
  fetchReportPeriods,
} from '@/modules/preschool/services/api/preschoolReportsApi'

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

export function usePreschoolClassroomReports() {
  const currentUser = computed(() => getCurrentUser() || {})
  const isTeacher = computed(() => String(currentUser.value?.role || '') === 'teacher-preschool')
  const { t } = useLanguage()

  const loading = ref(false)
  const errorMessage = ref('')
  const classOptions = ref([])
  const reportPeriods = ref([])
  const selectedClassId = ref('')
  const selectedPeriodLabel = ref('')
  const reportBundle = ref({ class: null, periods: [], period: null, report: null })
  const selectedReportPeriod = computed(() =>
    reportPeriods.value.find((period) => String(period.label || '') === String(selectedPeriodLabel.value || '')) || null,
  )

  const isReportPeriodLocked = computed(() => ['finalized', 'locked', 'archived'].includes(String(selectedReportPeriod.value?.status || '').toLowerCase()))
  const reportPeriodLockMessage = computed(() => {
    const status = String(selectedReportPeriod.value?.status || '').toLowerCase()

    if (status === 'finalized') {
      return t('preschoolLifecyclePage.messages.reportPeriodFinalized')
    }

    if (status === 'locked') {
      return t('preschoolLifecyclePage.messages.reportPeriodLocked')
    }

    if (status === 'archived') {
      return t('preschoolLifecyclePage.messages.reportPeriodArchived')
    }

    return ''
  })

  async function loadLookupData() {
    loading.value = true
    errorMessage.value = ''

    try {
      const loader = isTeacher.value ? fetchMyPreschoolClasses : fetchPreschoolClasses
      const response = await loader({ page: 1, perPage: 100 })
      classOptions.value = buildClassOptions(response.items || [])

      if (!selectedClassId.value) {
        selectedClassId.value = String(classOptions.value[0]?.value || '').trim()
      }
    } catch (error) {
      classOptions.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool classroom lookup data.'
    } finally {
      loading.value = false
    }
  }

  async function loadReportPeriodOptions(classId = '') {
    const resolvedClassId = String(classId || '').trim()

    loading.value = true
    errorMessage.value = ''

    try {
      reportPeriods.value = await fetchReportPeriods(
        resolvedClassId ? { classId: resolvedClassId } : {},
      )

      if (!selectedPeriodLabel.value) {
        selectedPeriodLabel.value = String(reportPeriods.value[0]?.label || '').trim()
      }
    } catch (error) {
      reportPeriods.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool classroom report periods.'
    } finally {
      loading.value = false
    }
  }

  async function loadClassroomReport(classId = selectedClassId.value, periodLabel = selectedPeriodLabel.value) {
    const resolvedClassId = String(classId || '').trim()
    if (!resolvedClassId) return null

    loading.value = true
    errorMessage.value = ''

    try {
      const normalizedPeriodLabel = String(periodLabel || '').trim()
      const bundle = await fetchClassroomReport(resolvedClassId, normalizedPeriodLabel)

      reportBundle.value = bundle
      reportPeriods.value = bundle.periods || reportPeriods.value
      selectedClassId.value = resolvedClassId
      selectedPeriodLabel.value = bundle.period?.label || bundle.periods?.[0]?.label || normalizedPeriodLabel
      return bundle
    } catch (error) {
      reportBundle.value = { class: null, periods: [], period: null, report: null }
      errorMessage.value = error?.message || 'Failed to load Preschool classroom report.'
      throw error
    } finally {
      loading.value = false
    }
  }

  function setSelectedClassId(classId) {
    selectedClassId.value = String(classId || '').trim()
  }

  function setSelectedPeriodLabel(periodLabel) {
    selectedPeriodLabel.value = String(periodLabel || '').trim()
  }

  return {
    classOptions,
    errorMessage,
    isTeacher,
    loadClassroomReport,
    loadLookupData,
    loadReportPeriodOptions,
    loading,
    reportBundle,
    reportPeriods,
    reportPeriodLockMessage,
    isReportPeriodLocked,
    selectedClassId,
    selectedPeriodLabel,
    selectedReportPeriod,
    setSelectedClassId,
    setSelectedPeriodLabel,
  }
}
