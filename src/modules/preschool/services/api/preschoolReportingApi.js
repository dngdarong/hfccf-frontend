// Keep Preschool reporting HTTP calls in one place so report dashboards and
// section pages can share a stable aggregation contract.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeFilters(filters = {}) {
  return {
    academicYearId: filters.academicYearId ?? filters.academic_year_id ?? '',
    termId: filters.termId ?? filters.term_id ?? '',
    dateFrom: filters.dateFrom ?? filters.date_from ?? '',
    dateTo: filters.dateTo ?? filters.date_to ?? '',
    month: filters.month ?? '',
    quarter: filters.quarter ?? '',
    classId: filters.classId ?? filters.class_id ?? '',
    teacherId: filters.teacherId ?? filters.teacher_id ?? '',
    status: filters.status ?? '',
    exportFormat: filters.exportFormat ?? filters.export_format ?? '',
  }
}

function normalizeCard(card = {}) {
  return {
    title: normalizeText(card.title),
    value: card.value ?? 0,
    caption: normalizeText(card.caption),
    tone: normalizeText(card.tone || 'info'),
  }
}

function normalizeKpis(kpis = {}) {
  return {
    totalStudents: normalizeNumber(kpis.total_students ?? kpis.totalStudents),
    activeStudents: normalizeNumber(kpis.active_students ?? kpis.activeStudents),
    newEnrollments: normalizeNumber(kpis.new_enrollments ?? kpis.newEnrollments),
    attendanceRate: normalizeNumber(kpis.attendance_rate ?? kpis.attendanceRate),
    absenceRate: normalizeNumber(kpis.absence_rate ?? kpis.absenceRate),
    lateRate: normalizeNumber(kpis.late_rate ?? kpis.lateRate),
    assessmentCompletion: normalizeNumber(kpis.assessment_completion ?? kpis.assessmentCompletion),
    averageScore: kpis.average_score ?? kpis.averageScore ?? null,
    atRiskStudents: normalizeNumber(kpis.at_risk_students ?? kpis.atRiskStudents),
    openHealthAlerts: normalizeNumber(kpis.open_health_alerts ?? kpis.openHealthAlerts),
    criticalHealthAlerts: normalizeNumber(kpis.critical_health_alerts ?? kpis.criticalHealthAlerts),
    vaccinationCompliance: normalizeNumber(kpis.vaccination_compliance ?? kpis.vaccinationCompliance),
    revenue: normalizeNumber(kpis.revenue),
    outstandingBalances: normalizeNumber(kpis.outstanding_balances ?? kpis.outstandingBalances),
    overdueInvoices: normalizeNumber(kpis.overdue_invoices ?? kpis.overdueInvoices),
    openGuardianIssues: normalizeNumber(kpis.open_guardian_issues ?? kpis.openGuardianIssues),
    escalatedCases: normalizeNumber(kpis.escalated_cases ?? kpis.escalatedCases),
  }
}

function normalizeSeries(items = []) {
  return Array.isArray(items)
    ? items.map((item) => ({
      label: normalizeText(item.label),
      value: normalizeNumber(item.value ?? item.count ?? 0),
      raw: item,
    }))
    : []
}

function normalizeTableRows(items = []) {
  return Array.isArray(items)
    ? items.map((item) => ({
      ...item,
      label: normalizeText(item.label || item.name || item.title),
      value: item.value ?? item.count ?? item.score ?? 0,
    }))
    : []
}

