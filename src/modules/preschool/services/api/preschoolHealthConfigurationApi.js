const HEALTH_SETTINGS_STORAGE_KEY = 'hfccf.preschool.health-settings'
const SEVERITY_LEVELS_STORAGE_KEY = 'hfccf.preschool.health-severity-levels'
const INCIDENT_CATEGORIES_STORAGE_KEY = 'hfccf.preschool.health-incident-categories'
const VACCINATION_CATEGORIES_STORAGE_KEY = 'hfccf.preschool.health-vaccination-categories'
const HEALTH_CHECK_CATEGORIES_STORAGE_KEY = 'hfccf.preschool.health-check-categories'

const DEFAULT_HEALTH_SETTINGS = {
  criticalAlertEnabled: true,
  guardianNotificationEnabled: true,
  teacherNotificationEnabled: true,
  adminNotificationEnabled: true,
  medicationReminderEnabled: true,
  vaccinationReminderEnabled: true,
  overdueVaccinationAlertDays: 30,
  medicationReminderMinutesBefore: 30,
}

const DEFAULT_SEVERITY_LEVELS = [
  {
    id: 'critical',
    name: 'Critical',
    code: 'critical',
    priority: 1,
    color: '#dc2626',
    requiresAcknowledgment: true,
    triggersNotification: true,
    isActive: true,
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 'high',
    name: 'High',
    code: 'high',
    priority: 2,
    color: '#ea580c',
    requiresAcknowledgment: true,
    triggersNotification: true,
    isActive: true,
    status: 'active',
    sortOrder: 2,
  },
  {
    id: 'medium',
    name: 'Medium',
    code: 'medium',
    priority: 3,
    color: '#d97706',
    requiresAcknowledgment: false,
    triggersNotification: true,
    isActive: true,
    status: 'active',
    sortOrder: 3,
  },
  {
    id: 'low',
    name: 'Low',
    code: 'low',
    priority: 4,
    color: '#2563eb',
    requiresAcknowledgment: false,
    triggersNotification: false,
    isActive: true,
    status: 'active',
    sortOrder: 4,
  },
]

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

function readStoredJson(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback
    }

    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback

    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStoredJson(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures and keep the page usable.
  }
}

function cloneRows(rows = []) {
  return Array.isArray(rows) ? rows.map((row) => ({ ...row })) : []
}

function createEmptyListResponse(items = []) {
  return {
    items,
    pagination: {
      page: 1,
      perPage: Math.max(items.length, 1),
      total: items.length,
      totalPages: items.length ? 1 : 0,
    },
  }
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

function resolveStoredList(key, defaults) {
  const stored = readStoredJson(key, defaults)
  return Array.isArray(stored) ? stored : cloneRows(defaults)
}

function archiveStoredListItem(key, id, normalizer) {
  const items = resolveStoredList(key, [])
  const index = items.findIndex((item) => String(item.id) === String(id))

  if (index >= 0) {
    items[index] = normalizer({
      ...items[index],
      isActive: false,
      status: 'archived',
    })
    writeStoredJson(key, items)
    return items[index]
  }

  return normalizer({ id, isActive: false, status: 'archived' })
}

export async function fetchHealthSettings(options = {}) {
  void options.signal
  return normalizeHealthSettings(
    readStoredJson(HEALTH_SETTINGS_STORAGE_KEY, DEFAULT_HEALTH_SETTINGS),
  )
}

export async function updateHealthSettings(settings = {}) {
  const payload = buildHealthSettingsPayload(settings)
  const next = normalizeHealthSettings({
    ...DEFAULT_HEALTH_SETTINGS,
    ...readStoredJson(HEALTH_SETTINGS_STORAGE_KEY, DEFAULT_HEALTH_SETTINGS),
    criticalAlertEnabled: payload.critical_alert_enabled,
    guardianNotificationEnabled: payload.guardian_notification_enabled,
    teacherNotificationEnabled: payload.teacher_notification_enabled,
    adminNotificationEnabled: payload.admin_notification_enabled,
    medicationReminderEnabled: payload.medication_reminder_enabled,
    vaccinationReminderEnabled: payload.vaccination_reminder_enabled,
    overdueVaccinationAlertDays: payload.overdue_vaccination_alert_days,
    medicationReminderMinutesBefore: payload.medication_reminder_minutes_before,
  })

  writeStoredJson(HEALTH_SETTINGS_STORAGE_KEY, next)
  return next
}

export async function fetchSeverityLevels(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(SEVERITY_LEVELS_STORAGE_KEY, DEFAULT_SEVERITY_LEVELS)).map(normalizeSeverityLevel),
  )
}

