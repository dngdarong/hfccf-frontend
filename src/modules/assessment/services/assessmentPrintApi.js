import http from '@/services/http'

const BASE = '/assessment/print-templates'

export const assessmentPrintApi = {
  list: (params) => http.get(BASE, { params }),
  get: (id) => http.get(`${BASE}/${id}`),
  create: (data) => http.post(BASE, data),
  update: (id, data) => http.put(`${BASE}/${id}`, data),
  delete: (id) => http.delete(`${BASE}/${id}`),
  preview: (data) => http.post(`${BASE}/preview`, data),
  print: (submissionId, templateId) =>
    http.post(`/assessment/submissions/${submissionId}/print`, { template_id: templateId }, { responseType: 'blob' }),
}
