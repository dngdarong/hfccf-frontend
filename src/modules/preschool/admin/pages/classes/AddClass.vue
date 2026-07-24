<script setup>
// Keep the class editor locale-driven so the visible setup labels stay
// consistent across EN/KH and regressions surface in unit tests.
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import AddClassIntro from '@/modules/preschool/admin/components/add-class/AddClassIntro.vue'
import AddClassFormFields from '@/modules/preschool/admin/components/add-class/AddClassFormFields.vue'
import AddClassFormActions from '@/modules/preschool/admin/components/add-class/AddClassFormActions.vue'
import {
  createPreschoolClass,
  fetchPreschoolClassLevels,
  fetchPreschoolClass,
  fetchPreschoolClasses,
  fetchPreschoolStudents,
  fetchPreschoolTeachers,
  updatePreschoolClass,
} from '@/modules/preschool/services/preschoolApi'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAdminAddClassPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const classesDirectoryPath = '/module/preschool-admin/classes'
const statusOptions = ['active', 'pending', 'closed']

const form = reactive({
  code: '',
  name: '',
  teacher: '',
  teacherDisplayName: '',
  classLevelId: '',
  schedule: '',
  status: statusOptions[0],
  room: '',
  notes: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isKh = computed(() => language.value === 'KH')
const teacherOptions = ref([])
const studentOptions = ref([])
const selectedStudentIds = ref([])
const selectedStudentAssignments = ref([])
const studentCountFallback = ref(0)
const studentsLoading = ref(false)
const classLevels = ref([])
const scheduleDays = ref([])
const scheduleStartTime = ref('')
const scheduleEndTime = ref('')
const scheduleRaw = ref('')
const scheduleMode = ref('structured')
const scheduleParseWarning = ref('')
const generatedCode = ref('')
const generatedCodeLoading = ref(false)
let codeRequestSeq = 0

const scheduleDayOptions = computed(() => ([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]).map((day) => ({
  value: day,
  label: t(`preschoolAddClass.weekdays.${day}`),
  payloadLabel: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }[day],
})))

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)
const editingClassId = computed(() => String(route.query.id || '').trim())
const teacherLabelMap = computed(() =>
  teacherOptions.value.reduce((carry, teacher) => {
    carry[String(teacher.value)] = teacher.label
    return carry
  }, {}),
)
const selectedClassLevel = computed(() =>
  classLevels.value.find((classLevel) => String(classLevel.id) === String(form.classLevelId)) || null,
)
const selectedClassLevelLabel = computed(() => getClassLevelLabel(selectedClassLevel.value))
const classLevelOptions = computed(() =>
  classLevels.value
    .filter((classLevel) => classLevel.isActive !== false)
    .slice()
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0) || String(left.nameEn || '').localeCompare(String(right.nameEn || '')))
    .map((classLevel) => ({
      value: classLevel.id,
      label: getClassLevelLabel(classLevel),
      code: classLevel.code,
    })),
)

function normalizeText(value) {
  return String(value ?? '').trim()
}

function getClassLevelLabel(classLevel) {
  const value = classLevel || {}
  return normalizeText(value.nameKh || value.name_kh || value.nameEn || value.name_en || value.name || value.code || '')
}

function resolveClassLevelId(value) {
  const normalized = normalizeText(value)
  if (!normalized) return ''

  const candidateById = classLevels.value.find((classLevel) => String(classLevel.id) === normalized)
  if (candidateById) return String(candidateById.id)

  const candidateByCode = classLevels.value.find((classLevel) => normalizeText(classLevel.code).toLowerCase() === normalized.toLowerCase())
  if (candidateByCode) return String(candidateByCode.id)

  const candidateByLabel = classLevels.value.find((classLevel) => getClassLevelLabel(classLevel).toLowerCase() === normalized.toLowerCase())
  if (candidateByLabel) return String(candidateByLabel.id)

  return ''
}

