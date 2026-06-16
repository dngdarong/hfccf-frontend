// Keep Preschool timetable mapping isolated so the weekly schedule UI can
// stay stable even if the backend response shape grows later.
function normalizeText(value) {
  return String(value ?? '').trim()
}

export function normalizeScheduleEntry(row = {}) {
  return {
    id: row.id ?? '',
    classId: row.classId ?? row.class_id ?? '',
    classCode: normalizeText(row.classCode || row.class_code),
    className: normalizeText(row.className || row.class_name),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherName: normalizeText(row.teacherName || row.teacher_name),
    dayOfWeek: Number(row.dayOfWeek ?? row.day_of_week ?? 0),
    startTime: normalizeText(row.startTime || row.start_time),
    endTime: normalizeText(row.endTime || row.end_time),
    room: normalizeText(row.room),
    activityLabel: normalizeText(row.activityLabel || row.activity_label),
    notes: normalizeText(row.notes),
    status: normalizeText(row.status || 'active'),
    isActive: Boolean(row.isActive ?? row.is_active ?? false),
    isArchived: Boolean(row.isArchived ?? row.is_archived ?? false),
    effectiveFrom: row.effectiveFrom || row.effective_from || '',
    effectiveUntil: row.effectiveUntil || row.effective_until || '',
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    updatedByUserId: row.updatedByUserId ?? row.updated_by_user_id ?? '',
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizeClassSummary(row = {}) {
  return {
    id: row.id ?? '',
    code: normalizeText(row.code),
    name: normalizeText(row.name),
    teacherUserId: row.teacherUserId ?? row.teacher_user_id ?? '',
    teacherName: normalizeText(row.teacherName || row.teacher_name || row.teacherDisplayName || row.teacher_display_name),
    room: normalizeText(row.room),
    raw: row,
  }
}

function normalizeTeacherSummary(row = {}) {
  return {
    id: row.id ?? '',
    name: normalizeText(row.name || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`),
    username: normalizeText(row.username),
    email: normalizeText(row.email),
    raw: row,
  }
}

export function normalizeScheduleListResponse(response = {}, fallbackPage = 1, fallbackPerPage = 10) {
  const items = Array.isArray(response.items) ? response.items.map(normalizeScheduleEntry) : []

  return {
    items,
    pagination: response.pagination || {
      page: fallbackPage,
      perPage: fallbackPerPage,
      total: items.length,
      totalPages: items.length > 0 ? 1 : 1,
    },
  }
}

export function normalizeScheduleViewBundle(response = {}, contextKey = 'class') {
  const items = Array.isArray(response.items) ? response.items.map(normalizeScheduleEntry) : []

  return {
    [contextKey]: contextKey === 'class'
      ? normalizeClassSummary(response.class || {})
      : normalizeTeacherSummary(response.teacher || {}),
    items,
    raw: response,
  }
}

export function normalizeScheduleRow(row = {}) {
  return normalizeScheduleEntry(row)
}
