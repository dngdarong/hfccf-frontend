import http from '@/services/http'

const BASE = '/dsam/submissions'

export const dsamSubmissionApi = {
  list:     (params) => http.get(BASE, { params }),
  get:      (id) => http.get(`${BASE}/${id}`),
  create:   (data) => http.post(BASE, data),
  save:     (id, data) => http.put(`${BASE}/${id}`, data),    // auto-save draft + answers
  submit:   (id) => http.post(`${BASE}/${id}/submit`),
  approve:  (id, data) => http.post(`${BASE}/${id}/approve`, data),
  reject:   (id, data) => http.post(`${BASE}/${id}/reject`, data),
  delete:   (id) => http.delete(`${BASE}/${id}`),
}
