import http from '@/services/http'

export const dsamCoreApi = {
  dashboard:     (params) => http.get('/dsam/dashboard', { params }),
  academicYears: (params) => http.get('/dsam/academic-years', { params }),
  schools:       (params) => http.get('/dsam/schools', { params }),

  // Student profile & history
  getProfile:    (studentId) => http.get(`/dsam/students/${studentId}/profile`),
  saveProfile:   (studentId, data) => http.put(`/dsam/students/${studentId}/profile`, data),
  listHistories: (studentId) => http.get(`/dsam/students/${studentId}/histories`),
  addHistory:    (studentId, data) => http.post(`/dsam/students/${studentId}/histories`, data),
}
