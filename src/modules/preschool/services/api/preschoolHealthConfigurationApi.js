import http from '@/services/http'
import { unwrapApiData, unwrapApiItems } from '@/services/api'

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

function normalizeListResponse(response, normalizer) {
  return unwrapApiItems(response).map(normalizer)
}

function unwrapRecord(response, keys = []) {
  const payload = unwrapApiData(response) || {}

  for (const key of keys) {
    const value = payload?.[key]
    if (value && typeof value === 'object') {
      return value
    }
  }

  return payload
}

export function normalizeHealthSettings(record = {}) {
  return {
    id: record.id ?? '',
    criticalAlertEnabled: normalizeBoolean(record.criticalAlertEnabled ?? record.critical_alert_enabled, true),
    guardianNotificationEnabled: normalizeBoolean(record.guardianNotificationEnabled ?? record.guardian_notification_enabled, true),
    teacherNotificationEnabled: normalizeBoolean(record.teacherNotificationEnabled ?? record.teacher_notification_enabled, true),
    adminNotificationEnabled: normalizeBoolean(record.adminNotificationEnabled ?? record.admin_notification_enabled, true),
    medicationReminderEnabled: normalizeBoolean(record.medicationReminderEnabled ?? record.medication_reminder_enabled, true),
    vaccinationReminderEnabled: normalizeBoolean(record.vaccinationReminderEnabled ?? record.vaccination_reminder_enabled, true),
    overdueVaccinationAlertDays: normalizeNumber(record.overdueVaccinationAlertDays ?? record.overdue_vaccination_alert_days, 30),
    medicationReminderMinutesBefore: normalizeNumber(record.medicationReminderMinutesBefore ?? record.medication_reminder_minutes_before, 30),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

export function normalizeSeverityLevel(record = {}) {
  const status = normalizeText(record.status || (record.isActive ?? record.is_active ? 'active' : 'archived') || 'active')

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    priority: normalizeNumber(record.priority ?? record.sort_order, 0),
    color: normalizeText(record.color),
    requiresAcknowledgment: normalizeBoolean(record.requiresAcknowledgment ?? record.requires_acknowledgment, false),
    triggersNotification: normalizeBoolean(record.triggersNotification ?? record.triggers_notification, true),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeIncidentCategory(record = {}) {
  const status = normalizeText(record.status || (record.isActive ?? record.is_active ? 'active' : 'archived') || 'active')

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    defaultSeverityCode: normalizeText(record.defaultSeverityCode ?? record.default_severity_code),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeVaccinationCategory(record = {}) {
  const status = normalizeText(record.status || (record.isActive ?? record.is_active ? 'active' : 'archived') || 'active')

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    recommendedAgeMonths: record.recommendedAgeMonths ?? record.recommended_age_months ?? '',
    isRequired: normalizeBoolean(record.isRequired ?? record.is_required, false),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeHealthCheckCategory(record = {}) {
  const status = normalizeText(record.status || (record.isActive ?? record.is_active ? 'active' : 'archived') || 'active')

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

function buildHealthSettingsPayload(settings = {}) {
  return {
    critical_alert_enabled: normalizeBoolean(settings.criticalAlertEnabled ?? settings.critical_alert_enabled, true),
    guardian_notification_enabled: normalizeBoolean(settings.guardianNotificationEnabled ?? settings.guardian_notification_enabled, true),
    teacher_notification_enabled: normalizeBoolean(settings.teacherNotificationEnabled ?? settings.teacher_notification_enabled, true),
    admin_notification_enabled: normalizeBoolean(settings.adminNotificationEnabled ?? settings.admin_notification_enabled, true),
    medication_reminder_enabled: normalizeBoolean(settings.medicationReminderEnabled ?? settings.medication_reminder_enabled, true),
    vaccination_reminder_enabled: normalizeBoolean(settings.vaccinationReminderEnabled ?? settings.vaccination_reminder_enabled, true),
    overdue_vaccination_alert_days: normalizeNumber(settings.overdueVaccinationAlertDays ?? settings.overdue_vaccination_alert_days, 30),
    medication_reminder_minutes_before: normalizeNumber(settings.medicationReminderMinutesBefore ?? settings.medication_reminder_minutes_before, 30),
  }
}

function buildSeverityPayload(level = {}) {
  return {
    name: normalizeText(level.name),
    code: normalizeText(level.code),
    priority: normalizeNumber(level.priority ?? level.sortOrder, 0),
    color: normalizeText(level.color),
    requires_acknowledgment: normalizeBoolean(level.requiresAcknowledgment ?? level.requires_acknowledgment, false),
    triggers_notification: normalizeBoolean(level.triggersNotification ?? level.triggers_notification, true),
    is_active: normalizeBoolean(level.isActive ?? level.is_active, true),
    sort_order: normalizeNumber(level.sortOrder ?? level.sort_order, 0),
  }
}

function buildIncidentCategoryPayload(category = {}) {
  return {
    name: normalizeText(category.name),
    code: normalizeText(category.code),
    description: normalizeText(category.description),
    default_severity_code: normalizeText(category.defaultSeverityCode ?? category.default_severity_code),
    is_active: normalizeBoolean(category.isActive ?? category.is_active, true),
    sort_order: normalizeNumber(category.sortOrder ?? category.sort_order, 0),
  }
}

function buildVaccinationCategoryPayload(category = {}) {
  return {
    name: normalizeText(category.name),
    code: normalizeText(category.code),
    description: normalizeText(category.description),
    recommended_age_months: category.recommendedAgeMonths ?? category.recommended_age_months ?? '',
    is_required: normalizeBoolean(category.isRequired ?? category.is_required, false),
    is_active: normalizeBoolean(category.isActive ?? category.is_active, true),
    sort_order: normalizeNumber(category.sortOrder ?? category.sort_order, 0),
  }
}

function buildHealthCheckCategoryPayload(category = {}) {
  return {
    name: normalizeText(category.name),
    code: normalizeText(category.code),
    description: normalizeText(category.description),
    is_active: normalizeBoolean(category.isActive ?? category.is_active, true),
    sort_order: normalizeNumber(category.sortOrder ?? category.sort_order, 0),
  }
}

export async function fetchHealthSettings(options = {}) {
  const response = await http.get('/preschool/settings/health', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeHealthSettings(payload.settings || payload)
}

export async function updateHealthSettings(settings = {}) {
  const response = await http.put('/preschool/settings/health', buildHealthSettingsPayload(settings))
  const payload = unwrapApiData(response) || {}
  return normalizeHealthSettings(payload.settings || payload)
}

export async function fetchSeverityLevels(options = {}) {
  const response = await http.get('/preschool/settings/health/severity-levels', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeSeverityLevel)
}

export async function createSeverityLevel(level = {}) {
  const response = await http.post('/preschool/settings/health/severity-levels', buildSeverityPayload(level))
  const payload = unwrapApiData(response) || {}
  return normalizeSeverityLevel(unwrapRecord(response, ['severity', 'severityLevel', 'level', 'data']) || payload)
}

export async function updateSeverityLevel(levelOrId, level = {}) {
  const levelId = resolveId(levelOrId)
  const response = await http.put(
    `/preschool/settings/health/severity-levels/${encodeURIComponent(levelId)}`,
    buildSeverityPayload(level),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeSeverityLevel(unwrapRecord(response, ['severity', 'severityLevel', 'level', 'data']) || payload)
}

export async function archiveSeverityLevel(levelOrId) {
  const levelId = resolveId(levelOrId)
  const response = await http.post(`/preschool/settings/health/severity-levels/${encodeURIComponent(levelId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeSeverityLevel(unwrapRecord(response, ['severity', 'severityLevel', 'level', 'data']) || payload)
}

export async function fetchIncidentCategories(options = {}) {
  const response = await http.get('/preschool/settings/health/incident-categories', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeIncidentCategory)
}

export async function createIncidentCategory(category = {}) {
  const response = await http.post('/preschool/settings/health/incident-categories', buildIncidentCategoryPayload(category))
  const payload = unwrapApiData(response) || {}
  return normalizeIncidentCategory(unwrapRecord(response, ['category', 'incidentCategory', 'data']) || payload)
}

export async function updateIncidentCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.put(
    `/preschool/settings/health/incident-categories/${encodeURIComponent(categoryId)}`,
    buildIncidentCategoryPayload(category),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeIncidentCategory(unwrapRecord(response, ['category', 'incidentCategory', 'data']) || payload)
}

export async function archiveIncidentCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.post(`/preschool/settings/health/incident-categories/${encodeURIComponent(categoryId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeIncidentCategory(unwrapRecord(response, ['category', 'incidentCategory', 'data']) || payload)
}

export async function fetchVaccinationCategories(options = {}) {
  const response = await http.get('/preschool/settings/health/vaccination-categories', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeVaccinationCategory)
}

export async function createVaccinationCategory(category = {}) {
  const response = await http.post('/preschool/settings/health/vaccination-categories', buildVaccinationCategoryPayload(category))
  const payload = unwrapApiData(response) || {}
  return normalizeVaccinationCategory(unwrapRecord(response, ['category', 'vaccinationCategory', 'data']) || payload)
}

export async function updateVaccinationCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.put(
    `/preschool/settings/health/vaccination-categories/${encodeURIComponent(categoryId)}`,
    buildVaccinationCategoryPayload(category),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeVaccinationCategory(unwrapRecord(response, ['category', 'vaccinationCategory', 'data']) || payload)
}

export async function archiveVaccinationCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.post(`/preschool/settings/health/vaccination-categories/${encodeURIComponent(categoryId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeVaccinationCategory(unwrapRecord(response, ['category', 'vaccinationCategory', 'data']) || payload)
}

export async function fetchHealthCheckCategories(options = {}) {
  const response = await http.get('/preschool/settings/health/check-categories', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeHealthCheckCategory)
}

export async function createHealthCheckCategory(category = {}) {
  const response = await http.post('/preschool/settings/health/check-categories', buildHealthCheckCategoryPayload(category))
  const payload = unwrapApiData(response) || {}
  return normalizeHealthCheckCategory(unwrapRecord(response, ['category', 'healthCheckCategory', 'data']) || payload)
}

export async function updateHealthCheckCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.put(
    `/preschool/settings/health/check-categories/${encodeURIComponent(categoryId)}`,
    buildHealthCheckCategoryPayload(category),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeHealthCheckCategory(unwrapRecord(response, ['category', 'healthCheckCategory', 'data']) || payload)
}

export async function archiveHealthCheckCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  const response = await http.post(`/preschool/settings/health/check-categories/${encodeURIComponent(categoryId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeHealthCheckCategory(unwrapRecord(response, ['category', 'healthCheckCategory', 'data']) || payload)
}
