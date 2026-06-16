export const GOVERNANCE_CASE_SOURCES = {
  GOVERNANCE_DIFF: 'governance_diff',
  INTEGRITY_WARNING: 'integrity_warning',
  EXPORT_MISMATCH: 'export_mismatch',
  LIFECYCLE_ANOMALY: 'lifecycle_anomaly',
  RECONSTRUCTION_INCONSISTENCY: 'reconstruction_inconsistency',
  MANUAL_REVIEW: 'manual_review',
}

export const GOVERNANCE_CASE_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const GOVERNANCE_CASE_STATUSES = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  INVESTIGATING: 'investigating',
  AWAITING_EVIDENCE: 'awaiting_evidence',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
}

export const GOVERNANCE_CASE_WORKFLOW_STATUSES = [
  GOVERNANCE_CASE_STATUSES.OPEN,
  GOVERNANCE_CASE_STATUSES.UNDER_REVIEW,
  GOVERNANCE_CASE_STATUSES.INVESTIGATING,
  GOVERNANCE_CASE_STATUSES.AWAITING_EVIDENCE,
]

export const GOVERNANCE_CASE_EVIDENCE_TYPES = {
  MANUAL_NOTE: 'manual_note',
}

export const DEFAULT_CREATE_FORM = {
  title: '',
  summary: '',
  sourceType: GOVERNANCE_CASE_SOURCES.MANUAL_REVIEW,
  sourceReference: '',
  severity: GOVERNANCE_CASE_SEVERITIES.MEDIUM,
  riskScore: 50,
  status: GOVERNANCE_CASE_STATUSES.OPEN,
  isUrgent: false,
  urgentReason: '',
  ownerUserId: '',
  reviewerUserId: '',
  escalationOfficerUserId: '',
  dueDate: '',
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  latestNote: '',
  resolutionNote: '',
}

export const DEFAULT_ASSIGNMENT_FORM = {
  ownerUserId: '',
  reviewerUserId: '',
  escalationOfficerUserId: '',
  status: '',
  dueDate: '',
  note: '',
}

export const DEFAULT_EVIDENCE_FORM = {
  evidenceType: GOVERNANCE_CASE_EVIDENCE_TYPES.MANUAL_NOTE,
  evidenceReference: '',
  evidenceLabel: '',
  evidenceDescription: '',
  metadataText: '',
}

export const DEFAULT_RESOLUTION_FORM = {
  resolutionNote: '',
  closureNote: '',
  reopenReason: '',
  escalationReason: '',
}

export const DEFAULT_FILTERS = {
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  ownerUserId: '',
  reviewerUserId: '',
  escalationOfficerUserId: '',
  status: '',
  severity: '',
  sourceType: '',
  sourceReference: '',
  isUrgent: '',
  dueFrom: '',
  dueTo: '',
  createdFrom: '',
  createdTo: '',
  updatedFrom: '',
  updatedTo: '',
  search: '',
}

export const LIST_PAGINATION = {
  page: 1,
  perPage: 20,
}
