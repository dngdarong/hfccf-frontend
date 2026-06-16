import { ASSIGNMENT_STATUSES, LOCKED_STATUSES } from '../constants/preschoolAssignmentsConstants'

export function normalizeStatus(value: any): string {
  return String(value || ASSIGNMENT_STATUSES.ACTIVE).toLowerCase()
}

export function formatDate(value: any): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

export function badgeClasses(status: any): string {
  switch (normalizeStatus(status)) {
    case ASSIGNMENT_STATUSES.ACTIVE:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case ASSIGNMENT_STATUSES.INACTIVE:
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case ASSIGNMENT_STATUSES.PENDING:
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case ASSIGNMENT_STATUSES.ARCHIVED:
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600'
  }
}

export function statusLabel(status: any, t: any): string {
  const normalized = normalizeStatus(status)
  const translated = {
    [ASSIGNMENT_STATUSES.ACTIVE]: t('preschoolAssignmentsPage.statusLabels.active'),
    [ASSIGNMENT_STATUSES.INACTIVE]: t('preschoolAssignmentsPage.statusLabels.inactive'),
    [ASSIGNMENT_STATUSES.PENDING]: t('preschoolAssignmentsPage.statusLabels.pending'),
    [ASSIGNMENT_STATUSES.ARCHIVED]: t('preschoolAssignmentsPage.statusLabels.archived'),
  }

  if (translated[normalized]) {
    return translated[normalized]
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function isTermLocked(termStatus: any): boolean {
  return LOCKED_STATUSES.includes(String(termStatus || '').toLowerCase())
}

export function isReportPeriodLocked(reportPeriodStatus: any): boolean {
  return LOCKED_STATUSES.includes(
    String(reportPeriodStatus || '').toLowerCase(),
  )
}

export function buildAssignmentLockMessage(lifecycleContext: any, t: any): string {
  const status = String(lifecycleContext?.term_status || '').toLowerCase()
  const reportPeriodStatus = String(
    lifecycleContext?.report_period_status || lifecycleContext?.reportPeriodStatus || '',
  ).toLowerCase()

  if (status === 'closed') {
    return t('preschoolLifecyclePage.messages.termClosed')
  }

  if (status === 'archived') {
    return t('preschoolLifecyclePage.messages.termArchived')
  }

  if (LOCKED_STATUSES.includes(reportPeriodStatus)) {
    return t('preschoolLifecyclePage.messages.reportPeriodLocked')
  }

  return ''
}

export function buildStudentAssignmentRows(studentRows: any[]): any[] {
  return studentRows.flatMap((student) =>
    (student.classAssignments || student.classes || []).map((assignment) => ({
      studentId: student.id,
      studentName: student.fullName || student.name || student.publicId || student.studentCode || '-',
      studentCode: student.publicId || student.studentCode || '-',
      classId: assignment.id || '',
      classCode: assignment.code || '-',
      className: assignment.name || '-',
      teacherDisplayName: assignment.teacherDisplayName || '-',
      status: assignment.status || ASSIGNMENT_STATUSES.ACTIVE,
      enrolledAt: assignment.enrolledAt || '',
      updatedAt: assignment.updatedAt || '',
    })),
  )
}

export function buildTeacherAssignmentRows(classRows: any[]): any[] {
  return classRows
    .filter((item) => String(item.teacherUserId || '').trim() !== '')
    .map((item) => ({
      classId: item.id,
      classCode: item.code || '-',
      className: item.name || '-',
      teacherDisplayName: item.teacherDisplayName || item.teacher || '-',
      teacherUserId: item.teacherUserId || '',
      status: item.status || ASSIGNMENT_STATUSES.ACTIVE,
      studentsCount: item.studentsCount || 0,
    }))
}

export function buildTeacherAssignmentHistoryRows(classRows: any[]): any[] {
  return classRows.flatMap((item) =>
    (item.teacherAssignments || []).map((assignment) => ({
      classId: item.id,
      classCode: item.code || '-',
      className: item.name || '-',
      teacherDisplayName: assignment.teacherDisplayName || item.teacherDisplayName || '-',
      status: assignment.status || ASSIGNMENT_STATUSES.ACTIVE,
      assignedAt: assignment.assignedAt || '',
      endedAt: assignment.endedAt || '',
      notes: assignment.notes || '',
      updatedAt: assignment.updatedAt || assignment.endedAt || assignment.assignedAt || '',
    })),
  )
}

export function buildScheduleAssignmentRows(scheduleRows: any[]): any[] {
  return scheduleRows.map((item) => ({
    id: item.id,
    className: item.className || '-',
    teacherName: item.teacherName || '-',
    dayOfWeek: item.dayOfWeek || '-',
    status: item.status || (item.isActive ? ASSIGNMENT_STATUSES.ACTIVE : ASSIGNMENT_STATUSES.INACTIVE),
    effectiveFrom: item.effectiveFrom || '',
    effectiveTo: item.effectiveTo || '',
    notes: item.notes || '',
  }))
}

export function buildHistoryRows(studentAssignmentRows: any[], teacherAssignmentHistoryRows: any[], scheduleAssignmentRows: any[]): any[] {
  return [
    ...studentAssignmentRows
      .filter((row) => normalizeStatus(row.status) !== ASSIGNMENT_STATUSES.ACTIVE)
      .map((row) => ({
        type: 'student',
        label: `${row.studentName} → ${row.className}`,
        status: row.status,
        updatedAt: row.updatedAt || row.enrolledAt || '',
        note: row.teacherDisplayName,
      })),
    ...teacherAssignmentHistoryRows
      .filter((row) => normalizeStatus(row.status) !== ASSIGNMENT_STATUSES.ACTIVE)
      .map((row) => ({
        type: 'teacher',
        label: `${row.classCode} - ${row.className}`,
        status: row.status,
        updatedAt: row.updatedAt || row.endedAt || row.assignedAt || '',
        note: row.teacherDisplayName || row.notes,
      })),
    ...scheduleAssignmentRows
      .filter((row) => normalizeStatus(row.status) !== ASSIGNMENT_STATUSES.ACTIVE)
      .map((row) => ({
        type: 'schedule',
        label: `${row.className} / ${row.teacherName}`,
        status: row.status,
        updatedAt: row.effectiveTo || row.effectiveFrom || '',
        note: row.notes,
      })),
  ]
}

export function buildSummaryCards(studentAssignmentRows: any[], teacherAssignmentRows: any[], scheduleAssignmentRows: any[], historyRows: any[], t: any): any[] {
  return [
    {
      id: 'students',
      title: t('preschoolAssignmentsPage.summary.studentAssignments.title'),
      caption: t('preschoolAssignmentsPage.summary.studentAssignments.caption'),
      value: studentAssignmentRows.filter((row) => normalizeStatus(row.status) === ASSIGNMENT_STATUSES.ACTIVE).length,
    },
    {
      id: 'teachers',
      title: t('preschoolAssignmentsPage.summary.teacherAssignments.title'),
      caption: t('preschoolAssignmentsPage.summary.teacherAssignments.caption'),
      value: teacherAssignmentRows.filter((row) => normalizeStatus(row.status) === ASSIGNMENT_STATUSES.ACTIVE).length,
    },
    {
      id: 'schedules',
      title: t('preschoolAssignmentsPage.summary.scheduleAssignments.title'),
      caption: t('preschoolAssignmentsPage.summary.scheduleAssignments.caption'),
      value: scheduleAssignmentRows.filter((row) => normalizeStatus(row.status) === ASSIGNMENT_STATUSES.ACTIVE).length,
    },
    {
      id: 'history',
      title: t('preschoolAssignmentsPage.summary.history.title'),
      caption: t('preschoolAssignmentsPage.summary.history.caption'),
      value: historyRows.length,
    },
  ]
}
