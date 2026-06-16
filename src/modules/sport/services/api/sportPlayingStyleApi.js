import http from '@/services/http'
import {
  buildQueryParams,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
} from '@/services/api'

function normalizePlayingStyleRow(row = {}) {
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

function normalizePlayingStyleListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizePlayingStyleRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildPlayingStylePayload(payload = {}) {
  return {
    name: payload.name || '',
    description: payload.description || '',
    status: payload.status || 'active',
  }
}

export async function fetchSportPlayingStyles(
  {
    page = 1,
    perPage = 10,
    search = '',
    status = '',
  } = {},
  options = {},
) {
  const response = await http.get('/sport/playing-styles', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
    }),
    signal: options.signal,
  })

  return normalizePlayingStyleListResponse(response, page, perPage)
}

export async function fetchSportPlayingStyle(id, options = {}) {
  const response = await http.get(`/sport/playing-styles/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })
  const responsePayload = unwrapApiData(response) || {}

  return normalizePlayingStyleRow(responsePayload.playingStyle || responsePayload)
}

export async function createSportPlayingStyle(payload = {}) {
  const response = await http.post('/sport/playing-styles', buildPlayingStylePayload(payload))
  const responsePayload = unwrapApiData(response) || {}

  return normalizePlayingStyleRow(responsePayload.playingStyle || responsePayload)
}

export async function updateSportPlayingStyle(id, payload = {}) {
  const response = await http.put(
    `/sport/playing-styles/${encodeURIComponent(id)}`,
    buildPlayingStylePayload(payload),
  )
  const responsePayload = unwrapApiData(response) || {}

  return normalizePlayingStyleRow(responsePayload.playingStyle || responsePayload)
}

export async function deleteSportPlayingStyle(id) {
  await http.delete(`/sport/playing-styles/${encodeURIComponent(id)}`)
  return true
}
