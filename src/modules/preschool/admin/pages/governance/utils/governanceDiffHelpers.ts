import { SEVERITY_LEVELS } from '../constants/governanceDiffConstants'

export function severityLabel(severity: string, t: any): string {
  switch (String(severity || 'LOW').toUpperCase()) {
    case SEVERITY_LEVELS.CRITICAL:
      return t('preschoolGovernanceDiffPage.severity.critical')
    case SEVERITY_LEVELS.HIGH:
      return t('preschoolGovernanceDiffPage.severity.high')
    case SEVERITY_LEVELS.MEDIUM:
      return t('preschoolGovernanceDiffPage.severity.medium')
    case SEVERITY_LEVELS.MODERATE:
      return t('preschoolGovernanceDiffPage.severity.moderate')
    default:
      return t('preschoolGovernanceDiffPage.severity.low')
  }
}

export function defaultSnapshotLabel(item: any, t: any): string {
  const parts = [
    item.contextLabel || item.snapshotType || t('preschoolGovernanceDiffPage.selectors.snapshotFallback'),
    item.lifecycleState ? `(${item.lifecycleState})` : '',
    item.generatedAt ? `· ${item.generatedAt}` : '',
  ].filter(Boolean)

  return parts.join(' ')
}

export function defaultExportLabel(item: any, t: any): string {
  const parts = [
    item.contextLabel || item.exportType || t('preschoolGovernanceDiffPage.selectors.exportFallback'),
    item.exportFormat ? `(${item.exportFormat})` : '',
    item.exportedAt ? `· ${item.exportedAt}` : '',
  ].filter(Boolean)

  return parts.join(' ')
}

export function buildSnapshotOptions(items: any[]) {
  return items.map((item) => ({
    label: `${item.contextLabel || item.snapshotType}${item.lifecycleState ? ` (${item.lifecycleState})` : ''}${item.generatedAt ? ` · ${item.generatedAt}` : ''}`,
    value: item.id,
    raw: item,
  }))
}

export function buildExportOptions(items: any[]) {
  return items.map((item) => ({
    label: `${item.contextLabel || item.exportType}${item.exportFormat ? ` (${item.exportFormat})` : ''}${item.exportedAt ? ` · ${item.exportedAt}` : ''}`,
    value: item.id,
    raw: item,
  }))
}

