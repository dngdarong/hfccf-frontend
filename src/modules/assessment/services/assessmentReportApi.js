import http from '@/services/http'

const BASE = '/assessment/reports'

export const assessmentReportApi = {
  dashboard: (params) => http.get(`${BASE}/dashboard`, { params }),
  riskDistribution: (params) => http.get(`${BASE}/risk-distribution`, { params }),
  submissionTrend: (params) => http.get(`${BASE}/submission-trend`, { params }),
  auditLogs: (params) => http.get('/assessment/audit-logs', { params }),
  export: (params) => http.get(`${BASE}/export`, { params, responseType: 'blob' }),
}