function normalizeClassStatus(status) {
  const normalized = normalizeText(status).toLowerCase()

  if (statusOptions.includes(normalized)) return normalized
  if (normalized === 'archived') return 'closed'
  return statusOptions[0]
}

function getStudentDisplayName(student = {}) {
  return normalizeText(
    student.fullName
    || student.name
    || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
  )
}

function getStudentCode(student = {}) {
  return normalizeText(student.publicId || student.studentCode || student.student_code || student.code || student.id)
}

function getStudentInitials(student = {}) {
  const name = getStudentDisplayName(student) || getStudentCode(student)
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'S'
}

function buildStudentOption(student = {}) {
  const name = getStudentDisplayName(student)
  const code = getStudentCode(student)

  return {
    value: student.id,
    name: name || code || String(student.id || ''),
    code,
    label: name && code ? `${name} — ${code}` : name || code || String(student.id || ''),
    avatarUrl: normalizeText(student.avatarUrl || student.avatar || student.profilePhotoUrl),
    initials: getStudentInitials(student),
  }
}

function sortStudentOptions(items = []) {
  return [...items].sort((left, right) => left.label.localeCompare(right.label))
}

function resetScheduleState() {
  scheduleDays.value = []
  scheduleStartTime.value = ''
  scheduleEndTime.value = ''
  scheduleRaw.value = ''
  scheduleMode.value = 'structured'
  scheduleParseWarning.value = ''
  form.schedule = ''
}

function getDayCode(day) {
  return String(day || '').trim().toLowerCase()
}

function formatTimeValue(value) {
  return String(value || '').trim()
}

function parseTimeToMinutes(value) {
  const match = formatTimeValue(value).match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return hours * 60 + minutes
}

function formatScheduleTimeRange(startTime, endTime) {
  const start = formatTimeValue(startTime)
  const end = formatTimeValue(endTime)
  if (!start || !end) return ''
  return `${start}–${end}`
}

function formatScheduleDays(days = [], usePayloadLabels = false) {
  const labels = scheduleDayOptions.value
    .filter((option) => days.includes(option.value))
    .map((option) => (usePayloadLabels ? option.payloadLabel : option.label))

  return labels.join(', ')
}

function buildScheduleString(days = scheduleDays.value, startTime = scheduleStartTime.value, endTime = scheduleEndTime.value) {
  const dayText = formatScheduleDays(days, true)
  const timeText = formatScheduleTimeRange(startTime, endTime)

  if (!dayText || !timeText) return ''
  return `${dayText}, ${timeText}`
}

function buildSchedulePreview(days = scheduleDays.value, startTime = scheduleStartTime.value, endTime = scheduleEndTime.value) {
  if (scheduleMode.value === 'raw' && scheduleRaw.value) return scheduleRaw.value

  const dayText = formatScheduleDays(days, false)
  const timeText = formatScheduleTimeRange(startTime, endTime)

  if (dayText && timeText) return `${dayText} · ${timeText}`
  if (dayText) return dayText
  if (timeText) return timeText
  return t('preschoolAddClass.schedulePreviewEmpty')
}

const schedulePreview = computed(() => buildSchedulePreview())
const scheduleIsStructured = computed(() => scheduleMode.value !== 'raw')
const scheduleHasWarning = computed(() => scheduleMode.value === 'raw' && Boolean(scheduleParseWarning.value))

function syncScheduleValue() {
  if (scheduleMode.value === 'raw') {
    form.schedule = scheduleRaw.value
    return
  }

  form.schedule = buildScheduleString()
}

function ensureStructuredSchedule() {
  if (scheduleMode.value === 'raw') {
    scheduleMode.value = 'structured'
    scheduleParseWarning.value = ''
    scheduleRaw.value = ''
  }
}

function updateScheduleDay(day, checked) {
  ensureStructuredSchedule()
  const normalized = getDayCode(day)
  const current = new Set(scheduleDays.value)

  if (checked) {
    current.add(normalized)
  } else {
    current.delete(normalized)
  }

  scheduleDays.value = [...current]
  syncScheduleValue()
}

