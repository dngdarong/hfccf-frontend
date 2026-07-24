import { computed, ref, watch } from 'vue'
import {
  fetchPreschoolSettingsBackbone,
  fetchReportPeriods,
  updatePreschoolSettingsBackbone,
} from '@/modules/preschool/services/preschoolApi'

// Keep Preschool settings state in one composable so the page can stay focused
// on layout, validation messaging, and section orchestration. The backend
// snapshot acts as the academic backbone for reports, assignments, and the
// classroom configuration workflow.
function cloneValue(value) {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)]))
  }

  return value
}

function createDate(year, month, day) {
  return new Date(year, month, day)
}

function isDateValue(value) {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

function toDateValue(value) {
  if (isDateValue(value)) {
    return cloneValue(value)
  }

  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDateString(value) {
  const date = value instanceof Date ? value : value ? new Date(value) : null

  if (!date || Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function validateRequiredText(value) {
  return String(value || '').trim().length > 0
}

function compareDateOrder(startDate, endDate) {
  if (!isDateValue(startDate) || !isDateValue(endDate)) return false

  return endDate.getTime() >= startDate.getTime()
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeClassLevelCode(value) {
  const rawValue = value && typeof value === 'object'
    ? value.code || value.classLevelCode || value.class_level_code || value.nameEn || value.name_en || value.name || value.label || ''
    : value
  const normalized = normalizeText(rawValue).toLowerCase()

  if (!normalized) return ''
  if (normalized === 'nursery' || normalized === 'nur') return 'NUR'
  if (normalized === 'kindergarten a' || normalized === 'kindergarten-1' || normalized === 'kindergarten_1' || normalized === 'kga') {
    return 'KGA'
  }
  if (normalized === 'kindergarten b' || normalized === 'kindergarten-2' || normalized === 'kindergarten_2' || normalized === 'kgb') {
    return 'KGB'
  }
  if (normalized === 'prep' || normalized === 'pre') return 'PRE'

  return normalized.toUpperCase()
}

export function createDefaultAcademicYear() {
  return {
    currentAcademicYear: '2025 - 2026',
    startDate: createDate(2025, 6, 1),
    endDate: createDate(2026, 3, 30),
    status: 'active',
  }
}

export function createEmptyAcademicYearDraft() {
  return {
    id: '',
    code: '',
    label: '',
    startDate: null,
    endDate: null,
    status: 'active',
    isCurrent: false,
    notes: '',
  }
}

export function createDefaultTerm(id = 'term-1', name = 'Term 1', startDate = createDate(2025, 6, 1), endDate = createDate(2025, 9, 30), status = 'active') {
  return {
    id,
    name,
    startDate,
    endDate,
    status,
  }
}

export function createDefaultClassConfiguration(id = 'class-1', classLevel = 'nursery', capacity = 18, assignedTeacher = 'lead-teacher', room = 'Room A', status = 'active') {
  return {
    id,
    classLevel: normalizeClassLevelCode(classLevel),
    capacity,
    assignedTeacher,
    room,
    status,
  }
}

export function createDefaultAttendanceConfiguration() {
  return {
    markingWindow: '07:30 - 08:15',
    lateThreshold: 15,
    absenceRule: 'window-and-threshold',
    teacherCanEditAttendance: true,
  }
}

export function createDefaultAssessmentConfiguration() {
  return {
    assessmentCycle: 'term',
    finalizationMode: 'publish-only',
    defaultTemplate: 'PRESCHOOL-DEVELOPMENT-CORE',
    requireTeacherNotes: true,
    enableRiskTracking: true,
    riskThreshold: 60,
    enableAutoRating: true,
    requireObservation: true,
    requireTeacherComment: false,
    allowArchiving: true,
    notifyOnHighRisk: true,
  }
}

export function createDefaultScheduleConfiguration() {
  return {
    weeklyMode: 'five-day',
    defaultSlotMinutes: 45,
    planningWindow: 'weekly',
    allowTeacherOverrides: false,
  }
}

export function createDefaultEnrollmentConfiguration() {
  return {
    enrollmentCycle: 'term',
    defaultClassLevel: 'nursery',
    transferPolicy: 'admin-only',
    capacityReviewMode: 'manual',
  }
}

export function createDefaultPaymentConfiguration() {
  return {
    defaultTuitionFee: 120,
    paymentCycle: 'monthly',
    dueDay: 5,
    lateFeeRule: 'fixed',
    enableOverdueReminders: true,
  }
}

export function createDefaultPreschoolSettings() {
  return {
    academicYear: createDefaultAcademicYear(),
    terms: [
      createDefaultTerm('term-1', 'Term 1', createDate(2025, 6, 1), createDate(2025, 9, 30), 'active'),
      createDefaultTerm('term-2', 'Term 2', createDate(2025, 10, 1), createDate(2026, 1, 28), 'inactive'),
    ],
    classConfigurations: [
      createDefaultClassConfiguration('class-1', 'nursery', 18, 'lead-teacher', 'Room A', 'active'),
      createDefaultClassConfiguration('class-2', 'kindergarten-1', 20, 'assistant-teacher', 'Room B', 'inactive'),
      createDefaultClassConfiguration('class-3', 'prep', 22, 'floating-teacher', 'Room C', 'active'),
    ],
    attendance: createDefaultAttendanceConfiguration(),
    assessment: createDefaultAssessmentConfiguration(),
    schedule: createDefaultScheduleConfiguration(),
    enrollment: createDefaultEnrollmentConfiguration(),
    payment: createDefaultPaymentConfiguration(),
  }
}

function createSectionValidation() {
  return {}
}

export function createEmptyTermDraft() {
  return {
    id: '',
    academicYearId: '',
    code: '',
    name: '',
    startDate: null,
    endDate: null,
    status: 'active',
    sortOrder: 0,
    notes: '',
  }
}

export function validatePreschoolAcademicYearDraft(yearDraft = {}) {
  const errors = createSectionValidation()

  if (!validateRequiredText(yearDraft.code)) {
    errors.code = 'required'
  }

  if (!validateRequiredText(yearDraft.label)) {
    errors.label = 'required'
  }

  if (!isDateValue(yearDraft.startDate)) {
    errors.startDate = 'required'
  }

  if (!isDateValue(yearDraft.endDate)) {
    errors.endDate = 'required'
  }

  if (isDateValue(yearDraft.startDate) && isDateValue(yearDraft.endDate) && !compareDateOrder(yearDraft.startDate, yearDraft.endDate)) {
    errors.endDate = 'range'
  }

  if (!validateRequiredText(yearDraft.status)) {
    errors.status = 'required'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validatePreschoolTermDraft(termDraft = {}) {
  const errors = createSectionValidation()

  if (!validateRequiredText(termDraft.academicYearId)) {
    errors.academicYearId = 'required'
  }

  if (!validateRequiredText(termDraft.code)) {
    errors.code = 'required'
  }

  if (!validateRequiredText(termDraft.name)) {
    errors.name = 'required'
  }

  if (!isDateValue(termDraft.startDate)) {
    errors.startDate = 'required'
  }

  if (!isDateValue(termDraft.endDate)) {
    errors.endDate = 'required'
  }

  if (isDateValue(termDraft.startDate) && isDateValue(termDraft.endDate) && !compareDateOrder(termDraft.startDate, termDraft.endDate)) {
    errors.endDate = 'range'
  }

  if (!validateRequiredText(termDraft.status)) {
    errors.status = 'required'
  }

  if (!(Number(termDraft.sortOrder) >= 0)) {
    errors.sortOrder = 'positive'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

function normalizeSettingsForForm(settings = {}) {
  const defaults = createDefaultPreschoolSettings()
  const academicYear = settings.academicYear || {}

  return {
    academicYear: {
      ...defaults.academicYear,
      ...academicYear,
      startDate: toDateValue(academicYear.startDate || academicYear.start_date) || defaults.academicYear.startDate,
      endDate: toDateValue(academicYear.endDate || academicYear.end_date) || defaults.academicYear.endDate,
    },
    terms: Array.isArray(settings.terms) && settings.terms.length
      ? settings.terms.map((term, index) => ({
        ...createEmptyTermDraft(),
        id: normalizeText(term.id || term.key || `term-${index + 1}`),
        name: normalizeText(term.name || `Term ${index + 1}`),
        startDate: toDateValue(term.startDate || term.start_date),
        endDate: toDateValue(term.endDate || term.end_date),
        status: normalizeText(term.status || 'active'),
      }))
      : cloneValue(defaults.terms),
    classConfigurations: Array.isArray(settings.classConfigurations) && settings.classConfigurations.length
      ? settings.classConfigurations.map((item, index) => ({
        id: normalizeText(item.id || item.key || `class-${index + 1}`),
        classLevel: normalizeClassLevelCode(item.classLevel || item.class_level || 'nursery'),
        capacity: Number(item.capacity ?? 0),
        assignedTeacher: normalizeText(item.assignedTeacher || item.assigned_teacher || 'lead-teacher'),
        room: normalizeText(item.room || ''),
        status: normalizeText(item.status || 'active'),
      }))
      : cloneValue(defaults.classConfigurations),
    attendance: {
      ...defaults.attendance,
      ...settings.attendance,
      markingWindow: normalizeText(settings.attendance?.markingWindow || settings.attendance?.marking_window || defaults.attendance.markingWindow),
      lateThreshold: Number(settings.attendance?.lateThreshold ?? settings.attendance?.late_threshold ?? defaults.attendance.lateThreshold),
      absenceRule: normalizeText(settings.attendance?.absenceRule || settings.attendance?.absence_rule || defaults.attendance.absenceRule),
      teacherCanEditAttendance: Boolean(settings.attendance?.teacherCanEditAttendance ?? settings.attendance?.teacher_can_edit_attendance ?? defaults.attendance.teacherCanEditAttendance),
    },
    assessment: {
      ...defaults.assessment,
      ...settings.assessment,
      assessmentCycle: normalizeText(settings.assessment?.assessmentCycle || settings.assessment?.assessment_cycle || defaults.assessment.assessmentCycle),
      finalizationMode: normalizeText(settings.assessment?.finalizationMode || settings.assessment?.finalization_mode || defaults.assessment.finalizationMode),
      defaultTemplate: normalizeText(settings.assessment?.defaultTemplate || settings.assessment?.default_template || defaults.assessment.defaultTemplate),
      requireTeacherNotes: Boolean(settings.assessment?.requireTeacherNotes ?? settings.assessment?.require_teacher_notes ?? defaults.assessment.requireTeacherNotes),
      enableRiskTracking: Boolean(settings.assessment?.enableRiskTracking ?? settings.assessment?.enable_risk_tracking ?? defaults.assessment.enableRiskTracking),
      riskThreshold: Number(settings.assessment?.riskThreshold ?? settings.assessment?.risk_threshold ?? defaults.assessment.riskThreshold),
      enableAutoRating: Boolean(settings.assessment?.enableAutoRating ?? settings.assessment?.enable_auto_rating ?? defaults.assessment.enableAutoRating),
      requireObservation: Boolean(settings.assessment?.requireObservation ?? settings.assessment?.require_observation ?? defaults.assessment.requireObservation),
      requireTeacherComment: Boolean(settings.assessment?.requireTeacherComment ?? settings.assessment?.require_teacher_comment ?? defaults.assessment.requireTeacherComment),
      allowArchiving: Boolean(settings.assessment?.allowArchiving ?? settings.assessment?.allow_archiving ?? defaults.assessment.allowArchiving),
      notifyOnHighRisk: Boolean(settings.assessment?.notifyOnHighRisk ?? settings.assessment?.notify_on_high_risk ?? defaults.assessment.notifyOnHighRisk),
    },
    schedule: {
      ...defaults.schedule,
      ...settings.schedule,
      weeklyMode: normalizeText(settings.schedule?.weeklyMode || settings.schedule?.weekly_mode || defaults.schedule.weeklyMode),
      defaultSlotMinutes: Number(settings.schedule?.defaultSlotMinutes ?? settings.schedule?.default_slot_minutes ?? defaults.schedule.defaultSlotMinutes),
      planningWindow: normalizeText(settings.schedule?.planningWindow || settings.schedule?.planning_window || defaults.schedule.planningWindow),
      allowTeacherOverrides: Boolean(settings.schedule?.allowTeacherOverrides ?? settings.schedule?.allow_teacher_overrides ?? defaults.schedule.allowTeacherOverrides),
    },
    enrollment: {
      ...defaults.enrollment,
      ...settings.enrollment,
      enrollmentCycle: normalizeText(settings.enrollment?.enrollmentCycle || settings.enrollment?.enrollment_cycle || defaults.enrollment.enrollmentCycle),
      defaultClassLevel: normalizeText(settings.enrollment?.defaultClassLevel || settings.enrollment?.default_class_level || defaults.enrollment.defaultClassLevel),
      transferPolicy: normalizeText(settings.enrollment?.transferPolicy || settings.enrollment?.transfer_policy || defaults.enrollment.transferPolicy),
      capacityReviewMode: normalizeText(settings.enrollment?.capacityReviewMode || settings.enrollment?.capacity_review_mode || defaults.enrollment.capacityReviewMode),
    },
    payment: {
      ...defaults.payment,
      ...settings.payment,
      defaultTuitionFee: Number(settings.payment?.defaultTuitionFee ?? settings.payment?.default_tuition_fee ?? defaults.payment.defaultTuitionFee),
      paymentCycle: normalizeText(settings.payment?.paymentCycle || settings.payment?.payment_cycle || defaults.payment.paymentCycle),
      dueDay: Number(settings.payment?.dueDay ?? settings.payment?.due_day ?? defaults.payment.dueDay),
      lateFeeRule: normalizeText(settings.payment?.lateFeeRule || settings.payment?.late_fee_rule || defaults.payment.lateFeeRule),
      enableOverdueReminders: Boolean(settings.payment?.enableOverdueReminders ?? settings.payment?.enable_overdue_reminders ?? defaults.payment.enableOverdueReminders),
    },
  }
}

function serializeSettingsForSave(settings = {}) {
  return {
    academicYear: {
      currentAcademicYear: normalizeText(settings.academicYear?.currentAcademicYear),
      startDate: toDateString(settings.academicYear?.startDate),
      endDate: toDateString(settings.academicYear?.endDate),
      status: normalizeText(settings.academicYear?.status || 'active'),
    },
    terms: (settings.terms || []).map((term, index) => ({
      id: normalizeText(term.id || `term-${index + 1}`),
      name: normalizeText(term.name),
      startDate: toDateString(term.startDate),
      endDate: toDateString(term.endDate),
      status: normalizeText(term.status || 'active'),
    })),
    classConfigurations: (settings.classConfigurations || []).map((item, index) => ({
      id: normalizeText(item.id || `class-${index + 1}`),
      classLevel: normalizeClassLevelCode(item.classLevel),
      capacity: Number(item.capacity ?? 0),
      assignedTeacher: normalizeText(item.assignedTeacher),
      room: normalizeText(item.room),
      status: normalizeText(item.status || 'active'),
    })),
    attendance: {
      markingWindow: normalizeText(settings.attendance?.markingWindow),
      lateThreshold: Number(settings.attendance?.lateThreshold ?? 0),
      absenceRule: normalizeText(settings.attendance?.absenceRule),
      teacherCanEditAttendance: Boolean(settings.attendance?.teacherCanEditAttendance),
    },
    assessment: {
      assessmentCycle: normalizeText(settings.assessment?.assessmentCycle),
      finalizationMode: normalizeText(settings.assessment?.finalizationMode),
      defaultTemplate: normalizeText(settings.assessment?.defaultTemplate),
      requireTeacherNotes: Boolean(settings.assessment?.requireTeacherNotes),
      enableRiskTracking: Boolean(settings.assessment?.enableRiskTracking),
      riskThreshold: Number(settings.assessment?.riskThreshold ?? 0),
      enableAutoRating: Boolean(settings.assessment?.enableAutoRating),
      requireObservation: Boolean(settings.assessment?.requireObservation),
      requireTeacherComment: Boolean(settings.assessment?.requireTeacherComment),
      allowArchiving: Boolean(settings.assessment?.allowArchiving),
      notifyOnHighRisk: Boolean(settings.assessment?.notifyOnHighRisk),
    },
    schedule: {
      weeklyMode: normalizeText(settings.schedule?.weeklyMode),
      defaultSlotMinutes: Number(settings.schedule?.defaultSlotMinutes ?? 0),
      planningWindow: normalizeText(settings.schedule?.planningWindow),
      allowTeacherOverrides: Boolean(settings.schedule?.allowTeacherOverrides),
    },
    enrollment: {
      enrollmentCycle: normalizeText(settings.enrollment?.enrollmentCycle),
      defaultClassLevel: normalizeText(settings.enrollment?.defaultClassLevel),
      transferPolicy: normalizeText(settings.enrollment?.transferPolicy),
      capacityReviewMode: normalizeText(settings.enrollment?.capacityReviewMode),
    },
    payment: {
      defaultTuitionFee: Number(settings.payment?.defaultTuitionFee ?? 0),
      paymentCycle: normalizeText(settings.payment?.paymentCycle),
      dueDay: Number(settings.payment?.dueDay ?? 0),
      lateFeeRule: normalizeText(settings.payment?.lateFeeRule),
      enableOverdueReminders: Boolean(settings.payment?.enableOverdueReminders),
    },
  }
}

function validatePreschoolSettings(settings = {}) {
  const errors = {
    academicYear: createSectionValidation(),
    terms: {},
    classConfigurations: {},
    attendance: createSectionValidation(),
    assessment: createSectionValidation(),
    schedule: createSectionValidation(),
    enrollment: createSectionValidation(),
    payment: createSectionValidation(),
  }

  const academicYear = settings.academicYear || {}
  if (!validateRequiredText(academicYear.currentAcademicYear)) {
    errors.academicYear.currentAcademicYear = 'required'
  }
  if (!isDateValue(academicYear.startDate)) {
    errors.academicYear.startDate = 'required'
  }
  if (!isDateValue(academicYear.endDate)) {
    errors.academicYear.endDate = 'required'
  }
  if (isDateValue(academicYear.startDate) && isDateValue(academicYear.endDate) && !compareDateOrder(academicYear.startDate, academicYear.endDate)) {
    errors.academicYear.endDate = 'range'
  }
  if (!validateRequiredText(academicYear.status)) {
    errors.academicYear.status = 'required'
  }

  ;(settings.terms || []).forEach((term, index) => {
    const termErrors = createSectionValidation()

    if (!validateRequiredText(term.name)) termErrors.name = 'required'
    if (!isDateValue(term.startDate)) termErrors.startDate = 'required'
    if (!isDateValue(term.endDate)) termErrors.endDate = 'required'
    if (isDateValue(term.startDate) && isDateValue(term.endDate) && !compareDateOrder(term.startDate, term.endDate)) {
      termErrors.endDate = 'range'
    }
    if (!validateRequiredText(term.status)) termErrors.status = 'required'

    if (Object.keys(termErrors).length) {
      errors.terms[index] = termErrors
    }
  })

  ;(settings.classConfigurations || []).forEach((item, index) => {
    const classErrors = createSectionValidation()

    if (!validateRequiredText(item.classLevel)) classErrors.classLevel = 'required'
    if (!(Number(item.capacity) > 0)) classErrors.capacity = 'positive'
    if (!validateRequiredText(item.status)) classErrors.status = 'required'

    if (Object.keys(classErrors).length) {
      errors.classConfigurations[index] = classErrors
    }
  })

  const attendance = settings.attendance || {}
  if (!validateRequiredText(attendance.markingWindow)) errors.attendance.markingWindow = 'required'
  if (!(Number(attendance.lateThreshold) >= 0)) errors.attendance.lateThreshold = 'positive'
  if (!validateRequiredText(attendance.absenceRule)) errors.attendance.absenceRule = 'required'
  if (typeof attendance.teacherCanEditAttendance !== 'boolean') errors.attendance.teacherCanEditAttendance = 'required'

  const assessment = settings.assessment || {}
  if (!validateRequiredText(assessment.assessmentCycle)) errors.assessment.assessmentCycle = 'required'
  if (!validateRequiredText(assessment.finalizationMode)) errors.assessment.finalizationMode = 'required'
  if (!validateRequiredText(assessment.defaultTemplate)) errors.assessment.defaultTemplate = 'required'
  if (typeof assessment.requireTeacherNotes !== 'boolean') errors.assessment.requireTeacherNotes = 'required'
  if (typeof assessment.enableRiskTracking !== 'boolean') errors.assessment.enableRiskTracking = 'required'
  if (!(Number(assessment.riskThreshold) >= 0 && Number(assessment.riskThreshold) <= 100)) errors.assessment.riskThreshold = 'range'
  if (typeof assessment.enableAutoRating !== 'boolean') errors.assessment.enableAutoRating = 'required'
  if (typeof assessment.requireObservation !== 'boolean') errors.assessment.requireObservation = 'required'
  if (typeof assessment.requireTeacherComment !== 'boolean') errors.assessment.requireTeacherComment = 'required'
  if (typeof assessment.allowArchiving !== 'boolean') errors.assessment.allowArchiving = 'required'
  if (typeof assessment.notifyOnHighRisk !== 'boolean') errors.assessment.notifyOnHighRisk = 'required'

  const schedule = settings.schedule || {}
  if (!validateRequiredText(schedule.weeklyMode)) errors.schedule.weeklyMode = 'required'
  if (!(Number(schedule.defaultSlotMinutes) > 0)) errors.schedule.defaultSlotMinutes = 'positive'
  if (!validateRequiredText(schedule.planningWindow)) errors.schedule.planningWindow = 'required'
  if (typeof schedule.allowTeacherOverrides !== 'boolean') errors.schedule.allowTeacherOverrides = 'required'

  const enrollment = settings.enrollment || {}
  if (!validateRequiredText(enrollment.enrollmentCycle)) errors.enrollment.enrollmentCycle = 'required'
  if (!validateRequiredText(enrollment.defaultClassLevel)) errors.enrollment.defaultClassLevel = 'required'
  if (!validateRequiredText(enrollment.transferPolicy)) errors.enrollment.transferPolicy = 'required'
  if (!validateRequiredText(enrollment.capacityReviewMode)) errors.enrollment.capacityReviewMode = 'required'

  const payment = settings.payment || {}
  if (!(Number(payment.defaultTuitionFee) > 0)) errors.payment.defaultTuitionFee = 'positive'
  if (!validateRequiredText(payment.paymentCycle)) errors.payment.paymentCycle = 'required'
  if (!(Number(payment.dueDay) >= 1 && Number(payment.dueDay) <= 31)) errors.payment.dueDay = 'range'
  if (!validateRequiredText(payment.lateFeeRule)) errors.payment.lateFeeRule = 'required'
  if (typeof payment.enableOverdueReminders !== 'boolean') errors.payment.enableOverdueReminders = 'required'

  const issueCount = [
    errors.academicYear,
    ...Object.values(errors.terms),
    ...Object.values(errors.classConfigurations),
    errors.attendance,
    errors.assessment,
    errors.schedule,
    errors.enrollment,
    errors.payment,
  ].reduce((total, sectionErrors) => total + Object.keys(sectionErrors || {}).length, 0)

  return {
    errors,
    issueCount,
    isValid: issueCount === 0,
  }
}

export function usePreschoolSettings() {
  // The page owns the visible form, while this composable keeps the local
  // configuration snapshot, validation logic, and reset/save behavior together.
  const settings = ref(createDefaultPreschoolSettings())
  const savedSettings = ref(cloneValue(settings.value))
  const validationErrors = ref(validatePreschoolSettings(settings.value).errors)
  const lastSavedAt = ref(null)
  const reportPeriods = ref([])
  const loading = ref(false)
  const saving = ref(false)

  const issueCount = computed(() => validatePreschoolSettings(settings.value).issueCount)
  const hasValidationIssues = computed(() => issueCount.value > 0)

  // Keep validation state in sync with the live draft so each section can show
  // simple inline feedback without requiring a save attempt first.
  watch(
    settings,
    () => {
      validationErrors.value = validatePreschoolSettings(settings.value).errors
    },
    { deep: true, immediate: true },
  )

  async function loadSettings() {
    loading.value = true

    try {
      const response = await fetchPreschoolSettingsBackbone()
      const nextSettings = normalizeSettingsForForm(response.settings || {})
      settings.value = nextSettings
      savedSettings.value = cloneValue(nextSettings)
      validationErrors.value = validatePreschoolSettings(settings.value).errors
      return nextSettings
    } catch (error) {
      settings.value = cloneValue(savedSettings.value)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadReportPeriods() {
    loading.value = true

    try {
      reportPeriods.value = await fetchReportPeriods()
      return reportPeriods.value
    } finally {
      loading.value = false
    }
  }

  function refreshValidation() {
    const result = validatePreschoolSettings(settings.value)
    validationErrors.value = result.errors

    return result
  }

  async function saveSettings() {
    const result = refreshValidation()

    if (!result.isValid) {
      return { ok: false, issueCount: result.issueCount }
    }

    saving.value = true

    try {
      const payload = serializeSettingsForSave(settings.value)
      const response = await updatePreschoolSettingsBackbone(payload)
      const nextSettings = normalizeSettingsForForm(response.settings || payload)
      settings.value = nextSettings
      savedSettings.value = cloneValue(nextSettings)
      lastSavedAt.value = new Date()

      return { ok: true, issueCount: 0 }
    } finally {
      saving.value = false
    }
  }

  function resetSettings() {
    settings.value = cloneValue(savedSettings.value)
    validationErrors.value = validatePreschoolSettings(settings.value).errors
  }

  function addTerm(term) {
    settings.value.terms = [...(settings.value.terms || []), cloneValue(term)]
  }

  function updateTerm(index, term) {
    const next = [...(settings.value.terms || [])]
    next.splice(index, 1, cloneValue(term))
    settings.value.terms = next
  }

  function removeTerm(index) {
    settings.value.terms = (settings.value.terms || []).filter((_, itemIndex) => itemIndex !== index)
  }

  function addClassConfiguration(configuration) {
    settings.value.classConfigurations = [...(settings.value.classConfigurations || []), cloneValue(configuration)]
  }

  function updateClassConfiguration(index, field, value) {
    const next = [...(settings.value.classConfigurations || [])]
    const current = cloneValue(next[index] || {})
    next.splice(index, 1, {
      ...current,
      [field]: cloneValue(value),
    })
    settings.value.classConfigurations = next
  }

  function removeClassConfiguration(index) {
    settings.value.classConfigurations = (settings.value.classConfigurations || []).filter((_, itemIndex) => itemIndex !== index)
  }

  return {
    settings,
    savedSettings,
    validationErrors,
    lastSavedAt,
    issueCount,
    hasValidationIssues,
    loading,
    saving,
    reportPeriods,
    loadSettings,
    loadReportPeriods,
    refreshValidation,
    saveSettings,
    resetSettings,
    addTerm,
    updateTerm,
    removeTerm,
    addClassConfiguration,
    updateClassConfiguration,
    removeClassConfiguration,
  }
}