export async function createSeverityLevel(level = {}) {
  const next = normalizeSeverityLevel({
    id: resolveId(level) || Date.now().toString(),
    ...buildSeverityPayload(level),
    status: normalizeBoolean(level.isActive ?? level.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(SEVERITY_LEVELS_STORAGE_KEY, DEFAULT_SEVERITY_LEVELS)
  items.unshift(next)
  writeStoredJson(SEVERITY_LEVELS_STORAGE_KEY, items)
  return next
}

export async function updateSeverityLevel(levelOrId, level = {}) {
  const levelId = resolveId(levelOrId)
  const next = normalizeSeverityLevel({
    id: levelId,
    ...buildSeverityPayload(level),
    status: normalizeBoolean(level.isActive ?? level.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(SEVERITY_LEVELS_STORAGE_KEY, DEFAULT_SEVERITY_LEVELS)
  const index = items.findIndex((item) => String(item.id) === String(levelId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(SEVERITY_LEVELS_STORAGE_KEY, items)
  return next
}

export async function archiveSeverityLevel(levelOrId) {
  const levelId = resolveId(levelOrId)
  return archiveStoredListItem(SEVERITY_LEVELS_STORAGE_KEY, levelId, normalizeSeverityLevel)
}

export async function fetchIncidentCategories(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(INCIDENT_CATEGORIES_STORAGE_KEY, [])).map(normalizeIncidentCategory),
  )
}

export async function createIncidentCategory(category = {}) {
  const next = normalizeIncidentCategory({
    id: resolveId(category) || Date.now().toString(),
    ...buildIncidentCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(INCIDENT_CATEGORIES_STORAGE_KEY, [])
  items.unshift(next)
  writeStoredJson(INCIDENT_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function updateIncidentCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const next = normalizeIncidentCategory({
    id: categoryId,
    ...buildIncidentCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(INCIDENT_CATEGORIES_STORAGE_KEY, [])
  const index = items.findIndex((item) => String(item.id) === String(categoryId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(INCIDENT_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function archiveIncidentCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  return archiveStoredListItem(INCIDENT_CATEGORIES_STORAGE_KEY, categoryId, normalizeIncidentCategory)
}

export async function fetchVaccinationCategories(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(VACCINATION_CATEGORIES_STORAGE_KEY, [])).map(normalizeVaccinationCategory),
  )
}

export async function createVaccinationCategory(category = {}) {
  const next = normalizeVaccinationCategory({
    id: resolveId(category) || Date.now().toString(),
    ...buildVaccinationCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(VACCINATION_CATEGORIES_STORAGE_KEY, [])
  items.unshift(next)
  writeStoredJson(VACCINATION_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function updateVaccinationCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const next = normalizeVaccinationCategory({
    id: categoryId,
    ...buildVaccinationCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(VACCINATION_CATEGORIES_STORAGE_KEY, [])
  const index = items.findIndex((item) => String(item.id) === String(categoryId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(VACCINATION_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function archiveVaccinationCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  return archiveStoredListItem(VACCINATION_CATEGORIES_STORAGE_KEY, categoryId, normalizeVaccinationCategory)
}

export async function fetchHealthCheckCategories(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, [])).map(normalizeHealthCheckCategory),
  )
}

export async function createHealthCheckCategory(category = {}) {
  const next = normalizeHealthCheckCategory({
    id: resolveId(category) || Date.now().toString(),
    ...buildHealthCheckCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, [])
  items.unshift(next)
  writeStoredJson(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function updateHealthCheckCategory(categoryOrId, category = {}) {
  const categoryId = resolveId(categoryOrId)
  const next = normalizeHealthCheckCategory({
    id: categoryId,
    ...buildHealthCheckCategoryPayload(category),
    status: normalizeBoolean(category.isActive ?? category.is_active, true) ? 'active' : 'archived',
  })

  const items = resolveStoredList(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, [])
  const index = items.findIndex((item) => String(item.id) === String(categoryId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, items)
  return next
}

export async function archiveHealthCheckCategory(categoryOrId) {
  const categoryId = resolveId(categoryOrId)
  return archiveStoredListItem(HEALTH_CHECK_CATEGORIES_STORAGE_KEY, categoryId, normalizeHealthCheckCategory)
}