function normalizeReport(payload = {}) {
  return {
    report: normalizeText(payload.report),
    section: normalizeText(payload.section),
    filters: normalizeFilters(payload.filters || {}),
    summary: payload.summary ? {
      ...payload.summary,
      attendanceRate: payload.summary.attendance_rate ?? payload.summary.attendanceRate ?? null,
      absenceRate: payload.summary.absence_rate ?? payload.summary.absenceRate ?? null,
      lateRate: payload.summary.late_rate ?? payload.summary.lateRate ?? null,
      completionRate: payload.summary.completion_rate ?? payload.summary.completionRate ?? null,
      averageScore: payload.summary.average_score ?? payload.summary.averageScore ?? null,
      vaccinationCompliance: payload.summary.vaccination_compliance ?? payload.summary.vaccinationCompliance ?? null,
    } : {},
    kpis: payload.kpis ? normalizeKpis(payload.kpis) : {},
    cards: Array.isArray(payload.cards) ? payload.cards.map(normalizeCard) : [],
    trend: normalizeSeries(payload.trend || []),
    performance: normalizeSeries(payload.performance || []),
    completion: normalizeSeries(payload.completion || []),
    classBreakdown: normalizeTableRows(payload.class_breakdown || payload.classBreakdown || []),
    studentBreakdown: normalizeTableRows(payload.student_breakdown || payload.studentBreakdown || []),
    rows: normalizeTableRows(payload.rows || []),
    table: normalizeTableRows(payload.table || []),
    incidents: normalizeTableRows(payload.incidents || []),
    alerts: normalizeTableRows(payload.alerts || []),
    vaccinations: normalizeTableRows(payload.vaccinations || []),
    revenue: normalizeTableRows(payload.revenue || []),
    outstanding: normalizeTableRows(payload.outstanding || []),
    overdue: normalizeTableRows(payload.overdue || []),
    admissions: normalizeTableRows(payload.admissions || []),
    issues: normalizeTableRows(payload.issues || []),
    communications: normalizeTableRows(payload.communications || []),
    modules: payload.modules || {},
    risk: payload.risk || {},
    exportFormats: Array.isArray(payload.export_formats) ? payload.export_formats.map(normalizeText) : [],
    generatedAt: payload.generated_at || payload.generatedAt || '',
    raw: payload,
  }
}

async function getReport(path, params = {}, options = {}) {
  const response = await http.get(path, {
    params: buildQueryParams(params),
    signal: options.signal,
  })

  return normalizeReport(unwrapApiData(response) || {})
}

export async function fetchReportsDashboard(params = {}, options = {}) {
  const response = await http.get('/preschool/reports/dashboard', {
    params: buildQueryParams(params),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    dashboard: normalizeReport(payload.dashboard || payload),
    filters: payload.filters || {},
  }
}

export async function fetchAttendanceReports(params = {}, options = {}) {
  return getReport('/preschool/reports/attendance', params, options)
}

export async function fetchAttendanceClassReports(params = {}, options = {}) {
  return getReport('/preschool/reports/attendance/class', params, options)
}

export async function fetchAttendanceStudentReports(params = {}, options = {}) {
  return getReport('/preschool/reports/attendance/student', params, options)
}

export async function fetchAttendanceTrendReports(params = {}, options = {}) {
  return getReport('/preschool/reports/attendance/trend', params, options)
}

export async function fetchAssessmentReports(params = {}, options = {}) {
  return getReport('/preschool/reports/assessments', params, options)
}

export async function fetchAssessmentPerformanceReports(params = {}, options = {}) {
  return getReport('/preschool/reports/assessments/performance', params, options)
}

export async function fetchAssessmentCompletionReports(params = {}, options = {}) {
  return getReport('/preschool/reports/assessments/completion', params, options)
}

export async function fetchHealthReports(params = {}, options = {}) {
  return getReport('/preschool/reports/health', params, options)
}

export async function fetchHealthIncidentReports(params = {}, options = {}) {
  return getReport('/preschool/reports/health/incidents', params, options)
}

export async function fetchHealthVaccinationReports(params = {}, options = {}) {
  return getReport('/preschool/reports/health/vaccinations', params, options)
}

export async function fetchPaymentReports(params = {}, options = {}) {
  return getReport('/preschool/reports/payments', params, options)
}

export async function fetchPaymentRevenueReports(params = {}, options = {}) {
  return getReport('/preschool/reports/payments/revenue', params, options)
}

export async function fetchPaymentOutstandingReports(params = {}, options = {}) {
  return getReport('/preschool/reports/payments/outstanding', params, options)
}

export async function fetchEnrollmentReports(params = {}, options = {}) {
  return getReport('/preschool/reports/enrollments', params, options)
}

export async function fetchEnrollmentTrendReports(params = {}, options = {}) {
  return getReport('/preschool/reports/enrollments/trends', params, options)
}

export async function fetchGuardianReports(params = {}, options = {}) {
  return getReport('/preschool/reports/guardians', params, options)
}

export async function fetchGuardianIssueReports(params = {}, options = {}) {
  return getReport('/preschool/reports/guardians/issues', params, options)
}

export async function exportReport(section, format = 'csv', params = {}, options = {}) {
  const response = await http.get('/preschool/reports/export', {
    params: buildQueryParams({
      ...params,
      section,
      format,
    }),
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    ...payload.export,
    content: normalizeText(payload.export?.content),
    section: normalizeText(payload.export?.section || section),
    format: normalizeText(payload.export?.format || format),
  }
}

export function normalizeReportDashboard(payload = {}) {
  return normalizeReport(payload)
}
