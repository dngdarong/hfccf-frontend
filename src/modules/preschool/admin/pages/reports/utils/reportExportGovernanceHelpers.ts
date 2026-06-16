import { CSV_MIME_TYPE, CSV_FILENAME_PREFIX } from '../constants/reportExportGovernanceConstants'

export function buildExportTypeOptions(t: any) {
  return [
    { label: t('preschoolExportGovernancePage.exportTypes.all'), value: '' },
    { label: t('preschoolExportGovernancePage.exportTypes.snapshotArchive'), value: 'snapshot_archive' },
    { label: t('preschoolExportGovernancePage.exportTypes.studentReport'), value: 'student_report' },
    { label: t('preschoolExportGovernancePage.exportTypes.classroomReport'), value: 'classroom_report' },
    { label: t('preschoolExportGovernancePage.exportTypes.progressSummary'), value: 'progress_summary' },
    { label: t('preschoolExportGovernancePage.exportTypes.institutionalSummary'), value: 'institutional_summary' },
  ]
}

export function buildExportFormatOptions(t: any) {
  return [
    { label: t('preschoolExportGovernancePage.exportFormats.all'), value: '' },
    { label: t('preschoolExportGovernancePage.exportFormats.csv'), value: 'csv' },
  ]
}

export function buildSourceOptions(t: any) {
  return [
    { label: t('preschoolExportGovernancePage.exportSources.all'), value: '' },
    { label: t('preschoolExportGovernancePage.exportSources.snapshot'), value: 'snapshot' },
    { label: t('preschoolExportGovernancePage.exportSources.live'), value: 'live' },
  ]
}

export function buildAcademicYearOptions(t: any, academicYears: any[]) {
  return [
    { label: t('preschoolExportGovernancePage.filters.allAcademicYears'), value: '' },
    ...(academicYears || []).map((year) => ({
      label: year.label || year.code || `#${year.id}`,
      value: String(year.id || ''),
    })),
  ]
}

export function buildTermOptions(t: any, terms: any[]) {
  return [
    { label: t('preschoolExportGovernancePage.filters.allTerms'), value: '' },
    ...(terms || []).map((term) => ({
      label: term.name || term.code || `#${term.id}`,
      value: String(term.id || ''),
    })),
  ]
}

export function buildReportPeriodFilterOptions(t: any, reportPeriodOptions: any[]) {
  return [
    { label: t('preschoolExportGovernancePage.filters.allReportPeriods'), value: '' },
    ...(reportPeriodOptions || []).map((item) => ({
      label: item.label,
      value: String(item.value),
    })),
  ]
}

export function buildActorFilterOptions(t: any, actorCounts: any[]) {
  return [
    { label: t('preschoolExportGovernancePage.filters.allActors'), value: '' },
    ...((actorCounts || []).map((item) => ({
      label: item.actorName ? `${item.actorName}${item.actorRole ? ` (${item.actorRole})` : ''}` : `#${item.actorUserId || '-'}`,
      value: String(item.actorUserId || ''),
    }))),
  ]
}

export function buildSummaryCards(t: any, analytics: any) {
  return [
    {
      title: t('preschoolExportGovernancePage.overview.totalExports'),
      value: analytics.overview?.totalExports ?? 0,
      caption: t('preschoolExportGovernancePage.overview.totalExportsCaption'),
    },
    {
      title: t('preschoolExportGovernancePage.overview.snapshotExports'),
      value: analytics.overview?.snapshotExports ?? 0,
      caption: t('preschoolExportGovernancePage.overview.snapshotExportsCaption'),
    },
    {
      title: t('preschoolExportGovernancePage.overview.liveExports'),
      value: analytics.overview?.liveExports ?? 0,
      caption: t('preschoolExportGovernancePage.overview.liveExportsCaption'),
    },
    {
      title: t('preschoolExportGovernancePage.overview.csvExports'),
      value: analytics.overview?.csvExports ?? 0,
      caption: t('preschoolExportGovernancePage.overview.csvExportsCaption'),
    },
  ]
}

export function buildClassOptions(classes: any[]) {
  return (classes || []).map((item) => ({
    label: item.name || item.code || `#${item.id}`,
    value: item.id,
    raw: item,
  }))
}

export function buildStudentOptions(students: any[]) {
  return (students || []).map((item) => ({
    label: `${item.fullName || item.name}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }))
}

export function buildReportPeriodOptions(periods: any[]) {
  return (periods || []).map((period) => ({
    label: `${period.label || period.periodLabel || period.period_label}${period.status ? ` (${period.status})` : ''}`,
    value: period.id,
    raw: period,
  }))
}

export function exportQuery(filters: any) {
  return {
    exportType: filters.exportType,
    exportFormat: filters.exportFormat,
    academicYearId: filters.academicYearId,
    termId: filters.termId,
    reportPeriodId: filters.reportPeriodId,
    actorUserId: filters.actorUserId,
    source: filters.source,
    exportedFrom: filters.exportedFrom,
    exportedTo: filters.exportedTo,
    search: filters.search,
  }
}

export function downloadCsvFile(record: any) {
  try {
    const blob = record.blob instanceof Blob ? record.blob : new Blob([record.blob], { type: CSV_MIME_TYPE })
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = record.fileName || `${CSV_FILENAME_PREFIX}-${record.id}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectUrl)
    return true
  } catch {
    return false
  }
}

export function initializeAnalytics(defaultAnalytics: any) {
  return { ...defaultAnalytics }
}

export function initializeComparisonOptions(defaultOptions: any) {
  return { ...defaultOptions }
}
