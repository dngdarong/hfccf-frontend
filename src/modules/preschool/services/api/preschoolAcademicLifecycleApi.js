// Keep academic lifecycle HTTP calls isolated so Preschool settings can manage
// years and terms without mixing them into the older backbone snapshot API.
import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function buildDateRange(startDate, endDate, existing = '') {
  const fallback = normalizeText(existing)
  if (fallback) return fallback
  if (!startDate && !endDate) return ''
  return `${normalizeText(startDate || '—')} - ${normalizeText(endDate || '—')}`
}

function normalizeAcademicYear(record = {}) {
  return {
    id: record.id ?? '',
    code: normalizeText(record.code),
    name: normalizeText(record.name || record.label),
    label: normalizeText(record.label || record.name),
    description: normalizeText(record.description || record.notes),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    dateRange: buildDateRange(record.startDate || record.start_date, record.endDate || record.end_date, record.dateRange || record.date_range),
    status: normalizeText(record.status || 'active'),
    isCurrent: Boolean(record.isCurrent ?? record.is_current),
    isActive: Boolean(record.isActive ?? record.is_active ?? record.isCurrent ?? record.is_current),
    notes: normalizeText(record.notes),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    termsCount: Number(record.termsCount ?? record.terms_count ?? 0),
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

function normalizeTerm(record = {}) {
  return {
    id: record.id ?? '',
    academicYearId: record.academicYearId ?? record.academic_year_id ?? '',
    academicYearCode: normalizeText(record.academicYearCode || record.academic_year_code),
    academicYearLabel: normalizeText(record.academicYearLabel || record.academic_year_label),
    academicYearName: normalizeText(record.academicYearName || record.academic_year_name || record.academicYearLabel || record.academic_year_label),
    code: normalizeText(record.code),
    name: normalizeText(record.name || record.label),
    description: normalizeText(record.description || record.notes),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    dateRange: buildDateRange(record.startDate || record.start_date, record.endDate || record.end_date, record.dateRange || record.date_range),
    status: normalizeText(record.status || 'active'),
    isCurrent: Boolean(record.isCurrent ?? record.is_current),
    isActive: Boolean(record.isActive ?? record.is_active ?? record.isCurrent ?? record.is_current),
    sortOrder: Number(record.sortOrder ?? record.sort_order ?? 0),
    notes: normalizeText(record.notes),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

function normalizeLifecyclePayload(payload = {}) {
  const academicYears = Array.isArray(payload.academicYears) ? payload.academicYears : []
  const terms = Array.isArray(payload.terms) ? payload.terms : []

  return {
    academicYears: academicYears.map(normalizeAcademicYear),
    terms: terms.map(normalizeTerm),
    currentContext: payload.currentContext || {},
  }
}

export async function fetchAcademicYears() {
  const response = await http.get('/preschool/settings/academic-years')
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function fetchTerms() {
  const response = await http.get('/preschool/settings/terms')
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function fetchAcademicLifecycle() {
  const [yearsPayload, termsPayload] = await Promise.all([
    fetchAcademicYears(),
    fetchTerms(),
  ])

  return {
    academicYears: yearsPayload.academicYears.length ? yearsPayload.academicYears : termsPayload.academicYears,
    terms: termsPayload.terms.length ? termsPayload.terms : yearsPayload.terms,
    currentContext: yearsPayload.currentContext || termsPayload.currentContext || {},
  }
}

export async function createAcademicYear(payload = {}) {
  const response = await http.post('/preschool/settings/academic-years', payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function updateAcademicYear(yearId, payload = {}) {
  const response = await http.put(`/preschool/settings/academic-years/${encodeURIComponent(String(yearId || '').trim())}`, payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function createAcademicTerm(payload = {}) {
  const response = await http.post('/preschool/settings/terms', payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function updateAcademicTerm(termId, payload = {}) {
  const response = await http.put(`/preschool/settings/terms/${encodeURIComponent(String(termId || '').trim())}`, payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function activateAcademicYear(yearId) {
  const response = await http.post(`/preschool/settings/academic-years/${encodeURIComponent(String(yearId || '').trim())}/activate`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function closeAcademicYear(yearId) {
  const response = await http.post(`/preschool/settings/academic-years/${encodeURIComponent(String(yearId || '').trim())}/close`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function archiveAcademicYear(yearId) {
  const response = await http.post(`/preschool/settings/academic-years/${encodeURIComponent(String(yearId || '').trim())}/archive`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function activateAcademicTerm(termId) {
  const response = await http.post(`/preschool/settings/terms/${encodeURIComponent(String(termId || '').trim())}/activate`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function closeAcademicTerm(termId) {
  const response = await http.post(`/preschool/settings/terms/${encodeURIComponent(String(termId || '').trim())}/close`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function archiveAcademicTerm(termId) {
  const response = await http.post(`/preschool/settings/terms/${encodeURIComponent(String(termId || '').trim())}/archive`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}
