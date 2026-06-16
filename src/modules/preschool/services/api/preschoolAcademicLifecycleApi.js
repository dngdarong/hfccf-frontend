// Keep academic lifecycle HTTP calls isolated so Preschool settings can manage
// years and terms without mixing them into the older backbone snapshot API.
import http from '@/services/http'
import { unwrapApiData } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeAcademicYear(record = {}) {
  return {
    id: record.id ?? '',
    code: normalizeText(record.code),
    label: normalizeText(record.label),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    status: normalizeText(record.status || 'active'),
    isCurrent: Boolean(record.isCurrent ?? record.is_current),
    notes: normalizeText(record.notes),
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
    code: normalizeText(record.code),
    name: normalizeText(record.name),
    startDate: record.startDate || record.start_date || '',
    endDate: record.endDate || record.end_date || '',
    status: normalizeText(record.status || 'active'),
    isCurrent: Boolean(record.isCurrent ?? record.is_current),
    sortOrder: Number(record.sortOrder ?? record.sort_order ?? 0),
    notes: normalizeText(record.notes),
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

export async function fetchAcademicLifecycle() {
  const response = await http.get('/preschool/academic-lifecycle')
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function createAcademicYear(payload = {}) {
  const response = await http.post('/preschool/academic-years', payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function updateAcademicYear(yearId, payload = {}) {
  const response = await http.patch(`/preschool/academic-years/${encodeURIComponent(String(yearId || '').trim())}`, payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function activateAcademicYear(yearId) {
  const response = await http.patch(`/preschool/academic-years/${encodeURIComponent(String(yearId || '').trim())}/activate`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function closeAcademicYear(yearId) {
  const response = await http.patch(`/preschool/academic-years/${encodeURIComponent(String(yearId || '').trim())}/close`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function createAcademicTerm(payload = {}) {
  const response = await http.post('/preschool/terms', payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function updateAcademicTerm(termId, payload = {}) {
  const response = await http.patch(`/preschool/terms/${encodeURIComponent(String(termId || '').trim())}`, payload)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function activateAcademicTerm(termId) {
  const response = await http.patch(`/preschool/terms/${encodeURIComponent(String(termId || '').trim())}/activate`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}

export async function closeAcademicTerm(termId) {
  const response = await http.patch(`/preschool/terms/${encodeURIComponent(String(termId || '').trim())}/close`)
  return normalizeLifecyclePayload(unwrapApiData(response) || {})
}
