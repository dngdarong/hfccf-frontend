import http from '@/services/http'
import { unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function resolveId(input) {
  if (typeof input === 'string' || typeof input === 'number') {
    return String(input).trim()
  }

  return String(input?.id || '').trim()
}

function unwrapRecord(payload = {}, keys = []) {
  for (const key of keys) {
    const value = payload?.[key]
    if (value && typeof value === 'object') {
      return value
    }
  }

  return payload
}

export function normalizeAssessmentSettings(record = {}) {
  return {
    id: record.id ?? '',
    lateThresholdMinutes: normalizeNumber(record.lateThresholdMinutes ?? record.late_threshold_minutes, 15),
    halfDayThresholdMinutes: normalizeNumber(record.halfDayThresholdMinutes ?? record.half_day_threshold_minutes, 180),
    absenceAlertDays: normalizeNumber(record.absenceAlertDays ?? record.absence_alert_days, 3),
    guardianAlertEnabled: normalizeBoolean(record.guardianAlertEnabled ?? record.guardian_alert_enabled, true),
    teacherAlertEnabled: normalizeBoolean(record.teacherAlertEnabled ?? record.teacher_alert_enabled, true),
    adminAlertEnabled: normalizeBoolean(record.adminAlertEnabled ?? record.admin_alert_enabled, true),
    gradingScaleType: normalizeText(record.gradingScaleType || record.grading_scale_type),
    weightingEnabled: normalizeBoolean(record.weightingEnabled ?? record.weighting_enabled, false),
    mondayEnabled: normalizeBoolean(record.mondayEnabled ?? record.monday_enabled, true),
    tuesdayEnabled: normalizeBoolean(record.tuesdayEnabled ?? record.tuesday_enabled, true),
    wednesdayEnabled: normalizeBoolean(record.wednesdayEnabled ?? record.wednesday_enabled, true),
    thursdayEnabled: normalizeBoolean(record.thursdayEnabled ?? record.thursday_enabled, true),
    fridayEnabled: normalizeBoolean(record.fridayEnabled ?? record.friday_enabled, true),
    saturdayEnabled: normalizeBoolean(record.saturdayEnabled ?? record.saturday_enabled, false),
    sundayEnabled: normalizeBoolean(record.sundayEnabled ?? record.sunday_enabled, false),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

export function normalizeGradeBand(record = {}) {
  return {
    id: record.id ?? '',
    name: normalizeText(record.name || record.grade),
    grade: normalizeText(record.grade || record.name),
    minimumScore: normalizeNumber(record.minimumScore ?? record.minimum_score, 0),
    maximumScore: normalizeNumber(record.maximumScore ?? record.maximum_score, 100),
    color: normalizeText(record.color),
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    isPassing: normalizeBoolean(record.isPassing ?? record.is_passing, false),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

export function normalizeAssessmentCategory(record = {}) {
  const status = normalizeText(record.status || (record.isActive ?? record.is_active ? 'active' : 'archived') || 'active')

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status: status || (normalizeBoolean(record.isActive ?? record.is_active, true) ? 'active' : 'archived'),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeReportPeriod(record = {}) {
  const academicYear = record.academicYear || record.academic_year || {}
  const term = record.term || record.academicTerm || record.term_record || {}

  return {
    id: record.id ?? '',
    academicYearId: record.academicYearId ?? record.academic_year_id ?? '',
    academicYearName: normalizeText(
      record.academicYearName
      || record.academic_year_name
      || academicYear.name
      || academicYear.label,
    ),
    termId: record.termId ?? record.term_id ?? '',
    termName: normalizeText(
      record.termName
      || record.term_name
      || term.name
      || term.label,
    ),
    name: normalizeText(record.name),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    isActive: normalizeBoolean(record.isActive ?? record.is_active, true),
    status: normalizeText(record.status || (normalizeBoolean(record.isActive ?? record.is_active, true) ? 'active' : 'archived')),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeAssessmentWeight(record = {}) {
  const category = record.category || {}

  return {
    id: record.id ?? '',
    categoryId: record.categoryId ?? record.category_id ?? '',
    categoryName: normalizeText(
      record.categoryName
      || record.category_name
      || category.name
      || '',
    ),
    percentage: normalizeNumber(record.percentage, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

function normalizeResponseRecord(response, keys = []) {
  const payload = unwrapApiData(response) || {}
  return unwrapRecord(payload, keys)
}

function normalizeListResponse(response, normalizer, fallbackPage = 1, fallbackPerPage = 20) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizer),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildAssessmentSettingsPayload(settings = {}) {
  return {
    late_threshold_minutes: normalizeNumber(settings.lateThresholdMinutes ?? settings.late_threshold_minutes, 15),
    half_day_threshold_minutes: normalizeNumber(settings.halfDayThresholdMinutes ?? settings.half_day_threshold_minutes, 180),
    absence_alert_days: normalizeNumber(settings.absenceAlertDays ?? settings.absence_alert_days, 3),
    guardian_alert_enabled: normalizeBoolean(settings.guardianAlertEnabled ?? settings.guardian_alert_enabled, true),
    teacher_alert_enabled: normalizeBoolean(settings.teacherAlertEnabled ?? settings.teacher_alert_enabled, true),
    admin_alert_enabled: normalizeBoolean(settings.adminAlertEnabled ?? settings.admin_alert_enabled, true),
    monday_enabled: normalizeBoolean(settings.mondayEnabled ?? settings.monday_enabled, true),
    tuesday_enabled: normalizeBoolean(settings.tuesdayEnabled ?? settings.tuesday_enabled, true),
    wednesday_enabled: normalizeBoolean(settings.wednesdayEnabled ?? settings.wednesday_enabled, true),
    thursday_enabled: normalizeBoolean(settings.thursdayEnabled ?? settings.thursday_enabled, true),
    friday_enabled: normalizeBoolean(settings.fridayEnabled ?? settings.friday_enabled, true),
    saturday_enabled: normalizeBoolean(settings.saturdayEnabled ?? settings.saturday_enabled, false),
    sunday_enabled: normalizeBoolean(settings.sundayEnabled ?? settings.sunday_enabled, false),
  }
}

function buildGradeBandPayload(band = {}) {
  return {
    name: normalizeText(band.name || band.grade),
    grade: normalizeText(band.grade || band.name),
    minimum_score: normalizeNumber(band.minimumScore ?? band.minimum_score, 0),
    maximum_score: normalizeNumber(band.maximumScore ?? band.maximum_score, 100),
    color: normalizeText(band.color),
    sort_order: normalizeNumber(band.sortOrder ?? band.sort_order, 0),
    is_passing: normalizeBoolean(band.isPassing ?? band.is_passing, false),
  }
}

function buildCategoryPayload(category = {}) {
  return {
    name: normalizeText(category.name),
    code: normalizeText(category.code),
    description: normalizeText(category.description),
    sort_order: normalizeNumber(category.sortOrder ?? category.sort_order, 0),
    is_active: normalizeBoolean(category.isActive ?? category.is_active, true),
  }
}

function buildReportPeriodPayload(period = {}) {
  return {
    academic_year_id: period.academicYearId ?? period.academic_year_id ?? '',
    term_id: period.termId ?? period.term_id ?? '',
    name: normalizeText(period.name),
    start_date: period.startDate || period.start_date || '',
    end_date: period.endDate || period.end_date || '',
    is_active: normalizeBoolean(period.isActive ?? period.is_active, true),
  }
}

function buildWeightPayload(weight = {}) {
  return {
    category_id: weight.categoryId ?? weight.category_id ?? '',
    percentage: normalizeNumber(weight.percentage, 0),
  }
}

export async function fetchAssessmentSettings(options = {}) {
  const response = await http.get('/preschool/settings/assessments', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeAssessmentSettings(payload.settings || payload)
}

export async function updateAssessmentSettings(settings = {}) {
  const response = await http.put('/preschool/settings/assessments', buildAssessmentSettingsPayload(settings))
  const payload = unwrapApiData(response) || {}
  return normalizeAssessmentSettings(payload.settings || payload)
}

export async function fetchGradingScale(options = {}) {
  const response = await http.get('/preschool/settings/assessments/grading-scale', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeGradeBand)
}

export async function createGradeBand(band = {}) {
  const response = await http.post('/preschool/settings/assessments/grading-scale', buildGradeBandPayload(band))
  const payload = unwrapApiData(response) || {}
  return normalizeGradeBand(normalizeResponseRecord(response, ['band', 'gradeBand', 'gradingBand', 'data']) || payload)
}

export async function updateGradeBand(bandOrId, band = {}) {
  const bandId = resolveId(bandOrId)
  const response = await http.put(
    `/preschool/settings/assessments/grading-scale/${encodeURIComponent(bandId)}`,
    buildGradeBandPayload(band),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeGradeBand(normalizeResponseRecord(response, ['band', 'gradeBand', 'gradingBand', 'data']) || payload)
}

export async function deleteGradeBand(bandOrId) {
  const bandId = resolveId(bandOrId)
  await http.delete(`/preschool/settings/assessments/grading-scale/${encodeURIComponent(bandId)}`)
  return true
}

export async function fetchAssessmentCategories(options = {}) {
  const response = await http.get('/preschool/settings/assessments/categories', {
    signal: options.signal,
  })

  const items = unwrapApiItems(response)
  return items.map(normalizeAssessmentCategory)
}

export async function createAssessmentCategory(category = {}) {
  const response = await http.post('/preschool/settings/assessments/categories', buildCategoryPayload(category))
  const payload = unwrapApiData(response) || {}
  return normalizeAssessmentCategory(normalizeResponseRecord(response, ['category', 'assessmentCategory', 'data']) || payload)
}

export async function updateAssessmentCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.put(
    `/preschool/settings/assessments/categories/${encodeURIComponent(categoryId)}`,
    buildCategoryPayload(category),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeAssessmentCategory(normalizeResponseRecord(response, ['category', 'assessmentCategory', 'data']) || payload)
}

export async function archiveAssessmentCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.post(`/preschool/settings/assessments/categories/${encodeURIComponent(categoryId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeAssessmentCategory(normalizeResponseRecord(response, ['category', 'assessmentCategory', 'data']) || payload)
}

export async function fetchReportPeriods(options = {}) {
  const response = await http.get('/preschool/settings/assessments/report-periods', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeReportPeriod)
}

export async function createReportPeriod(period = {}) {
  const response = await http.post('/preschool/settings/assessments/report-periods', buildReportPeriodPayload(period))
  const payload = unwrapApiData(response) || {}
  return normalizeReportPeriod(normalizeResponseRecord(response, ['period', 'reportPeriod', 'data']) || payload)
}

export async function updateReportPeriod(periodOrId, period = {}) {
  const periodId = resolveId(periodOrId)
  const response = await http.put(
    `/preschool/settings/assessments/report-periods/${encodeURIComponent(periodId)}`,
    buildReportPeriodPayload(period),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeReportPeriod(normalizeResponseRecord(response, ['period', 'reportPeriod', 'data']) || payload)
}

export async function archiveReportPeriod(periodOrId) {
  const periodId = resolveId(periodOrId)
  const response = await http.post(`/preschool/settings/assessments/report-periods/${encodeURIComponent(periodId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeReportPeriod(normalizeResponseRecord(response, ['period', 'reportPeriod', 'data']) || payload)
}

export async function fetchAssessmentWeights(options = {}) {
  const response = await http.get('/preschool/settings/assessments/weights', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeAssessmentWeight)
}

export async function updateAssessmentWeights(weights = []) {
  const payload = Array.isArray(weights) ? weights.map(buildWeightPayload) : []
  const response = await http.put('/preschool/settings/assessments/weights', {
    weights: payload,
  })

  const responsePayload = unwrapApiData(response) || {}
  const items = Array.isArray(responsePayload.weights)
    ? responsePayload.weights
    : Array.isArray(responsePayload.items)
      ? responsePayload.items
      : Array.isArray(responsePayload.data)
        ? responsePayload.data
        : payload

  return items.map(normalizeAssessmentWeight)
}