function updateScheduleStartTime(value) {
  ensureStructuredSchedule()
  scheduleStartTime.value = formatTimeValue(value)
  syncScheduleValue()
}

function updateScheduleEndTime(value) {
  ensureStructuredSchedule()
  scheduleEndTime.value = formatTimeValue(value)
  syncScheduleValue()
}

function formatParsedScheduleDays(rawValue) {
  const normalized = String(rawValue || '').toLowerCase()
  const selected = []
  const dayPatterns = [
    ['monday', /\b(mon|monday)\b/],
    ['tuesday', /\b(tue|tues|tuesday)\b/],
    ['wednesday', /\b(wed|weds|wednesday)\b/],
    ['thursday', /\b(thu|thur|thurs|thursday)\b/],
    ['friday', /\b(fri|friday)\b/],
    ['saturday', /\b(sat|saturday)\b/],
    ['sunday', /\b(sun|sunday)\b/],
  ]

  dayPatterns.forEach(([day, pattern]) => {
    if (pattern.test(normalized)) {
      selected.push(day)
    }
  })

  return selected
}

function parseScheduleString(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return null

  const timeMatch = value.match(/(\d{1,2}:\d{2}\s?(?:am|pm)?)[\s]*[–—-][\s]*(\d{1,2}:\d{2}\s?(?:am|pm)?)/i)
  if (!timeMatch) return null

  const daysPart = value.slice(0, timeMatch.index).replace(/[,·•]+$/, '').trim()
  const days = formatParsedScheduleDays(daysPart)
  const startTime = formatTimeValue(timeMatch[1]).toUpperCase().replace(/\s+/g, ' ')
  const endTime = formatTimeValue(timeMatch[2]).toUpperCase().replace(/\s+/g, ' ')

  if (!days.length) return null
  if (!/^(\d{1,2}:\d{2})$/.test(startTime) || !/^(\d{1,2}:\d{2})$/.test(endTime)) return null

  return {
    days,
    startTime,
    endTime,
  }
}

function applyScheduleValue(rawValue) {
  const parsed = parseScheduleString(rawValue)
  scheduleRaw.value = String(rawValue || '').trim()
  scheduleParseWarning.value = ''

  if (parsed) {
    scheduleMode.value = 'structured'
    scheduleDays.value = parsed.days
    scheduleStartTime.value = parsed.startTime
    scheduleEndTime.value = parsed.endTime
    form.schedule = buildScheduleString(parsed.days, parsed.startTime, parsed.endTime)
    return
  }

  scheduleMode.value = 'raw'
  scheduleDays.value = []
  scheduleStartTime.value = ''
  scheduleEndTime.value = ''
  form.schedule = scheduleRaw.value
  scheduleParseWarning.value = scheduleRaw.value
    ? t('preschoolAddClass.unableToParseExistingSchedule')
    : ''
}

const selectedStudentOptionIds = computed(() => new Set(selectedStudentIds.value.map((id) => String(id))))

const selectedStudentOptions = computed(() =>
  selectedStudentAssignments.value
    .filter((student) => selectedStudentOptionIds.value.has(String(student.id)))
    .map(buildStudentOption),
)

const mergedStudentOptions = computed(() => {
  const optionMap = new Map()

  ;[...studentOptions.value, ...selectedStudentOptions.value].forEach((option) => {
    optionMap.set(String(option.value), option)
  })

  return sortStudentOptions([...optionMap.values()])
})

const studentSelectionLocked = computed(() => (
  isEditMode.value
  && selectedStudentAssignments.value.length === 0
  && studentCountFallback.value > 0
))

const selectedStudentCount = computed(() => (
  selectedStudentIds.value.length > 0
    ? selectedStudentIds.value.length
    : studentSelectionLocked.value
      ? studentCountFallback.value
      : 0
))

