export function toPositiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

export function normalizePerPage(value, fallback = 10, max = 100) {
  return Math.min(toPositiveInteger(value, fallback), max)
}

export function unwrapApiData(response) {
  return response?.data?.data ?? response?.data ?? null
}

export function unwrapApiItems(response) {
  const payload = unwrapApiData(response)

  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export function unwrapApiPagination(response, fallbackPage = 1, fallbackPerPage = 10, fallbackTotal = 0) {
  const payload = unwrapApiData(response) || {}
  const pagination = payload.pagination || payload.meta || payload
  const page = toPositiveInteger(pagination.page || pagination.current_page || fallbackPage, fallbackPage)
  const perPage = toPositiveInteger(
    pagination.perPage || pagination.per_page || fallbackPerPage,
    fallbackPerPage,
  )
  const total = toPositiveInteger(pagination.total ?? fallbackTotal, fallbackTotal)
  const totalPages = toPositiveInteger(
    pagination.totalPages || pagination.last_page || Math.max(Math.ceil(total / perPage), 1),
    Math.max(Math.ceil(total / perPage), 1),
  )

  return {
    page,
    perPage,
    total,
    totalPages,
  }
}

export function buildQueryParams(params = {}) {
  const query = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) return
      query[key] = trimmed
      return
    }

    query[key] = value
  })

  return query
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.isNetworkError || error?.code === 'ERR_NETWORK' || error?.code === 'NETWORK_ERROR') {
    return 'Unable to reach the backend API. Check that the backend is running and the API URL is correct.'
  }

  if (error?.validationErrors) {
    return fallbackMessage
  }

  return error?.message || error?.response?.data?.message || error?.response?.data?.error || fallbackMessage
}
