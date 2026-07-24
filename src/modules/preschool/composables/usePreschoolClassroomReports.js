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

export const PRESCHOOL_CLASSROOM_REPORT_PERIOD_TYPE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Term', value: 'term' },
  { label: 'Annual', value: 'annual' },
]

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
  const selectedPeriodType = ref('term')
  const selectedPeriodLabel = ref('')
  const reportBundle = ref({ class: null, periods: [], period: null, report: null })
  const selectedReportPeriod = computed(() =>
    reportPeriods.value.find((period) =>
      String(period.label || '') === String(selectedPeriodLabel.value || '')
      && String(period.periodType || 'term') === String(selectedPeriodType.value || 'term')) || null,
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

  async function loadReportPeriodOptions(classId = selectedClassId.value, periodType = selectedPeriodType.value) {
    const resolvedClassId = String(classId || '').trim()
    const resolvedPeriodType = String(periodType || '').trim() || 'term'

    loading.value = true
    errorMessage.value = ''

    try {
      selectedPeriodType.value = resolvedPeriodType
      reportPeriods.value = await fetchReportPeriods(
        resolvedClassId
          ? { classId: resolvedClassId, periodType: resolvedPeriodType }
          : { periodType: resolvedPeriodType },
      )

      const matched = reportPeriods.value.find((period) => String(period.periodType || 'term') === resolvedPeriodType)
      if (!selectedPeriodLabel.value || !reportPeriods.value.some((period) => String(period.label || '') === selectedPeriodLabel.value && String(period.periodType || 'term') === resolvedPeriodType)) {
        selectedPeriodLabel.value = String(matched?.label || reportPeriods.value[0]?.label || '').trim()
      }
    } catch (error) {
      reportPeriods.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool classroom report periods.'
    } finally {
      loading.value = false
    }
  }

  async function loadClassroomReport(classId = selectedClassId.value, periodLabel = selectedPeriodLabel.value, periodType = selectedPeriodType.value) {
    const resolvedClassId = String(classId || '').trim()
    if (!resolvedClassId) return null

    loading.value = true
    errorMessage.value = ''

    try {
      const normalizedPeriodLabel = String(periodLabel || '').trim()
      const normalizedPeriodType = String(periodType || selectedPeriodType.value || 'term').trim() || 'term'
      const bundle = normalizedPeriodLabel
        ? await fetchClassroomReport(resolvedClassId, normalizedPeriodLabel, {
          periodType: normalizedPeriodType,
        })
        : await fetchClassroomReport(resolvedClassId, '', {
          periodType: normalizedPeriodType,
        })

      reportBundle.value = bundle
      reportPeriods.value = bundle.periods || reportPeriods.value
      selectedClassId.value = resolvedClassId
      selectedPeriodType.value = bundle.period?.periodType || bundle.periods?.find((period) => period.label === selectedPeriodLabel.value)?.periodType || normalizedPeriodType
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

  function setSelectedPeriodType(periodType) {
    selectedPeriodType.value = String(periodType || '').trim() || 'term'
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
    selectedPeriodType,
    selectedReportPeriod,
    setSelectedClassId,
    setSelectedPeriodLabel,
    setSelectedPeriodType,
  }
}
