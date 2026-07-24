// Keep Preschool report HTTP calls in one place so pages can stay thin and the
// finalized-assessment reporting contract stays easy to evolve later.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'
import {
  normalizeClassroomReportBundle,
  normalizeReportPeriod,
  normalizeStudentReportBundle,
} from './preschoolReportMappers'

function normalizeReportPeriodList(response) {
  const payload = unwrapApiData(response) || {}
  const periods = Array.isArray(payload.periods) ? payload.periods : []

  return periods.map(normalizeReportPeriod)
}

export async function fetchReportPeriods(params = {}, options = {}) {
  const response = await http.get('/preschool/report-periods', {
    params: buildQueryParams({
      student_id: params.studentId || '',
      class_id: params.classId || '',
      period_type: params.periodType || '',
      report_period_id: params.reportPeriodId || '',
      academic_year_id: params.academicYearId || '',
      term_id: params.termId || '',
    }),
    signal: options.signal,
  })

  return normalizeReportPeriodList(response)
}

function buildReportQueryParams(params = {}) {
  return buildQueryParams({
    period_type: params.periodType || '',
    report_period_id: params.reportPeriodId || '',
    academic_year_id: params.academicYearId || '',
    term_id: params.termId || '',
  })
}

export async function fetchStudentReports(studentId, options = {}) {
  const response = await http.get(`/preschool/students/${encodeURIComponent(studentId)}/reports`, {
    params: buildReportQueryParams(options),
    signal: options.signal,
  })

  return normalizeStudentReportBundle(unwrapApiData(response) || {})
}

export async function fetchStudentReportPeriod(studentId, periodLabel, options = {}) {
  const response = await http.get(
    `/preschool/students/${encodeURIComponent(studentId)}/reports/${encodeURIComponent(periodLabel)}`,
    {
      params: buildReportQueryParams(options),
      signal: options.signal,
    },
  )

  return normalizeStudentReportBundle(unwrapApiData(response) || {})
}

export async function fetchClassroomReport(classId, periodLabel = '', options = {}) {
  const path = periodLabel
    ? `/preschool/classes/${encodeURIComponent(classId)}/reports/${encodeURIComponent(periodLabel)}`
    : `/preschool/classes/${encodeURIComponent(classId)}/reports`

  const response = await http.get(path, {
    params: buildReportQueryParams(options),
    signal: options.signal,
  })

  return normalizeClassroomReportBundle(unwrapApiData(response) || {})
}

function resolveAttachmentFilename(headers = {}, fallback = 'StudentSummaryReport.pdf') {
  const disposition = String(headers['content-disposition'] || headers['Content-Disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  if (match?.[1]) {
    return match[1]
  }

  return fallback
}

export async function downloadStudentSummaryReportPdf(params = {}, options = {}) {
  const mode = String(params.mode || 'individual').trim() === 'class' ? 'class' : 'individual'
  const response = await http.get('/preschool/reports/student-summary/download', {
    params: buildQueryParams({
      mode,
      academic_year_id: params.academicYearId || '',
      class_id: params.classId || '',
      student_id: mode === 'individual' ? params.studentId || '' : '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return {
    blob: response.data,
    filename: resolveAttachmentFilename(response.headers, params.filename || 'StudentSummaryReport.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function downloadMonthlyAttendanceReportPdf(params = {}, options = {}) {
  const response = await http.get('/preschool/reports/attendance/monthly/download', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      class_id: params.classId || '',
      month: params.month || '',
      year: params.year || '',
      date_from: params.dateFrom || '',
      date_to: params.dateTo || '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return {
    blob: response.data,
    filename: resolveAttachmentFilename(response.headers, params.filename || 'AttendanceReport_Monthly.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function fetchMonthlyAttendanceReport(params = {}, options = {}) {
  const response = await http.get('/preschool/reports/attendance/monthly', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      class_id: params.classId || '',
      month: params.month || '',
      year: params.year || '',
      date_from: params.dateFrom || '',
      date_to: params.dateTo || '',
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}

  return {
    classInfo: payload.class || null,
    academicYear: payload.academicYear || null,
    month: payload.month || params.month || '',
    year: payload.year || params.year || '',
    dateFrom: payload.dateFrom || params.dateFrom || '',
    dateTo: payload.dateTo || params.dateTo || '',
    dayCount: payload.dayCount || 0,
    students: Array.isArray(payload.students) ? payload.students : [],
    attendanceRecords: Array.isArray(payload.attendanceRecords) ? payload.attendanceRecords : [],
    summary: payload.summary || {},
    compatibility: payload.compatibility || {},
  }
}