const selectedStudentSummary = computed(() =>
  t('preschoolAddClass.selectedStudentsCount', { count: selectedStudentCount.value }),
)

const studentSelectionDisabled = computed(() => isFormLocked.value || studentSelectionLocked.value)

const pageTitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddClass.viewTitle')
  if (isEditMode.value) return t('preschoolAddClass.updateTitle')
  return t('preschoolAddClass.title')
})
const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('preschoolAddClass.viewSubtitle')
  if (isEditMode.value) return t('preschoolAddClass.updateSubtitle')
  return t('preschoolAddClass.summary')
})

const summaryCards = computed(() => [
  {
    id: 'class-level',
    title: t('preschoolAddClass.level'),
    value: selectedClassLevelLabel.value || '-',
    label: t('preschoolAddClass.selectedLearningStage'),
    status: 'info',
    statusLabel: t('preschoolAddClass.statusLabels.info'),
    surfaceClass: 'bg-cyan-50/80 border-cyan-200',
  },
  {
    id: 'class-students',
    title: t('preschoolAddClass.students'),
    value: Number(selectedStudentCount.value || 0),
    label: t('preschoolAddClass.selectedStudents'),
    status: Number(selectedStudentCount.value || 0) > 0 ? 'success' : 'warning',
    statusLabel: Number(selectedStudentCount.value || 0) > 0
      ? t('preschoolAddClass.statusLabels.success')
      : t('preschoolAddClass.statusLabels.warning'),
    surfaceClass: 'bg-lime-50/80 border-lime-200',
  },
  {
    id: 'class-status',
    title: t('preschoolAddClass.status'),
    value: form.status || '-',
    label: t('preschoolAddClass.initialClassState'),
    status: String(form.status || '').toLowerCase(),
    statusLabel: form.status || '',
    surfaceClass: 'bg-amber-50/80 border-amber-200',
  },
  {
    id: 'class-schedule',
    title: t('preschoolAddClass.schedule'),
    value: form.schedule.trim() || t('preschoolAddClass.pending'),
    label: t('preschoolAddClass.teachingTimeSlot'),
    status: form.schedule.trim() ? 'success' : 'warning',
    statusLabel: form.schedule.trim() ? t('preschoolAddClass.ready') : t('preschoolAddClass.pending'),
    surfaceClass: 'bg-rose-50/80 border-rose-200',
  },
])

const checklistItems = computed(() => [
  {
    title: t('preschoolAddClass.identity'),
    text: t('preschoolAddClass.identityDetail'),
  },
  {
    title: t('preschoolAddClass.assignment'),
    text: t('preschoolAddClass.assignmentDetail'),
  },
  {
    title: t('preschoolAddClass.schedule'),
    text: t('preschoolAddClass.scheduleDetail'),
  },
  {
    title: t('preschoolAddClass.review'),
    text: t('preschoolAddClass.reviewDetail'),
  },
])

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function normalizeLevelPrefix(level) {
  const normalized = String(level || '').trim().toLowerCase()

  if (!normalized) return 'CLS'
  if (/(^|\b)(nursery|nur)\b/.test(normalized)) return 'NUR'
  if (/(^|\b)(kindergarten|kin|kga|kgb)\b/.test(normalized)) return 'KGA'
  if (/(^|\b)(prep|pre)\b/.test(normalized)) return 'PRE'

  const fallback = normalized.replace(/[^a-z]+/g, '').toUpperCase()
  return fallback.slice(0, 3) || 'CLS'
}

function extractClassSequence(code, prefix) {
  const normalized = String(code || '').trim().toUpperCase()
  const match = normalized.match(new RegExp(`^PS-${prefix}-(\\d+)$`))
  return match ? Number(match[1]) : 0
}

