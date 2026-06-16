export const COMPARISON_MODES = {
  SNAPSHOT_VS_SNAPSHOT: 'snapshot_vs_snapshot',
  RECONSTRUCTION_VS_RECONSTRUCTION: 'reconstruction_vs_reconstruction',
  ACADEMIC_YEAR_VS_ACADEMIC_YEAR: 'academic_year_vs_academic_year',
  TERM_VS_TERM: 'term_vs_term',
  REPORT_PERIOD_VS_REPORT_PERIOD: 'report_period_vs_report_period',
  CLASS_VS_CLASS: 'class_vs_class',
  STUDENT_PROGRESSION: 'student_progression',
  REPORT_EXPORT_VS_REPORT_EXPORT: 'report_export_vs_report_export',
  SNAPSHOT_VERSION_VS_VERSION: 'snapshot_version_vs_version',
}

export const CONTEXT_TYPES = {
  SNAPSHOT: 'snapshot',
  EXPORT: 'export',
  RECONSTRUCTION: 'reconstruction',
  ACADEMIC_YEAR: 'academic_year',
  TERM: 'term',
  REPORT_PERIOD: 'report_period',
  CLASS: 'class',
  STUDENT: 'student',
  SYSTEM: 'system',
}

export const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  MODERATE: 'MODERATE',
  LOW: 'LOW',
}

export const DEFAULT_LEFT_CONTEXT = {
  contextType: CONTEXT_TYPES.SNAPSHOT,
  snapshotId: '',
  exportRecordId: '',
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  search: '',
}

export const DEFAULT_RIGHT_CONTEXT = {
  contextType: CONTEXT_TYPES.SNAPSHOT,
  snapshotId: '',
  exportRecordId: '',
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  search: '',
}

export const DEFAULT_SUMMARY = {
  overview: {},
  comparisonModes: [],
  severityBands: [],
  reviewActions: [],
  retentionReview: {},
  filters: {},
}

export const DEFAULT_COMPARISON = {
  comparisonMode: '',
  reviewKey: '',
  left: {},
  right: {},
  summary: {},
  rows: [],
  warnings: [],
  mismatches: [],
  integrityWarnings: [],
  riskScore: 0,
  riskLevel: '',
  timeline: [],
  auditEvidence: {},
  reviewStatus: 'open',
  reviewTrail: [],
}

export const DEFAULT_INTEGRITY_REVIEW = {
  overview: {},
  warnings: [],
  mismatches: [],
  integrityWarnings: [],
  riskScore: 0,
  riskLevel: '',
  timeline: [],
  retentionReview: {},
  reviewKey: '',
  reviewStatus: 'open',
  reviewTrail: [],
}
