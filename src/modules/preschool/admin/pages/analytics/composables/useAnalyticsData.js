import { computed, ref } from 'vue'
import {
  fetchPreschoolAnalyticsDashboard,
  fetchPreschoolAlertAnalytics,
  fetchPreschoolAttendanceAnalytics,
  fetchPreschoolGuardianContactAnalytics,
  fetchPreschoolScheduleAnalytics,
  fetchPreschoolSessionAnalytics,
  fetchPreschoolStudentAnalytics,
  fetchPreschoolTeacherAnalytics,
} from '@/modules/preschool/services/api/preschoolAnalyticsApi'

function createAnalyticsBundle() {
  return {
    scope: '',
    summary: {},
    trends: {},
    breakdowns: {},
    charts: {},
    datasets: {},
    filters: {},
    generatedAt: '',
  }
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Unable to load preschool analytics.'
}

export function useAnalyticsData() {
  const loading = ref(false)
  const errorMessage = ref('')
  const dashboard = ref(createAnalyticsBundle())
  const attendance = ref(createAnalyticsBundle())
  const sessions = ref(createAnalyticsBundle())
  const schedules = ref(createAnalyticsBundle())
  const alerts = ref(createAnalyticsBundle())
  const students = ref(createAnalyticsBundle())
  const teachers = ref(createAnalyticsBundle())
  const guardianContacts = ref(createAnalyticsBundle())
  const filterOptions = ref({})

  const hasAnalyticsData = computed(() => Boolean(
    dashboard.value.generatedAt
    || Object.keys(dashboard.value.summary || {}).length
    || Object.keys(attendance.value.summary || {}).length
    || Object.keys(sessions.value.summary || {}).length
    || Object.keys(schedules.value.summary || {}).length
    || Object.keys(alerts.value.summary || {}).length
    || Object.keys(students.value.summary || {}).length
    || Object.keys(teachers.value.summary || {}).length
    || Object.keys(guardianContacts.value.summary || {}).length
  ))

  async function loadAnalytics(filters = {}, options = {}) {
    loading.value = true
    errorMessage.value = ''

    const requests = [
      ['dashboard', fetchPreschoolAnalyticsDashboard],
      ['attendance', fetchPreschoolAttendanceAnalytics],
      ['sessions', fetchPreschoolSessionAnalytics],
      ['schedules', fetchPreschoolScheduleAnalytics],
      ['alerts', fetchPreschoolAlertAnalytics],
      ['students', fetchPreschoolStudentAnalytics],
      ['teachers', fetchPreschoolTeacherAnalytics],
      ['guardianContacts', fetchPreschoolGuardianContactAnalytics],
    ]

    try {
      const results = await Promise.allSettled(
        requests.map(([, loader]) => loader(filters, options)),
      )

      const firstError = results.find((result) => result.status === 'rejected')
      if (firstError) {
        errorMessage.value = getErrorMessage(firstError.reason)
      }

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return

        const [key] = requests[index]
        if (key === 'dashboard') {
          dashboard.value = result.value
          filterOptions.value = result.value.filters || {}
          return
        }

        if (key === 'attendance') attendance.value = result.value
        if (key === 'sessions') sessions.value = result.value
        if (key === 'schedules') schedules.value = result.value
        if (key === 'alerts') alerts.value = result.value
        if (key === 'students') students.value = result.value
        if (key === 'teachers') teachers.value = result.value
        if (key === 'guardianContacts') guardianContacts.value = result.value
      })
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    filterOptions,
    dashboard,
    attendance,
    sessions,
    schedules,
    alerts,
    students,
    teachers,
    guardianContacts,
    hasAnalyticsData,
    loadAnalytics,
  }
}