async function refreshGeneratedCode(level = form.classLevelId) {
  if (isEditMode.value || isViewMode.value) return

  const currentSeq = ++codeRequestSeq
  generatedCodeLoading.value = true

  try {
    const normalizedLevelId = resolveClassLevelId(level || form.classLevelId)
    const classLevel = classLevels.value.find((item) => String(item.id) === String(normalizedLevelId || form.classLevelId)) || null
    const prefix = normalizeText(classLevel?.code) || normalizeLevelPrefix(getClassLevelLabel(classLevel) || level)
    const response = await fetchPreschoolClasses({
      page: 1,
      perPage: 100,
      classLevelId: normalizedLevelId || form.classLevelId,
      sortBy: 'code',
      sortDirection: 'asc',
    })

    if (currentSeq !== codeRequestSeq) return

    const nextSequence = (response.items || []).reduce((max, item) => {
      return Math.max(max, extractClassSequence(item.code, prefix))
    }, 0) + 1

    generatedCode.value = `PS-${prefix}-${String(nextSequence).padStart(3, '0')}`
    form.code = generatedCode.value
  } catch {
    if (currentSeq !== codeRequestSeq) return

    const fallbackLevel = classLevels.value.find((item) => String(item.id) === String(level || form.classLevelId)) || null
    generatedCode.value = `PS-${normalizeLevelPrefix(fallbackLevel?.code || getClassLevelLabel(fallbackLevel) || level)}-${String(1).padStart(3, '0')}`
    form.code = generatedCode.value
  } finally {
    if (currentSeq === codeRequestSeq) {
      generatedCodeLoading.value = false
    }
  }
}

function validateForm() {
  if (!form.code.trim()) return t('preschoolAddClass.validation.classCodeRequired')
  if (!form.name.trim()) return t('preschoolAddClass.validation.classNameRequired')
  if (!form.teacher.trim()) return t('preschoolAddClass.validation.teacherRequired')
  if (!resolveClassLevelId(form.classLevelId)) return t('preschoolAddClass.validation.levelRequired')
  if (scheduleIsStructured.value) {
    if (!scheduleDays.value.length) return t('preschoolAddClass.validation.scheduleDaysRequired')
    if (!scheduleStartTime.value) return t('preschoolAddClass.validation.scheduleStartTimeRequired')
    if (!scheduleEndTime.value) return t('preschoolAddClass.validation.scheduleEndTimeRequired')

    const startMinutes = parseTimeToMinutes(scheduleStartTime.value)
    const endMinutes = parseTimeToMinutes(scheduleEndTime.value)
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return t('preschoolAddClass.validation.scheduleEndTimeAfterStartTime')
    }
  } else if (!form.schedule.trim()) {
    return t('preschoolAddClass.validation.scheduleRequired')
  }
  if (!form.status) return t('preschoolAddClass.validation.statusRequired')
  return ''
}

async function goBackToClasses() {
  await router.push(classesDirectoryPath)
}

async function goToEditMode() {
  if (!editingClassId.value) return
  await router.push({ path: '/module/preschool-admin/classes/add', query: { mode: 'edit', id: editingClassId.value } })
}

function populateFromClass(item) {
  form.code = item.code || ''
  form.name = item.name || ''
  form.teacher = item.teacherUserId || item.teacher_user_id || ''
  form.teacherDisplayName = item.teacherDisplayName || item.teacher_display_name || item.teacher || ''
  form.classLevelId = resolveClassLevelId(item.classLevelId || item.class_level_id || item.classLevel?.id || item.level) || ''
  form.status = normalizeClassStatus(item.status)
  form.room = item.room || ''
  form.notes = item.notes || ''
  applyScheduleValue(item.schedule || '')
  studentCountFallback.value = Number(item.studentsCount ?? item.students_count ?? item.students ?? 0)
  selectedStudentAssignments.value = Array.isArray(item.studentAssignments) ? item.studentAssignments : []
  selectedStudentIds.value = Array.isArray(item.activeStudentAssignments)
    ? item.activeStudentAssignments.map((student) => Number(student.id)).filter((studentId) => Number.isFinite(studentId))
    : []
}

