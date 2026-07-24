// Keep Preschool report mapping isolated so the report pages can stay focused
// on rendering stable summary data instead of chasing backend payload changes.

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeSnapshotSummary(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    generatedAt: row.generatedAt || row.generated_at || '',
    generatedByUserId: row.generatedByUserId ?? row.generated_by_user_id ?? '',
    snapshotState: normalizeText(row.snapshotState || row.snapshot_state),
    snapshotVersion: normalizeNumber(row.snapshotVersion ?? row.snapshot_version),
    studentReportSnapshots: normalizeNumber(row.studentReportSnapshots ?? row.student_report_snapshots),
    classroomReportSnapshots: normalizeNumber(row.classroomReportSnapshots ?? row.classroom_report_snapshots),
    progressSummarySnapshots: normalizeNumber(row.progressSummarySnapshots ?? row.progress_summary_snapshots),
    raw: row,
  }
}

function normalizeReportSnapshot(row = {}) {
  if (!row || typeof row !== 'object') {
    return null
  }

  return {
    snapshotType: normalizeText(row.snapshotType || row.snapshot_type),
    studentId: row.studentId ?? row.student_id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    termId: row.termId ?? row.term_id ?? '',
    reportPeriodId: row.reportPeriodId ?? row.report_period_id ?? '',
    generatedByUserId: row.generatedByUserId ?? row.generated_by_user_id ?? '',
    lifecycleState: normalizeText(row.lifecycleState || row.lifecycle_state),
    snapshotVersion: normalizeNumber(row.snapshotVersion ?? row.snapshot_version),
    generatedAt: row.generatedAt || row.generated_at || '',
    lockedAt: row.lockedAt || row.locked_at || '',
    payload: row.payload || row.snapshot_payload || null,
    raw: row,
  }
}

export function normalizeReportPeriod(row = {}) {
  const status = normalizeText(row.status || 'draft').toLowerCase()

  return {
    id: row.id ?? '',
    label: normalizeText(row.label || row.periodLabel || row.period_label),
    periodType: normalizeText(row.periodType || row.period_type || 'term').toLowerCase() || 'term',
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    academicYear: normalizeText(row.academicYear || row.academic_year || row.academic_year_label),
    academicYearCode: normalizeText(row.academicYearCode || row.academic_year_code),
    termId: row.termId ?? row.term_id ?? '',
    termLabel: normalizeText(row.termLabel || row.term_label),
    termCode: normalizeText(row.termCode || row.term_code),
    fromDate: row.fromDate || row.from_date || '',
    toDate: row.toDate || row.to_date || '',
    latestAssessmentDate: row.latestAssessmentDate || row.latest_assessment_date || row.toDate || row.to_date || '',
    assessmentCount: normalizeNumber(row.assessmentCount ?? row.assessment_count),
    studentCount: normalizeNumber(row.studentCount ?? row.student_count),
    classCount: normalizeNumber(row.classCount ?? row.class_count),
    status,
    lockedAt: row.lockedAt || row.locked_at || '',
    finalizedAt: row.finalizedAt || row.finalized_at || '',
    archivedAt: row.archivedAt || row.archived_at || '',
    lockedByUserId: row.lockedByUserId ?? row.locked_by_user_id ?? row.lockedByUserId ?? row.locked_by ?? '',
    finalizedByUserId: row.finalizedByUserId ?? row.finalized_by_user_id ?? row.finalized_by ?? '',
    archivedByUserId: row.archivedByUserId ?? row.archived_by_user_id ?? row.archived_by ?? '',
    notes: normalizeText(row.notes),
    isDraft: status === 'draft',
    isActive: status === 'active',
    isFinalized: status === 'finalized',
    isLocked: status === 'locked',
    isArchived: status === 'archived',
    summarySnapshot: normalizeSnapshotSummary(row.summarySnapshot || row.summary_snapshot),
    reportSnapshot: normalizeSnapshotSummary(row.reportSnapshot || row.report_snapshot),
    raw: row,
  }
}