export function normalizeClassItem(item: any) {
  return {
    label: item.name || item.code || `#${item.id}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeStudentItem(item: any) {
  return {
    label: `${item.fullName || item.name}${(item.publicId || item.studentCode) ? ` (${item.publicId || item.studentCode})` : ''}`,
    value: item.id,
    raw: item,
  }
}

export function normalizeReportPeriodItem(item: any) {
  return {
    label: item.label || item.periodLabel || item.period_label,
    value: item.id,
    raw: item,
  }
}

export function buildComparisonModeCatalog(modes: any[], t: any) {
  const available = new Set((modes || []).map((item: any) => item.value))
  const allModes = [
    { value: 'snapshot_vs_snapshot', label: t('preschoolGovernanceDiffPage.modes.snapshotVsSnapshot') },
    { value: 'reconstruction_vs_reconstruction', label: t('preschoolGovernanceDiffPage.modes.reconstructionVsReconstruction') },
    { value: 'academic_year_vs_academic_year', label: t('preschoolGovernanceDiffPage.modes.academicYearVsAcademicYear') },
    { value: 'term_vs_term', label: t('preschoolGovernanceDiffPage.modes.termVsTerm') },
    { value: 'report_period_vs_report_period', label: t('preschoolGovernanceDiffPage.modes.reportPeriodVsReportPeriod') },
    { value: 'class_vs_class', label: t('preschoolGovernanceDiffPage.modes.classVsClass') },
    { value: 'student_progression', label: t('preschoolGovernanceDiffPage.modes.studentProgression') },
    { value: 'report_export_vs_report_export', label: t('preschoolGovernanceDiffPage.modes.reportExportVsReportExport') },
    { value: 'snapshot_version_vs_version', label: t('preschoolGovernanceDiffPage.modes.snapshotVersionVsVersion') },
  ]

  return allModes.filter((mode) => available.size === 0 || available.has(mode.value))
}

export function buildContextTypeOptions(t: any) {
  return [
    { label: t('preschoolGovernanceDiffPage.contextTypes.snapshot'), value: 'snapshot' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.export'), value: 'export' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.reconstruction'), value: 'reconstruction' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.academicYear'), value: 'academic_year' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.term'), value: 'term' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.reportPeriod'), value: 'report_period' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.class'), value: 'class' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.student'), value: 'student' },
    { label: t('preschoolGovernanceDiffPage.contextTypes.system'), value: 'system' },
  ]
}

export function buildSummaryCards(summary: any, t: any) {
  return [
    {
      title: t('preschoolGovernanceDiffPage.summary.totalSnapshots'),
      value: summary?.overview?.totalSnapshots ?? 0,
      caption: t('preschoolGovernanceDiffPage.summary.totalSnapshotsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.summary.totalExports'),
      value: summary?.overview?.totalExports ?? 0,
      caption: t('preschoolGovernanceDiffPage.summary.totalExportsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.summary.totalAudits'),
      value: summary?.overview?.totalAudits ?? 0,
      caption: t('preschoolGovernanceDiffPage.summary.totalAuditsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.summary.blockedWrites'),
      value: summary?.overview?.blockedWrites ?? 0,
      caption: t('preschoolGovernanceDiffPage.summary.blockedWritesCaption'),
    },
  ]
}

export function buildDiffCards(comparison: any, t: any) {
  const metrics = comparison?.summary || {}

  return [
    {
      title: t('preschoolGovernanceDiffPage.cards.totalFieldsChanged'),
      value: metrics.totalFieldsChanged ?? 0,
      caption: t('preschoolGovernanceDiffPage.cards.totalFieldsChangedCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.cards.criticalChanges'),
      value: metrics.criticalChanges ?? 0,
      caption: t('preschoolGovernanceDiffPage.cards.criticalChangesCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.cards.governanceSensitiveChanges'),
      value: metrics.governanceSensitiveChanges ?? 0,
      caption: t('preschoolGovernanceDiffPage.cards.governanceSensitiveChangesCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.cards.integrityWarnings'),
      value: metrics.integrityWarnings ?? 0,
      caption: t('preschoolGovernanceDiffPage.cards.integrityWarningsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.cards.unchangedSections'),
      value: metrics.unchangedSections ?? 0,
      caption: t('preschoolGovernanceDiffPage.cards.unchangedSectionsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.cards.riskScore'),
      value: metrics.riskScore ?? comparison?.riskScore ?? 0,
      caption: `${t('preschoolGovernanceDiffPage.cards.riskScoreCaption')} ${metrics.riskLevel || comparison?.riskLevel || '-'}`,
    },
  ]
}

export function buildOverviewCards(integrityReview: any, t: any) {
  return [
    {
      title: t('preschoolGovernanceDiffPage.integrityOverview.totalEvents'),
      value: integrityReview?.overview?.totalEvents ?? 0,
      caption: t('preschoolGovernanceDiffPage.integrityOverview.totalEventsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.integrityOverview.blockedWrites'),
      value: integrityReview?.overview?.blockedWrites ?? 0,
      caption: t('preschoolGovernanceDiffPage.integrityOverview.blockedWritesCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.integrityOverview.overrideApprovals'),
      value: integrityReview?.overview?.overrideApprovals ?? 0,
      caption: t('preschoolGovernanceDiffPage.integrityOverview.overrideApprovalsCaption'),
    },
    {
      title: t('preschoolGovernanceDiffPage.integrityOverview.snapshotCount'),
      value: integrityReview?.overview?.snapshotCount ?? 0,
      caption: t('preschoolGovernanceDiffPage.integrityOverview.snapshotCountCaption'),
    },
  ]
}

export function enrichRowsWithSeverity(rows: any[], t: any) {
  return (rows || []).map((row: any) => ({
    ...row,
    severityLabel: severityLabel(row.severity, t),
  }))
}

export function mergeTimelines(integrityReview: any, comparison: any) {
  const timeline = [
    ...(integrityReview?.timeline || []),
    ...(integrityReview?.reviewTrail || []),
    ...(comparison?.timeline || []),
    ...(comparison?.reviewTrail || []),
  ]

  return timeline
    .filter((item: any) => item && item.recordedAt)
    .sort((left: any, right: any) => String(right.recordedAt).localeCompare(String(left.recordedAt)))
}