async function loadStudents() {
  studentsLoading.value = true

  try {
    const response = await fetchPreschoolStudents({
      page: 1,
      perPage: 100,
      status: 'active',
    })

    studentOptions.value = sortStudentOptions((response.items || []).map(buildStudentOption))
  } catch {
    studentOptions.value = []
  } finally {
    studentsLoading.value = false
  }
}

async function loadTeachers() {
  try {
    const response = await fetchPreschoolTeachers({ perPage: 100, status: 'active' })
    teacherOptions.value = (response.items || []).map((teacher) => ({
      value: teacher.id,
      label: teacher.fullName || teacher.name || teacher.username || teacher.id,
    }))
  } catch {
    teacherOptions.value = []
  }
}

async function loadClassLevels() {
  try {
    const response = await fetchPreschoolClassLevels()
    classLevels.value = Array.isArray(response.items) ? response.items : []
  } catch {
    classLevels.value = []
  }
}

async function loadClass() {
  if (!editingClassId.value) return

  try {
    const item = await fetchPreschoolClass(editingClassId.value)
    if (!item) return
    populateFromClass(item)
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to load class details.'
    showError.value = true
  }
}

async function initializePage() {
  await Promise.allSettled([
    loadTeachers(),
    loadStudents(),
    loadClassLevels(),
  ])

  if (mode.value !== 'add') {
    await loadClass()
    return
  }

  resetScheduleState()
  await refreshGeneratedCode(form.classLevelId)
}

watch(
  () => form.classLevelId,
  (nextLevel) => {
    if (mode.value !== 'add') return
    refreshGeneratedCode(nextLevel)
  },
)

watch(
  () => [route.name, route.params.id, route.query.mode, route.query.id],
  async () => {
    await initializePage()
  },
)

watch(
  [scheduleDays, scheduleStartTime, scheduleEndTime],
  () => {
    if (scheduleMode.value === 'raw') return
    syncScheduleValue()
  },
  { deep: true },
)

