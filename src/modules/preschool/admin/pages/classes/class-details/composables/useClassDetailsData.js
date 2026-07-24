import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import {
  fetchPreschoolClass,
  fetchPreschoolStudent,
  fetchPreschoolTeacher,
} from '@/modules/preschool/services/preschoolApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function getDayKey(value) {
  return String(value || '').trim().toLowerCase()
}

function formatTimeValue(value) {
  return normalizeText(value).replace(/\s+/g, ' ').toUpperCase()
}

function parseTimeToMinutes(value) {
  const match = normalizeText(value).match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return (hours * 60) + minutes
}

function formatDateTime(value, locale = 'en') {
  const text = normalizeText(value)
  if (!text) return ''

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return text

  try {
    return new Intl.DateTimeFormat(locale === 'KH' ? 'km-KH' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed)
  } catch {
    return parsed.toLocaleString()
  }
}

function getDayLabel(t, day) {
  return t(`preschoolAddClass.weekdays.${getDayKey(day)}`)
}

function buildDayPatterns() {
  return [
    ['monday', /\b(mon|monday)\b/],
    ['tuesday', /\b(tue|tues|tuesday)\b/],
    ['wednesday', /\b(wed|weds|wednesday)\b/],
    ['thursday', /\b(thu|thur|thurs|thursday)\b/],
    ['friday', /\b(fri|friday)\b/],
    ['saturday', /\b(sat|saturday)\b/],
    ['sunday', /\b(sun|sunday)\b/],
  ]
}

function parseScheduleSnapshot(rawValue, t) {
  const raw = normalizeText(rawValue)
  if (!raw) {
    return {
      mode: 'empty',
      raw: '',
      preview: t('preschoolClassDetailsPage.scheduleUnavailable'),
      label: t('preschoolClassDetailsPage.scheduleUnavailable'),
      days: [],
      startTime: '',
      endTime: '',
    }
  }

  const timeMatch = raw.match(/(\d{1,2}:\d{2}\s?(?:am|pm)?)[\s]*[–—-][\s]*(\d{1,2}:\d{2}\s?(?:am|pm)?)/i)
  if (!timeMatch) {
    return {
      mode: 'legacy',
      raw,
      preview: raw,
      label: t('preschoolClassDetailsPage.legacySchedule'),
      days: [],
      startTime: '',
      endTime: '',
    }
  }

  const daysPart = raw.slice(0, timeMatch.index).replace(/[,·•]+$/, '').trim()
  const days = buildDayPatterns()
    .filter(([, pattern]) => pattern.test(daysPart.toLowerCase()))
    .map(([day]) => day)

  const startTime = formatTimeValue(timeMatch[1]).replace(/\s+/g, ' ')
  const endTime = formatTimeValue(timeMatch[2]).replace(/\s+/g, ' ')
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)

  if (!days.length || startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return {
      mode: 'legacy',
      raw,
      preview: raw,
      label: t('preschoolClassDetailsPage.legacySchedule'),
      days: [],
      startTime: '',
      endTime: '',
    }
  }

  const localizedDays = days.map((day) => getDayLabel(t, day))

  return {
    mode: 'structured',
    raw,
    preview: `${localizedDays.join(', ')} · ${startTime}–${endTime}`,
    label: t('preschoolAddClass.ready'),
    days: localizedDays,
    startTime,
    endTime,
  }
}

