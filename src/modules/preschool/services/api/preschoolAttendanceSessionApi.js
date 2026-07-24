import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeSessionRecord(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name || row.student?.fullName || row.student?.name),
    status: normalizeText(row.status || ''),
    note: normalizeText(row.note || ''),
    guardianContactStatus: normalizeText(row.guardianContactStatus || row.guardian_contact_status),
    guardianContactCreatedAt: row.guardianContactCreatedAt || row.guardian_contact_created_at || '',
    guardianContactLabel: normalizeText(row.guardianContactLabel || row.guardian_contact_label),
    raw: row,
  }
}

function normalizeSessionAlert(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name),
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name),
    alertType: normalizeText(row.alertType || row.alert_type),
    alertLabel: normalizeText(row.alertLabel || row.alert_label),
    status: normalizeText(row.status || ''),
    createdAt: row.createdAt || row.created_at || '',
    followUpStatus: normalizeText(row.followUpStatus || row.follow_up_status),
    raw: row,
  }
}

function normalizeSessionTimelineItem(row = {}) {
  return {
    id: row.id ?? row.key ?? row.event ?? '',
    event: normalizeText(row.event || row.type || row.key),
    label: normalizeText(row.label || row.title),
    createdAt: row.createdAt || row.created_at || row.time || '',
    raw: row,
  }
}

function normalizeGuardianContactLog(row = {}) {
  return {
    id: row.id ?? '',
    status: normalizeText(row.status || ''),
    followUpStatus: normalizeText(row.followUpStatus || row.follow_up_status),
    createdAt: row.createdAt || row.created_at || '',
    note: normalizeText(row.note || row.message || row.summary),
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name),
    guardianId: row.guardianId ?? row.guardian_id ?? '',
    guardianName: normalizeText(row.guardianName || row.guardian_name),
    raw: row,
  }
}

function normalizeSessionRow(row = {}) {
  const rawRecords = Array.isArray(row.records)
    ? row.records
    : Array.isArray(row.attendanceRecords)
      ? row.attendanceRecords
      : Array.isArray(row.items)
        ? row.items
        : []
  const rawAlerts = Array.isArray(row.relatedAlerts)
    ? row.relatedAlerts
    : Array.isArray(row.alerts)
      ? row.alerts
      : []
  const rawTimeline = Array.isArray(row.timeline)
    ? row.timeline
    : Array.isArray(row.events)
      ? row.events
      : []
  const rawContactLogs = Array.isArray(row.guardianContactLogs)
    ? row.guardianContactLogs
    : Array.isArray(row.guardianContacts)
      ? row.guardianContacts
      : Array.isArray(row.contactLogs)
        ? row.contactLogs
        : Array.isArray(row.communications)
    ? row.communications
    : []
  const studentCount = normalizeNumber(row.studentCount ?? row.student_count ?? row.totalStudents ?? row.total_students, 0)
  const recordedStudents = normalizeNumber(row.recordedStudents ?? row.recorded_students ?? row.recordsCount ?? row.records_count, rawRecords.length)
  const missingStudents = normalizeNumber(row.missingStudents ?? row.missing_students, Math.max(studentCount - recordedStudents, 0))
  const completionRate = normalizeNumber(row.completionRate ?? row.completion_rate, studentCount > 0 ? Number(((recordedStudents / studentCount) * 100).toFixed(2)) : 0)

  return {
    id: row.id ?? '',
    sessionKey: normalizeText(row.sessionKey || row.session_key),
    classId: row.classId ?? row.class_id ?? row.preschoolClass?.id ?? '',
    className: normalizeText(row.className || row.class_name || row.preschoolClass?.name),
    classCode: normalizeText(row.classCode || row.class_code || row.preschoolClass?.code),
    teacherId: row.teacherId ?? row.teacher_id ?? row.teacher?.id ?? '',
    teacherName: normalizeText(row.teacherName || row.teacher_name || row.teacher?.fullName || row.teacher?.name),
    roomId: row.roomId ?? row.room_id ?? row.room?.id ?? '',
    roomName: normalizeText(row.roomName || row.room_name || row.room?.name || row.room?.label),
    scheduleId: row.scheduleId ?? row.schedule_id ?? '',
    scheduleLabel: normalizeText(row.scheduleLabel || row.schedule_label || row.schedule?.activityLabel || row.schedule?.activity_label),
    attendanceDate: row.attendanceDate || row.attendance_date || '',
    startTime: normalizeText(row.startTime || row.start_time),
    endTime: normalizeText(row.endTime || row.end_time),
    status: normalizeText(row.status || 'open'),
    generatedFromSchedule: Boolean(row.generatedFromSchedule ?? row.generated_from_schedule),
    manualSession: Boolean(row.manualSession ?? row.manual_session ?? !(row.generatedFromSchedule ?? row.generated_from_schedule)),
    notes: normalizeText(row.notes),
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    createdAt: row.createdAt || row.created_at || '',
    openedAt: row.openedAt || row.opened_at || '',
    completedAt: row.completedAt || row.completed_at || '',
    lockedAt: row.lockedAt || row.locked_at || '',
    cancelledAt: row.cancelledAt || row.cancelled_at || '',
    closedByUserId: row.closedByUserId ?? row.closed_by_user_id ?? '',
    closedAt: row.closedAt || row.closed_at || '',
    studentCount,
    recordedStudents,
    missingStudents,
    completionRate,
    canRecord: Boolean(row.canRecord ?? row.can_record),
    canViewDetails: Boolean(row.canViewDetails ?? row.can_view_details ?? true),
    presentCount: normalizeNumber(row.presentCount ?? row.present_count, 0),
    absentCount: normalizeNumber(row.absentCount ?? row.absent_count, 0),
    lateCount: normalizeNumber(row.lateCount ?? row.late_count, 0),
    excusedCount: normalizeNumber(row.excusedCount ?? row.excused_count, 0),
    pendingCount: normalizeNumber(row.pendingCount ?? row.pending_count, missingStudents),
    recordsCount: normalizeNumber(row.recordsCount ?? row.records_count ?? rawRecords.length, 0),
    records: rawRecords.map(normalizeSessionRecord),
    relatedAlerts: rawAlerts.map(normalizeSessionAlert),
    guardianContactLogs: rawContactLogs.map(normalizeGuardianContactLog),
    timeline: rawTimeline.map(normalizeSessionTimelineItem),
    raw: row,
  }
}

function normalizeSessionListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeSessionRow),
    summary: unwrapApiData(response)?.summary || {
      open: 0,
      closed: 0,
      cancelled: 0,
      missing: 0,
    },
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function hasSessionFilters(filters = {}) {
  return Boolean(
    filters.date
    || filters.classId
    || filters.teacherId
    || filters.status
  )
}

export async function fetchAttendanceSessions({ date = '', classId = '', teacherId = '', status = '' } = {}, options = {}) {
  const response = await http.get('/preschool/attendance-sessions', {
    params: buildQueryParams({
      date,
      class_id: classId,
      teacher_id: teacherId,
      status,
    }),
    signal: options.signal,
  })

  return normalizeSessionListResponse(response)
}

export async function fetchTodayAttendanceSessions(filters = {}, options = {}) {
  const hasFilters = hasSessionFilters(filters)

  if (!hasFilters) {
    const response = await http.get('/preschool/attendance-sessions/today', {
      signal: options.signal,
    })

    return normalizeSessionListResponse(response)
  }

  return fetchAttendanceSessions({
    ...filters,
    date: todayIso(),
  }, options)
}

export async function fetchMissingAttendanceSessions(filters = {}, options = {}) {
  const response = await http.get('/preschool/attendance-sessions/missing', {
    params: buildQueryParams({
      start_date: filters.startDate ?? filters.start_date ?? filters.date ?? '',
      end_date: filters.endDate ?? filters.end_date ?? filters.date ?? '',
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeSessionRow)
    : []

  return {
    items,
    count: Number(payload.count ?? items.length) || 0,
  }
}

export async function generateAttendanceSessions(payload = {}) {
  const response = await http.post('/preschool/attendance-sessions/generate', {
    date: payload.date,
    class_id: payload.classId ?? payload.class_id ?? '',
  })

  const data = unwrapApiData(response) || {}
  return Array.isArray(data.items) ? data.items.map(normalizeSessionRow) : []
}

export async function createAttendanceSession(payload = {}) {
  const response = await http.post('/preschool/attendance-sessions', {
    preschool_class_id: payload.classId ?? payload.preschool_class_id ?? '',
    attendance_date: payload.attendanceDate ?? payload.attendance_date ?? '',
    start_time: payload.startTime ?? payload.start_time ?? '',
    end_time: payload.endTime ?? payload.end_time ?? '',
    notes: payload.notes ?? '',
  })

  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function fetchAttendanceSession(sessionId, options = {}) {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.get(`/preschool/attendance-sessions/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function saveAttendanceSessionRecord(sessionId, payload = {}) {
  const id = String(sessionId || '').trim()
  if (!id) {
    throw new Error('Session id is required.')
  }

  const response = await http.post(`/preschool/attendance-sessions/${encodeURIComponent(id)}/records`, {
    attendance_session_id: id,
    student_id: payload.studentId ?? payload.student_id ?? '',
    status: payload.status,
    note: payload.note ?? '',
    academic_year_id: payload.academicYearId ?? payload.academic_year_id ?? '',
    term_id: payload.termId ?? payload.term_id ?? '',
  })

  const data = unwrapApiData(response) || {}
  return data.attendance || data
}

export async function saveAttendanceSessionRecords(sessionId, records = []) {
  const list = Array.isArray(records) ? records : []
  const saved = []

  for (const record of list) {
    if (!record || !record.studentId && !record.student_id) {
      continue
    }

    // The backend session-record endpoint remains the source of truth for each
    // row, so keep the batch helper as a thin wrapper over the canonical record
    // save method rather than inventing a new payload shape here.
     
    const savedRecord = await saveAttendanceSessionRecord(sessionId, record)
    saved.push(savedRecord)
  }

  return saved
}

export async function completeAttendanceSession(sessionId) {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.patch(`/preschool/attendance-sessions/${encodeURIComponent(id)}/complete`)
  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function lockAttendanceSession(sessionId) {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.patch(`/preschool/attendance-sessions/${encodeURIComponent(id)}/lock`)
  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function reopenAttendanceSession(sessionId) {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.patch(`/preschool/attendance-sessions/${encodeURIComponent(id)}/reopen`)
  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function cancelAttendanceSession(sessionId, reason = '') {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.patch(`/preschool/attendance-sessions/${encodeURIComponent(id)}/cancel`, {
    reason: normalizeText(reason),
  })
  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function openAttendanceSession(sessionId) {
  const id = String(sessionId || '').trim()
  if (!id) return null

  const response = await http.patch(`/preschool/attendance-sessions/${encodeURIComponent(id)}/open`)
  const data = unwrapApiData(response) || {}
  return normalizeSessionRow(data.session || data)
}

export async function closeAttendanceSession(sessionId) {
  return completeAttendanceSession(sessionId)
}
