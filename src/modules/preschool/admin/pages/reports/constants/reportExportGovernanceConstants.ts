export const ROUTE_NAMES = {
  SNAPSHOT_ARCHIVE: 'dashboard-preschool-admin-report-snapshots',
  AUDIT_LOGS: 'dashboard-preschool-admin-lifecycle-audit',
}

export const DEFAULT_FILTERS = {
  exportType: '',
  exportFormat: '',
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  actorUserId: '',
  source: '',
  exportedFrom: '',
  exportedTo: '',
  search: '',
}

export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 20,
  total: 0,
  totalPages: 1,
}

export const DEFAULT_ANALYTICS = {
  overview: {},
  actorCounts: [],
  sourceCounts: {},
  exportTrend: [],
  recentSnapshotCount: 0,
}

export const DEFAULT_COMPARISON_OPTIONS = {
  comparisonModes: [],
  metricGroups: [],
  filters: {},
}

export const CSV_MIME_TYPE = 'text/csv;charset=utf-8;'
export const CSV_FILENAME_PREFIX = 'preschool-export'
