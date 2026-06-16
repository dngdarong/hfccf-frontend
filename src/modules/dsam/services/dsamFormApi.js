import http from '@/services/http'

const BASE = '/dsam/forms'
const SECTIONS = (formId) => `${BASE}/${formId}/sections`
const QUESTIONS = (sectionId) => `/dsam/sections/${sectionId}/questions`
const OPTIONS = (questionId) => `/dsam/questions/${questionId}/options`

export const dsamFormApi = {
  // Templates
  list:       (params) => http.get(BASE, { params }),
  get:        (id) => http.get(`${BASE}/${id}`),
  create:     (data) => http.post(BASE, data),
  update:     (id, data) => http.put(`${BASE}/${id}`, data),
  delete:     (id) => http.delete(`${BASE}/${id}`),
  publish:    (id) => http.post(`${BASE}/${id}/publish`),
  duplicate:  (id) => http.post(`${BASE}/${id}/duplicate`),
  newVersion: (id, data) => http.post(`${BASE}/${id}/new-version`, data),
  versions:   (id) => http.get(`${BASE}/${id}/versions`),

  // Sections
  listSections:   (formId) => http.get(SECTIONS(formId)),
  createSection:  (formId, data) => http.post(SECTIONS(formId), data),
  updateSection:  (formId, sectionId, data) => http.put(`${SECTIONS(formId)}/${sectionId}`, data),
  deleteSection:  (formId, sectionId) => http.delete(`${SECTIONS(formId)}/${sectionId}`),
  reorderSections:(formId, order) => http.post(`${SECTIONS(formId)}/reorder`, { order }),

  // Questions
  listQuestions:   (sectionId) => http.get(QUESTIONS(sectionId)),
  createQuestion:  (sectionId, data) => http.post(QUESTIONS(sectionId), data),
  updateQuestion:  (sectionId, questionId, data) => http.put(`${QUESTIONS(sectionId)}/${questionId}`, data),
  deleteQuestion:  (sectionId, questionId) => http.delete(`${QUESTIONS(sectionId)}/${questionId}`),
  reorderQuestions:(sectionId, order) => http.post(`${QUESTIONS(sectionId)}/reorder`, { order }),

  // Options
  listOptions:   (questionId) => http.get(OPTIONS(questionId)),
  createOption:  (questionId, data) => http.post(OPTIONS(questionId), data),
  updateOption:  (questionId, optionId, data) => http.put(`${OPTIONS(questionId)}/${optionId}`, data),
  deleteOption:  (questionId, optionId) => http.delete(`${OPTIONS(questionId)}/${optionId}`),
  reorderOptions:(questionId, order) => http.post(`${OPTIONS(questionId)}/reorder`, { order }),

  // Question types (lookup)
  questionTypes: () => http.get('/dsam/question-types'),
}
