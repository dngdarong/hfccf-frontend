import http from '@/services/http'
import { buildQueryParams } from '@/services/api'

export async function fetchPreschoolGrades(filters = {}) {
  const params = buildQueryParams({
    academic_year_id: filters.academicYearId,
    class_id: filters.classId,
    month: filters.month,
    year: filters.year,
    student_id: filters.studentId,
    teacher_id: filters.teacherId,
    per_page: filters.perPage,
    page: filters.page,
  })

  const response = await http.get(`/preschool/grades${params}`)
  return response.data
}

export async function fetchGradeMonthlyEntry(classId, month, year) {
  const submissionMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const response = await http.get('/preschool/monthly-submissions', {
    params: { per_page: 100, class_id: classId, submission_month: submissionMonth },
  })
  const payload = response.data?.data ?? response.data ?? {}
  const submissions = Array.isArray(payload) ? payload : payload.items || payload.data || []
  const submission = submissions[0]
  if (!submission?.id) return []

  const detailResponse = await http.get(`/preschool/monthly-submissions/${encodeURIComponent(submission.id)}`)
  const detail = detailResponse.data?.data?.submission ?? detailResponse.data?.submission ?? {}

  return {
    status: detail.status,
    academic_year: detail.academicYear?.label || detail.academicYear?.code || '',
    month: detail.submission_month ? new Date(detail.submission_month).toLocaleString('en-US', { month: 'long' }) : '',
    year: detail.submission_month ? new Date(detail.submission_month).getFullYear().toString() : '',
    assessments: (detail.assessments || []).map(assessment => ({
      id: assessment.id,
      student_id: assessment.studentId,
      student_name: assessment.studentName,
      student_gender: assessment.studentGender,
      student_date_of_birth: assessment.studentDateOfBirth,
      class_name: assessment.className,
      grade: assessment.score ?? '',
      rating: assessment.rating || '',
      notes: '',
    })),
  }
}

function resolveAttachmentFilename(headers = {}, fallback = 'GradeEntry.pdf') {
  const disposition = String(headers['content-disposition'] || headers['Content-Disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  if (match?.[1]) {
    return match[1]
  }

  return fallback
}

export async function downloadGradeEntryReportPdf(params = {}, options = {}) {
  const response = await http.get('/preschool/grades/download', {
    params: buildQueryParams({
      academic_year_id: params.academicYearId || '',
      class_id: params.classId || '',
      month: params.month || '',
      year: params.year || '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return {
    blob: response.data,
    filename: resolveAttachmentFilename(response.headers, params.filename || 'GradeEntry.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function fetchStudentGrades(studentId) {
  const response = await http.get(`/preschool/students/${studentId}/grades`)
  return response.data
}

export async function createPreschoolGrade(gradeData) {
  const response = await http.post('/preschool/grades', gradeData)
  return response.data
}

export async function updatePreschoolGrade(gradeId, gradeData) {
  const response = await http.put(`/preschool/grades/${gradeId}`, gradeData)
  return response.data
}

export async function deletePreschoolGrade(gradeId) {
  const response = await http.delete(`/preschool/grades/${gradeId}`)
  return response.data
}

export async function batchUpdateGrades(grades) {
  if (!Array.isArray(grades) || grades.length === 0) return []

  const firstGrade = grades[0]
  const submissionMonth = `${firstGrade.year}-${String(firstGrade.month).padStart(2, '0')}-01`
  const [submissionsResponse, categoriesResponse] = await Promise.all([
    http.get('/preschool/monthly-submissions', { params: { per_page: 100, submission_month: submissionMonth } }),
    http.get('/preschool/assessment-categories', { params: { active: true } }),
  ])
  const submissionsPayload = submissionsResponse.data?.data ?? submissionsResponse.data ?? {}
  const submissions = Array.isArray(submissionsPayload)
    ? submissionsPayload
    : submissionsPayload.items || submissionsPayload.data || []
  const categoriesPayload = categoriesResponse.data?.data ?? categoriesResponse.data ?? {}
  const categories = Array.isArray(categoriesPayload)
    ? categoriesPayload
    : categoriesPayload.items || categoriesPayload.data || []

  let submission = submissions.find(item =>
      String(item.class?.id) === String(firstGrade.classId) &&
    String(item.academic_year?.id) === String(firstGrade.academicYearId) &&
    String(item.submission_month || '') === submissionMonth,
  )

  if (!submission) {
    const category = categories[0]
    if (!category?.id) {
      throw new Error('Create an active assessment category before entering monthly scores.')
    }

    const response = await http.post('/preschool/monthly-submissions', {
      academic_year_id: firstGrade.academicYearId,
      class_id: firstGrade.classId,
      assessment_category_id: category.id,
    })
    const payload = response.data?.data ?? response.data ?? {}
    submission = payload.submission || payload
  }

  if (!submission?.id) throw new Error('Unable to create the monthly score submission.')

  await Promise.all(
    grades.map(grade =>
      http.patch(`/preschool/monthly-submissions/${encodeURIComponent(submission.id)}/scores/${encodeURIComponent(grade.studentId)}`, {
        score: grade.score,
      }),
    ),
  )

  return submission
}

export function normalizeGrade(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: row.studentName || row.student_name || '',
    studentCode: row.studentCode || row.student_code || '',
    classId: row.classId ?? row.class_id ?? '',
    className: row.className || row.class_name || '',
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    month: row.month ?? '',
    year: row.year ?? '',
    grade: row.grade ?? '',
    score: row.score ?? null,
    notes: row.notes || '',
    enteredByUserId: row.enteredByUserId ?? row.entered_by_user_id ?? '',
    enteredByName: row.enteredByName || row.entered_by_name || '',
    enteredAt: row.enteredAt || row.entered_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}
