import http from '@/services/http'
import {
  buildQueryParams,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
} from '@/services/api'

function normalizeDivisionRow(row = {}) {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    description: row.description ?? '',
    status: row.status ?? 'active',
    teamsCount: row.teamsCount ?? 0,
    createdAt: row.createdAt || '',
    updatedAt: row.updatedAt || '',
    raw: row,
  }
}

function normalizeDivisionListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeDivisionRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildDivisionPayload(payload = {}) {
  return {
    name: payload.name || '',
    description: payload.description || '',
    status: payload.status || 'active',
  }
}

export async function fetchSportDivisions(
  {
    page = 1,
    perPage = 10,
    search = '',
    status = '',
  } = {},
  options = {},
) {
  const response = await http.get('/sport/divisions', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
    }),
    signal: options.signal,
  })

  return normalizeDivisionListResponse(response, page, perPage)
}

export async function fetchSportDivision(id, options = {}) {
  const response = await http.get(`/sport/divisions/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })
  const responsePayload = unwrapApiData(response) || {}

  return normalizeDivisionRow(responsePayload.division || responsePayload)
}

export async function createSportDivision(payload = {}) {
  const response = await http.post('/sport/divisions', buildDivisionPayload(payload))
  const responsePayload = unwrapApiData(response) || {}

  return normalizeDivisionRow(responsePayload.division || responsePayload)
}

export async function updateSportDivision(id, payload = {}) {
  const response = await http.put(
    `/sport/divisions/${encodeURIComponent(id)}`,
    buildDivisionPayload(payload),
  )
  const responsePayload = unwrapApiData(response) || {}

  return normalizeDivisionRow(responsePayload.division || responsePayload)
}

export async function deleteSportDivision(id) {
  await http.delete(`/sport/divisions/${encodeURIComponent(id)}`)
  return true
}