function normalizeStudentSnapshot(row = {}) {
  const firstName = normalizeText(row.firstName || row.first_name)
  const lastName = normalizeText(row.lastName || row.last_name)
  const fullName = normalizeText(row.fullName || row.full_name || `${firstName} ${lastName}`)

  return {
    id: row.id ?? '',
    publicId: normalizeText(row.publicId || row.public_id),
    studentCode: normalizeText(row.studentCode || row.student_code),
    firstName,
    lastName,
    fullName,
    name: normalizeText(row.name || fullName),
    gender: normalizeText(row.gender),
    dateOfBirth: row.dateOfBirth || row.date_of_birth || '',
    guardianName: normalizeText(row.guardianName || row.guardian_name),
    guardianPhone: normalizeText(row.guardianPhone || row.guardian_phone),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeClassSnapshot(row = {}) {
  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    name: normalizeText(row.name),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherDisplayName: normalizeText(row.teacherDisplayName || row.teacher_display_name),
    level: normalizeText(row.level),
    schedule: normalizeText(row.schedule),
    room: normalizeText(row.room),
    status: normalizeText(row.status),
    raw: row,
  }
}

function normalizeAttendanceSummary(row = {}) {
  return {
    attendanceCount: normalizeNumber(row.attendanceCount ?? row.attendance_count),
    presentCount: normalizeNumber(row.presentCount ?? row.present_count),
    lateCount: normalizeNumber(row.lateCount ?? row.late_count),
    absentCount: normalizeNumber(row.absentCount ?? row.absent_count),
    excusedCount: normalizeNumber(row.excusedCount ?? row.excused_count),
    latestAttendanceDate: row.latestAttendanceDate || row.latest_attendance_date || '',
    raw: row,
  }
}

function normalizeCategorySummary(row = {}) {
  return {
    count: normalizeNumber(row.count),
    averageScore: row.averageScore ?? row.average_score ?? null,
    latestAssessmentDate: row.latestAssessmentDate || row.latest_assessment_date || '',
    observationCount: normalizeNumber(row.observationCount ?? row.observation_count),
    raw: row,
  }
}

function normalizeObservation(row = {}) {
  return {
    assessmentId: row.assessmentId ?? row.assessment_id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name),
    assessmentDate: row.assessmentDate || row.assessment_date || '',
    observation: normalizeText(row.observation),
    teacherComment: normalizeText(row.teacherComment || row.teacher_comment),
    assessedByName: normalizeText(row.assessedByName || row.assessed_by_name),
    rating: normalizeText(row.rating),
    score: row.score ?? null,
    raw: row,
  }
}

function normalizeStudentSummary(row = {}) {
  return {
    student: row.student ? normalizeStudentSnapshot(row.student) : null,
    assessmentCount: normalizeNumber(row.assessmentCount ?? row.assessment_count),
    averageScore: row.averageScore ?? row.average_score ?? null,
    latestAssessmentDate: row.latestAssessmentDate || row.latest_assessment_date || '',
    attendanceSummary: normalizeAttendanceSummary(row.attendanceSummary || row.attendance_summary || {}),
    raw: row,
  }
}

function normalizeReportPayload(row = {}) {
  const summary = row.summary || row.data?.summary || {}
  const scoreSummary = row.scoreSummary || row.score_summary || {}
  const sourceAttendance = row.attendanceSummary || row.attendance_summary || {}
  const sourceCategories = row.categorySummaries || row.category_summaries || []
  const sourceObservations = row.observations || row.data?.observations || []
  const sourceStudentSummaries = row.studentSummaries || row.student_summaries || []

  return {
    summary: {
      finalizedAssessments: normalizeNumber(summary.finalizedAssessments ?? summary.finalized_assessments),
      averageScore: summary.averageScore ?? summary.average_score ?? null,
      latestAssessmentDate: summary.latestAssessmentDate || summary.latest_assessment_date || '',
      observationCount: normalizeNumber(summary.observationCount ?? summary.observation_count),
      studentCount: normalizeNumber(summary.studentCount ?? summary.student_count),
    },
    scoreSummary: {
      categorySummaries: Array.isArray(scoreSummary.categorySummaries || scoreSummary.category_summaries)
        ? (scoreSummary.categorySummaries || scoreSummary.category_summaries).map(normalizeCategorySummary)
        : [],
      overallScore: scoreSummary.overallScore ?? scoreSummary.overall_score ?? null,
      grade: normalizeText(scoreSummary.grade),
      passingScore: scoreSummary.passingScore ?? scoreSummary.passing_score ?? null,
      isPassing: Boolean(scoreSummary.isPassing ?? scoreSummary.is_passing),
      calculationMethod: normalizeText(scoreSummary.calculationMethod || scoreSummary.calculation_method),
      includedAssessments: normalizeNumber(scoreSummary.includedAssessments ?? scoreSummary.included_assessments),
      averageScore: scoreSummary.averageScore ?? scoreSummary.average_score ?? null,
    },
    attendanceSummary: normalizeAttendanceSummary(sourceAttendance),
    categorySummaries: Array.isArray(sourceCategories) ? sourceCategories.map(normalizeCategorySummary) : [],
    observations: Array.isArray(sourceObservations) ? sourceObservations.map(normalizeObservation) : [],
    studentSummaries: Array.isArray(sourceStudentSummaries) ? sourceStudentSummaries.map(normalizeStudentSummary) : [],
    generatedAt: row.generatedAt || row.generated_at || '',
    source: normalizeText(row.source || row.data?.source || 'live') || 'live',
    snapshot: normalizeReportSnapshot(row.snapshot || row.data?.snapshot || null),
    frozen: Boolean(row.frozen || row.data?.frozen || false),
    raw: row,
  }
}

function normalizeReportBundle(row = {}) {
  const sourcePeriods = row.periods || row.data?.periods || []
  const periods = Array.isArray(sourcePeriods) ? sourcePeriods.map(normalizeReportPeriod) : []
  const period = row.period || row.data?.period || null
  const report = row.report || row.data?.report || null

  return {
    student: row.student ? normalizeStudentSnapshot(row.student) : null,
    class: row.class ? normalizeClassSnapshot(row.class) : null,
    periods,
    period: period ? normalizeReportPeriod(period) : null,
    report: report ? normalizeReportPayload(report) : null,
    raw: row,
  }
}

export function normalizeStudentReportBundle(row = {}) {
  return normalizeReportBundle(row)
}

export function normalizeClassroomReportBundle(row = {}) {
  return normalizeReportBundle(row)
}
