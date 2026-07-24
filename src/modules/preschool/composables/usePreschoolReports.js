// Keep student reporting state in one composable so the report pages can stay
// focused on rendering finalized assessment summaries and period filters.
import { computed, ref } from 'vue'
import { getCurrentUser } from '@/services/auth'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchMyPreschoolStudents,
  fetchPreschoolStudents,
} from '@/modules/preschool/services/preschoolApi'
import {
  fetchReportPeriods,
  fetchStudentReportPeriod,
  fetchStudentReports,
} from '@/modules/preschool/services/api/preschoolReportsApi'

export const PRESCHOOL_REPORT_PERIOD_TYPE_OPTIONS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Term', value: 'term' },
  { label: 'Annual', value: 'annual' },
]

function normalizeText(value) {
  return String(value ?? '').trim()
}

function buildStudentOptions(items = []) {
  return items.map((item) => ({
    label: `${normalizeText(item.fullName || item.name)}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }))
}

export function usePreschoolReports() {
  const currentUser = computed(() => getCurrentUser() || {})
  const isTeacher = computed(() => String(currentUser.value?.role || '') === 'teacher-preschool')
  const { t } = useLanguage()

  const loading = ref(false)
  const errorMessage = ref('')
  const studentOptions = ref([])
  const reportPeriods = ref([])
  const selectedStudentId = ref('')
  const selectedPeriodType = ref('term')
  const selectedPeriodLabel = ref('')
  const reportBundle = ref({ student: null, periods: [], period: null, report: null })
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
      const loader = isTeacher.value ? fetchMyPreschoolStudents : fetchPreschoolStudents
      const response = await loader({ page: 1, perPage: 100 })
      studentOptions.value = buildStudentOptions(response.items || [])

      if (!selectedStudentId.value) {
        selectedStudentId.value = String(studentOptions.value[0]?.value || '').trim()
      }
    } catch (error) {
      studentOptions.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool report lookup data.'
    } finally {
      loading.value = false
    }
  }

  async function loadReportPeriodOptions(studentId = selectedStudentId.value, periodType = selectedPeriodType.value) {
    const resolvedStudentId = String(studentId || '').trim()
    const resolvedPeriodType = String(periodType || '').trim() || 'term'

    loading.value = true
    errorMessage.value = ''

    try {
      selectedPeriodType.value = resolvedPeriodType
      reportPeriods.value = await fetchReportPeriods(
        resolvedStudentId
          ? { studentId: resolvedStudentId, periodType: resolvedPeriodType }
          : { periodType: resolvedPeriodType },
      )

      const matched = reportPeriods.value.find((period) => String(period.periodType || 'term') === resolvedPeriodType)
      if (!selectedPeriodLabel.value || !reportPeriods.value.some((period) => String(period.label || '') === selectedPeriodLabel.value && String(period.periodType || 'term') === resolvedPeriodType)) {
        selectedPeriodLabel.value = String(matched?.label || reportPeriods.value[0]?.label || '').trim()
      }
    } catch (error) {
      reportPeriods.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool report periods.'
    } finally {
      loading.value = false
    }
  }

  async function loadStudentReport(studentId = selectedStudentId.value, periodLabel = selectedPeriodLabel.value, periodType = selectedPeriodType.value) {
    const resolvedStudentId = String(studentId || '').trim()
    if (!resolvedStudentId) return null

    loading.value = true
    errorMessage.value = ''

    try {
      const normalizedPeriodLabel = String(periodLabel || '').trim()
      const normalizedPeriodType = String(periodType || selectedPeriodType.value || 'term').trim() || 'term'
      const bundle = normalizedPeriodLabel
        ? await fetchStudentReportPeriod(resolvedStudentId, normalizedPeriodLabel, {
          periodType: normalizedPeriodType,
        })
        : await fetchStudentReports(resolvedStudentId, {
          periodType: normalizedPeriodType,
        })

      reportBundle.value = bundle
      reportPeriods.value = bundle.periods || reportPeriods.value
      selectedStudentId.value = resolvedStudentId
      selectedPeriodType.value = bundle.period?.periodType || bundle.periods?.find((period) => period.label === selectedPeriodLabel.value)?.periodType || normalizedPeriodType
      selectedPeriodLabel.value = bundle.period?.label || bundle.periods?.[0]?.label || normalizedPeriodLabel
      return bundle
    } catch (error) {
      reportBundle.value = { student: null, periods: [], period: null, report: null }
      errorMessage.value = error?.message || 'Failed to load Preschool student report.'
      throw error
    } finally {
      loading.value = false
    }
  }

  function setSelectedStudentId(studentId) {
    selectedStudentId.value = String(studentId || '').trim()
  }

  function setSelectedPeriodLabel(periodLabel) {
    selectedPeriodLabel.value = String(periodLabel || '').trim()
  }

  function setSelectedPeriodType(periodType) {
    selectedPeriodType.value = String(periodType || '').trim() || 'term'
  }

  return {
    errorMessage,
    isTeacher,
    loadLookupData,
    loadReportPeriodOptions,
    loadStudentReport,
    loading,
    reportBundle,
    reportPeriods,
    reportPeriodLockMessage,
    isReportPeriodLocked,
    selectedPeriodLabel,
    selectedPeriodType,
    selectedStudentId,
    selectedReportPeriod,
    setSelectedPeriodLabel,
    setSelectedPeriodType,
    setSelectedStudentId,
    studentOptions,
  }
}