function buildRosterItem(student, fallback = {}) {
  const fullName = normalizeText(
    student?.fullName
    || student?.name
    || `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
    || fallback.fullName
    || fallback.name,
  )
  const code = normalizeText(
    student?.publicId
    || student?.studentCode
    || student?.student_code
    || student?.code
    || fallback.studentCode
    || fallback.student_code
    || fallback.code,
  )
  const avatarUrl = resolveAvatarSource(student?.avatarUrl || student?.avatar || student?.profilePhotoUrl || '')

  return {
    id: student?.id ?? fallback.id ?? '',
    name: fullName || code || `Student ${student?.id ?? fallback.id ?? ''}`,
    code,
    avatarUrl,
    initials: getAvatarInitials(fullName || code || 'Student', 'ST'),
    status: normalizeText(student?.status || fallback.status || 'active'),
    guardianPhone: normalizeText(student?.guardianPhone || student?.guardian_phone || fallback.guardianPhone),
    profileRoute: student?.id || fallback.id
      ? { name: 'dashboard-preschool-admin-student-profile', params: { id: String(student?.id ?? fallback.id).trim() } }
      : null,
    assignmentStatus: normalizeText(fallback.status || student?.status || 'active'),
  }
}

export function useClassDetailsData() {
  const route = useRoute()
  const { t, language } = useLanguage()

  const loading = ref(false)
  const errorMessage = ref('')
  const classDetails = ref(null)
  const teacherDetails = ref(null)
  const studentRoster = ref([])
  const requestSequence = ref(0)

  const classId = computed(() => String(route.params.id || '').trim())
  const teacherAssigned = computed(() => Boolean(classDetails.value?.teacherUserId || classDetails.value?.teacherDisplayName))
  const teacherName = computed(() =>
    normalizeText(
      teacherDetails.value?.fullName
      || teacherDetails.value?.name
      || teacherDetails.value?.username
      || classDetails.value?.teacherDisplayName
      || t('preschoolClassDetailsPage.noTeacherAssigned'),
    ),
  )
  const teacherEmail = computed(() => normalizeText(teacherDetails.value?.email))
  const teacherPhone = computed(() => normalizeText(teacherDetails.value?.phone))
  const teacherStatus = computed(() => normalizeText(teacherDetails.value?.status || classDetails.value?.status || ''))
  const teacherAvatar = computed(() => resolveAvatarSource(teacherDetails.value?.avatar || teacherDetails.value?.avatarUrl || ''))
  const teacherInitials = computed(() => getAvatarInitials(teacherName.value, 'TC'))
  const schedule = computed(() => parseScheduleSnapshot(classDetails.value?.schedule, t))
  const totalStudents = computed(() => Number(classDetails.value?.studentsCount ?? studentRoster.value.length ?? 0))
  const activeStudents = computed(() => studentRoster.value.filter((student) => String(student.status || '').toLowerCase() === 'active').length)
  const recentActivity = computed(() => {
    const items = []

    if (classDetails.value?.createdAt) {
      items.push({
        id: 'created-at',
        label: t('preschoolClassDetailsPage.activity.created'),
        value: formatDateTime(classDetails.value.createdAt, language.value),
      })
    }

    if (classDetails.value?.updatedAt) {
      items.push({
        id: 'updated-at',
        label: t('preschoolClassDetailsPage.activity.updated'),
        value: formatDateTime(classDetails.value.updatedAt, language.value),
      })
    }

    return items.filter((item) => item.value)
  })
  const summaryCards = computed(() => [
    {
      id: 'total-students',
      title: t('preschoolClassDetailsPage.totalStudents'),
      value: totalStudents.value,
      caption: teacherAssigned.value
        ? t('preschoolClassDetailsPage.assignedTeacher')
        : t('preschoolClassDetailsPage.noTeacherAssigned'),
      badge: totalStudents.value > 0 ? t('preschoolAddClass.ready') : t('preschoolClassDetailsPage.noStudentsAssigned'),
      tone: totalStudents.value > 0 ? 'info' : 'warning',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      id: 'active-students',
      title: t('preschoolClassDetailsPage.activeStudents'),
      value: activeStudents.value,
      caption: t('preschoolClassDetailsPage.classSummarySubtitle'),
      badge: activeStudents.value > 0 ? t('preschoolAddClass.ready') : t('preschoolClassDetailsPage.noStudentsAssigned'),
      tone: activeStudents.value > 0 ? 'success' : 'warning',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'teacher-assigned',
      title: t('preschoolClassDetailsPage.assignedTeacher'),
      value: teacherName.value,
      caption: teacherStatus.value || t('preschoolClassDetailsPage.noTeacherAssigned'),
      badge: teacherAssigned.value ? t('preschoolAddClass.ready') : t('preschoolClassDetailsPage.noTeacherAssigned'),
      tone: teacherAssigned.value ? 'info' : 'warning',
      icon: 'M15 7a4 4 0 11-8 0 4 4 0 018 0zm-9 14v-1a6 6 0 0112 0v1m-6-9h.01',
    },
    {
      id: 'schedule-status',
      title: t('preschoolClassDetailsPage.scheduleStatus'),
      value: schedule.value.label,
      caption: schedule.value.preview || t('preschoolClassDetailsPage.scheduleUnavailable'),
      badge: schedule.value.mode === 'structured'
        ? t('preschoolAddClass.ready')
        : schedule.value.mode === 'legacy'
          ? t('preschoolClassDetailsPage.legacySchedule')
          : t('preschoolClassDetailsPage.scheduleUnavailable'),
      tone: schedule.value.mode === 'structured'
        ? 'success'
        : schedule.value.mode === 'legacy'
          ? 'warning'
          : 'danger',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ])

  async function loadClassDetails() {
    const resolvedClassId = classId.value
    const currentSequence = requestSequence.value + 1
    requestSequence.value = currentSequence

    if (!resolvedClassId) {
      loading.value = false
      classDetails.value = null
      teacherDetails.value = null
      studentRoster.value = []
      errorMessage.value = ''
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const response = await fetchPreschoolClass(resolvedClassId)

      if (requestSequence.value !== currentSequence) return

      if (!response) {
        classDetails.value = null
        teacherDetails.value = null
        studentRoster.value = []
        errorMessage.value = t('preschoolClassDetailsPage.messages.notFound')
        return
      }

      classDetails.value = response

      const teacherId = String(response.teacherUserId || response.teacher_user_id || '').trim()
      const assignments = Array.isArray(response.studentAssignments) ? response.studentAssignments : []

      const [teacherResponse, studentResponses] = await Promise.all([
        teacherId
          ? fetchPreschoolTeacher(teacherId).catch(() => null)
          : Promise.resolve(null),
        Promise.allSettled(
          assignments.map((assignment) => {
            const studentId = String(assignment.id || '').trim()
            return studentId ? fetchPreschoolStudent(studentId) : Promise.resolve(null)
          }),
        ),
      ])

      if (requestSequence.value !== currentSequence) return

      teacherDetails.value = teacherResponse

      studentRoster.value = studentResponses.map((result, index) => {
        const assignment = assignments[index] || {}
        const student = result.status === 'fulfilled' ? result.value : null
        return buildRosterItem(student, assignment)
      })
    } catch (error) {
      if (requestSequence.value !== currentSequence) return

      classDetails.value = null
      teacherDetails.value = null
      studentRoster.value = []
      errorMessage.value = error?.message || t('preschoolClassDetailsPage.messages.loadFailed')
    } finally {
      if (requestSequence.value === currentSequence) {
        loading.value = false
      }
    }
  }

  watch(
    () => route.params.id,
    () => {
      void loadClassDetails()
    },
    { immediate: true },
  )

  return {
    loading,
    errorMessage,
    classDetails,
    teacherDetails,
    studentRoster,
    classId,
    teacherAssigned,
    teacherName,
    teacherEmail,
    teacherPhone,
    teacherStatus,
    teacherAvatar,
    teacherInitials,
    schedule,
    totalStudents,
    activeStudents,
    recentActivity,
    summaryCards,
    loadClassDetails,
  }
}
