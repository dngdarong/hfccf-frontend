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
    }),
    signal: options.signal,
  })

  return normalizeReportPeriodList(response)
}

export async function fetchStudentReports(studentId, options = {}) {
  const response = await http.get(`/preschool/students/${encodeURIComponent(studentId)}/reports`, {
    signal: options.signal,
  })

  return normalizeStudentReportBundle(unwrapApiData(response) || {})
}

export async function fetchStudentReportPeriod(studentId, periodLabel, options = {}) {
  const response = await http.get(
    `/preschool/students/${encodeURIComponent(studentId)}/reports/${encodeURIComponent(periodLabel)}`,
    {
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
    signal: options.signal,
  })

  return normalizeClassroomReportBundle(unwrapApiData(response) || {})
}
