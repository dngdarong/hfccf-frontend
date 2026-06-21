import http from '@/services/http'
import {
  buildQueryParams,
  getApiErrorMessage,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
} from '@/services/api'

const ENGLISH_ROUTES = {
  dashboard: '/english/dashboard',
  teacherDashboard: '/english/teacher/dashboard',
  teachers: '/english/teachers',
  students: '/english/students',
  classes: '/english/classes',
  tasks: '/english/tasks',
  submissions: '/english/submissions',
  teacherClasses: '/english/teacher/classes',
  teacherStudents: '/english/teacher/students',
  teacherTasks: '/english/teacher/tasks',
}

function unwrapEntity(response, key) {
  const payload = unwrapApiData(response) || {}
  const entity = payload?.[key] ?? payload?.data?.[key] ?? payload

  return entity || null
}

function normalizeListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  return {
    items: unwrapApiItems(response),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage),
  }
}

function normalizeListParams(params = {}) {
  const query = buildQueryParams(params)

  if (Object.prototype.hasOwnProperty.call(query, 'perPage')) {
    query.per_page = query.perPage
    delete query.perPage
  }

  return query
}

async function request(method, url, data = null, config = {}) {
  try {
    const response = await http.request({
      method,
      url,
      data,
      ...config,
    })

    return response
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to complete the request.'), {
      cause: error,
    })
  }
}

export async function fetchEnglishDashboard() {
  const response = await request('get', ENGLISH_ROUTES.dashboard)
  return unwrapApiData(response) || {}
}

export async function fetchTeacherDashboard() {
  const response = await request('get', ENGLISH_ROUTES.teacherDashboard)
  return unwrapApiData(response) || {}
}

export async function fetchEnglishTeachers(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.teachers, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function createEnglishTeacher(payload) {
  const response = await request('post', ENGLISH_ROUTES.teachers, payload)
  return unwrapEntity(response, 'user')
}

export async function updateEnglishTeacher(id, payload) {
  const targetId = String(id || '').trim()
  const response = await request('put', `${ENGLISH_ROUTES.teachers}/${encodeURIComponent(targetId)}`, payload)
  return unwrapEntity(response, 'user')
}

export async function deleteEnglishTeacher(id) {
  const targetId = String(id || '').trim()
  await request('delete', `${ENGLISH_ROUTES.teachers}/${encodeURIComponent(targetId)}`)
  return true
}

export async function resetEnglishTeacherPassword(id, payload = {}) {
  const targetId = String(id || '').trim()
  if (!targetId) {
    throw new Error('Teacher id is required.')
  }

  const response = await request('post', `/users/${encodeURIComponent(targetId)}/reset-password`, {
    password: String(payload.password || ''),
    password_confirmation: String(payload.password_confirmation || payload.confirmPassword || payload.password || ''),
    reason: String(payload.reason || '').trim(),
  })

  return unwrapEntity(response, 'user')
}

export async function fetchEnglishStudents(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.students, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function createEnglishStudent(payload) {
  const response = await request('post', ENGLISH_ROUTES.students, payload)
  return unwrapEntity(response, 'student')
}

export async function updateEnglishStudent(id, payload) {
  const targetId = String(id || '').trim()
  const response = await request('put', `${ENGLISH_ROUTES.students}/${encodeURIComponent(targetId)}`, payload)
  return unwrapEntity(response, 'student')
}

export async function deleteEnglishStudent(id) {
  const targetId = String(id || '').trim()
  await request('delete', `${ENGLISH_ROUTES.students}/${encodeURIComponent(targetId)}`)
  return true
}

export async function fetchEnglishClasses(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.classes, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function createEnglishClass(payload) {
  const response = await request('post', ENGLISH_ROUTES.classes, payload)
  return unwrapEntity(response, 'class')
}

export async function updateEnglishClass(id, payload) {
  const targetId = String(id || '').trim()
  const response = await request('put', `${ENGLISH_ROUTES.classes}/${encodeURIComponent(targetId)}`, payload)
  return unwrapEntity(response, 'class')
}

export async function deleteEnglishClass(id) {
  const targetId = String(id || '').trim()
  await request('delete', `${ENGLISH_ROUTES.classes}/${encodeURIComponent(targetId)}`)
  return true
}

export async function fetchEnglishTasks(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.tasks, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function createEnglishTask(payload) {
  const response = await request('post', ENGLISH_ROUTES.tasks, payload)
  return unwrapEntity(response, 'task')
}

export async function updateEnglishTask(id, payload) {
  const targetId = String(id || '').trim()
  const response = await request('put', `${ENGLISH_ROUTES.tasks}/${encodeURIComponent(targetId)}`, payload)
  return unwrapEntity(response, 'task')
}

export async function deleteEnglishTask(id) {
  const targetId = String(id || '').trim()
  await request('delete', `${ENGLISH_ROUTES.tasks}/${encodeURIComponent(targetId)}`)
  return true
}

export async function fetchEnglishSubmissions(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.submissions, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function createEnglishSubmission(payload) {
  const response = await request('post', ENGLISH_ROUTES.submissions, payload)
  return unwrapEntity(response, 'submission')
}

export async function updateEnglishSubmission(id, payload) {
  const targetId = String(id || '').trim()
  const response = await request('put', `${ENGLISH_ROUTES.submissions}/${encodeURIComponent(targetId)}`, payload)
  return unwrapEntity(response, 'submission')
}

export async function fetchTeacherClasses(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.teacherClasses, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function fetchTeacherStudents(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.teacherStudents, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}

export async function fetchTeacherTasks(params = {}) {
  const response = await request('get', ENGLISH_ROUTES.teacherTasks, null, {
    params: normalizeListParams(params),
  })

  return normalizeListResponse(response, params.page || 1, params.perPage || 10)
}
