import http from '@/services/http'

const BASE = '/assessment/submissions'

export const assessmentSubmissionApi = {
  list: (params) => http.get(BASE, { params }),
  get: (id) => http.get(`${BASE}/${id}`),
  create: (data) => http.post(BASE, data),
  update: (id, data) => http.put(`${BASE}/${id}`, data),
  submit: (id) => http.post(`${BASE}/${id}/submit`),
  review: (id, data) => http.post(`${BASE}/${id}/review`, data),
  delete: (id) => http.delete(`${BASE}/${id}`),
}