function onUpdateSelectedStudentIds(value) {
  selectedStudentIds.value = Array.isArray(value)
    ? value.map((studentId) => Number(studentId)).filter((studentId) => Number.isFinite(studentId))
    : []
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    const teacherLabel = teacherLabelMap.value[form.teacher] || form.teacherDisplayName || ''
    const studentIds = selectedStudentIds.value.map((studentId) => Number(studentId)).filter((studentId) => Number.isFinite(studentId))
    const classLevel = classLevels.value.find((item) => String(item.id) === String(form.classLevelId)) || null
    const normalizedStatus = normalizeClassStatus(form.status)
    const payload = {
      code: form.code.trim() || generatedCode.value,
      name: form.name.trim(),
      teacher_user_id: form.teacher,
      teacher_display_name: teacherLabel,
      class_level_id: form.classLevelId,
      level: normalizeText(classLevel?.nameEn || classLevel?.name_en || selectedClassLevelLabel.value),
      schedule: scheduleMode.value === 'raw' ? scheduleRaw.value : buildScheduleString(),
      students_count: selectedStudentCount.value,
      status: normalizedStatus,
      room: form.room.trim(),
      notes: form.notes.trim(),
    }

    if (!isEditMode.value || selectedStudentAssignments.value.length > 0) {
      payload.student_ids = studentIds
    }

    if (isEditMode.value) {
      await updatePreschoolClass(editingClassId.value, payload)
    } else {
      await createPreschoolClass(payload)
    }

    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error?.message || (isEditMode.value ? t('preschoolAddClass.validation.updateFailed') : t('preschoolAddClass.validation.createFailed'))
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onErrorClose() {
  showError.value = false
}

async function onSuccessClose() {
  showSuccess.value = false
  await goBackToClasses()
}

onMounted(initializePage)
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-class-page add-class-page--kh' : 'add-class-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="summaryCards" />

      <div class="add-class-page__layout">
        <Form
          class="add-class-page__form"
          :title="pageTitle"
          :description="t('preschoolAddClass.formDescription')"
          :submit-text="t('preschoolAddClass.createClass')"
          :cancel-text="t('preschoolAddClass.backToClasses')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          @submit="onSubmit"
          @cancel="goBackToClasses"
        >
          <AddClassIntro />

          <AddClassFormFields
            :status-options="statusOptions"
            :teacher-options="teacherOptions"
            :code="generatedCode || form.code"
            :code-label="isEditMode ? t('preschoolAddClass.currentClassCode') : t('preschoolAddClass.generatedClassCode')"
            :code-hint="isEditMode ? t('preschoolAddClass.currentClassCodeHint') : t('preschoolAddClass.generatedClassCodeHint')"
            :code-loading="generatedCodeLoading"
            :name="form.name"
            :teacher="form.teacher"
            :class-level-id="form.classLevelId"
            :level-options="classLevelOptions"
            :schedule="form.schedule"
            :student-options="mergedStudentOptions"
            :selected-student-ids="selectedStudentIds"
            :student-loading="studentsLoading"
            :student-selection-disabled="studentSelectionDisabled"
            :selected-student-count="selectedStudentCount"
            :selected-student-summary="selectedStudentSummary"
            :schedule-days="scheduleDays"
            :schedule-day-options="scheduleDayOptions"
            :schedule-start-time="scheduleStartTime"
            :schedule-end-time="scheduleEndTime"
            :schedule-preview="schedulePreview"
            :schedule-warning="scheduleParseWarning"
            :schedule-has-warning="scheduleHasWarning"
            :status="form.status"
            :room="form.room"
            :notes="form.notes"
            :is-locked="isFormLocked"
            @update:name="form.name = $event"
            @update:teacher="form.teacher = $event"
            @update:classLevelId="form.classLevelId = $event"
            @update:schedule-day="updateScheduleDay"
            @update:schedule-start-time="updateScheduleStartTime"
            @update:schedule-end-time="updateScheduleEndTime"
            @update:selected-student-ids="onUpdateSelectedStudentIds"
            @update:status="form.status = $event"
            @update:room="form.room = $event"
            @update:notes="form.notes = $event"
          />

          <template #actions>
            <AddClassFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @back="goBackToClasses"
              @edit="goToEditMode"
            />
          </template>
        </Form>

        <div class="add-class-page__rail">
          <AdminChecklistPanel
            :title="t('preschoolAddClass.sidebarTitle')"
            :description="t('preschoolAddClass.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('preschoolAddClass.selectedLevel')"
            :highlight-value="selectedClassLevelLabel || t('preschoolAddClass.pending')"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('preschoolAddClass.validationError')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('preschoolAddClass.classUpdated') : t('preschoolAddClass.classCreated')"
      :message="isEditMode ? t('preschoolAddClass.updatedMessage') : t('preschoolAddClass.createdMessage')"
      :button-text="t('preschoolAddClass.backToClasses')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-class-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-class-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-class-page__form {
  display: block;
}

.add-class-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-class-page--kh :deep(.admin-checklist-panel .p-card-title),
.add-class-page--kh :deep(.admin-checklist-panel .p-card-content),
.add-class-page--kh :deep(form header h3),
.add-class-page--kh :deep(form header p),
.add-class-page--kh :deep(.p-dialog-content),
.add-class-page--kh :deep(.p-dialog-footer) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-class-page--kh :deep(form header p),
.add-class-page--kh :deep(.admin-checklist-panel .p-card-content p),
.add-class-page--kh :deep(.p-dialog-content p) {
  line-height: 1.7;
}

@media (max-width: 1120px) {
  .add-class-page__layout {
    grid-template-columns: 1fr;
  }

  .add-class-page__rail {
    position: static;
  }
}
</style>
