import { computed, ref } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { exportReport } from '@/modules/preschool/services/api/preschoolReportingApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

export function usePreschoolReportSection(fetcher, exportSection, options = {}) {
  const { t } = useLanguage()
  const loading = ref(false)
  const exporting = ref(false)
  const errorMessage = ref('')
  const filters = ref({
    academicYearId: '',
    termId: '',
    dateFrom: '',
    dateTo: '',
    classId: '',
    teacherId: '',
    status: '',
    ...options.defaultFilters,
  })
  const report = ref({
    summary: {},
    cards: [],
    trend: [],
    performance: [],
    completion: [],
    classBreakdown: [],
    studentBreakdown: [],
    rows: [],
    table: [],
    incidents: [],
    alerts: [],
    vaccinations: [],
    revenue: [],
    outstanding: [],
    overdue: [],
    admissions: [],
    issues: [],
    communications: [],
    exportFormats: ['csv'],
    generatedAt: '',
  })
  const selectedFormat = ref('csv')

  const visibleFilters = computed(() => options.visibleFilters || ['academicYear', 'term', 'dateRange', 'class', 'teacher', 'status'])
  const filterOptions = computed(() => options.filterOptions || {})

  async function loadReport() {
    loading.value = true
    errorMessage.value = ''

    try {
      report.value = await fetcher(filters.value)
    } catch (error) {
      report.value = {
        summary: {},
        cards: [],
        trend: [],
        performance: [],
        completion: [],
        classBreakdown: [],
        studentBreakdown: [],
        rows: [],
        table: [],
        incidents: [],
        alerts: [],
        vaccinations: [],
        revenue: [],
        outstanding: [],
        overdue: [],
        admissions: [],
        issues: [],
        communications: [],
        exportFormats: ['csv'],
        generatedAt: '',
      }
      errorMessage.value = normalizeText(error?.message || t('preschoolReportsCenterPage.messages.loadFailed'))
    } finally {
      loading.value = false
    }
  }

  function applyFilters() {
    return loadReport()
  }

  function resetFilters() {
    filters.value = {
      academicYearId: '',
      termId: '',
      dateFrom: '',
      dateTo: '',
      classId: '',
      teacherId: '',
      status: '',
      ...options.defaultFilters,
    }

    return loadReport()
  }

  async function downloadExport() {
    exporting.value = true
    errorMessage.value = ''

    try {
      const payload = await exportReport(exportSection, selectedFormat.value, filters.value)
      if (typeof document !== 'undefined') {
        const mimeType = selectedFormat.value === 'pdf'
          ? 'application/pdf'
          : selectedFormat.value === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv;charset=utf-8'
        const blob = new Blob([payload.content || ''], { type: mimeType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = payload.filename || `${exportSection}-${selectedFormat.value}.csv`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
      return payload
    } catch (error) {
      errorMessage.value = normalizeText(error?.message || t('preschoolReportsCenterPage.messages.exportFailed'))
      throw error
    } finally {
      exporting.value = false
    }
  }

  return {
    applyFilters,
    downloadExport,
    errorMessage,
    exporting,
    filterOptions,
    filters,
    loadReport,
    loading,
    report,
    resetFilters,
    selectedFormat,
    visibleFilters,
  }
}
