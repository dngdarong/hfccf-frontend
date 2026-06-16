import http from '@/services/http'

const BASE = '/assessment/forms'

export const assessmentFormApi = {
  list: (params) => http.get(BASE, { params }),
  get: (id) => http.get(`${BASE}/${id}`),
  create: (data) => http.post(BASE, data),
  update: (id, data) => http.put(`${BASE}/${id}`, data),
  delete: (id) => http.delete(`${BASE}/${id}`),
  publish: (id) => http.post(`${BASE}/${id}/publish`),
  duplicate: (id) => http.post(`${BASE}/${id}/duplicate`),
  archive: (id) => http.post(`${BASE}/${id}/archive`),

  // Sections
  listSections: (formId) => http.get(`${BASE}/${formId}/sections`),
  createSection: (formId, data) => http.post(`${BASE}/${formId}/sections`, data),
  updateSection: (formId, sectionId, data) => http.put(`${BASE}/${formId}/sections/${sectionId}`, data),
  deleteSection: (formId, sectionId) => http.delete(`${BASE}/${formId}/sections/${sectionId}`),
  reorderSections: (formId, data) => http.post(`${BASE}/${formId}/sections/reorder`, data),

  // Questions
  listQuestions: (formId) => http.get(`${BASE}/${formId}/questions`),
  createQuestion: (formId, data) => http.post(`${BASE}/${formId}/questions`, data),
  getQuestion: (formId, questionId) => http.get(`${BASE}/${formId}/questions/${questionId}`),
  updateQuestion: (formId, questionId, data) => http.put(`${BASE}/${formId}/questions/${questionId}`, data),
  deleteQuestion: (formId, questionId) => http.delete(`${BASE}/${formId}/questions/${questionId}`),
  duplicateQuestion: (formId, questionId) => http.post(`${BASE}/${formId}/questions/${questionId}/duplicate`),
  reorderQuestions: (formId, data) => http.post(`${BASE}/${formId}/questions/reorder`, data),

  // Scoring
  getScoring: (formId) => http.get(`${BASE}/${formId}/scoring`),
  updateScoring: (formId, data) => http.put(`${BASE}/${formId}/scoring`, data),
}
