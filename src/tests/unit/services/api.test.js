import { describe, it, expect } from 'vitest'
import {
  toPositiveInteger,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
  buildQueryParams,
  getApiErrorMessage,
} from '@/services/api'

// ─── toPositiveInteger ────────────────────────────────────────────────────────

describe('toPositiveInteger', () => {
  it('returns parsed positive integer', () => {
    expect(toPositiveInteger(5, 1)).toBe(5)
    expect(toPositiveInteger('10', 1)).toBe(10)
  })

  it('floors decimal values', () => {
    expect(toPositiveInteger(3.9, 1)).toBe(3)
  })

  it('returns fallback for zero', () => {
    expect(toPositiveInteger(0, 1)).toBe(1)
  })

  it('returns fallback for negative numbers', () => {
    expect(toPositiveInteger(-5, 1)).toBe(1)
  })

  it('returns fallback for NaN', () => {
    expect(toPositiveInteger(NaN, 1)).toBe(1)
    expect(toPositiveInteger('abc', 1)).toBe(1)
  })

  it('returns fallback for null or undefined', () => {
    expect(toPositiveInteger(null, 5)).toBe(5)
    expect(toPositiveInteger(undefined, 5)).toBe(5)
  })
})

// ─── unwrapApiData ────────────────────────────────────────────────────────────

describe('unwrapApiData', () => {
  it('unwraps response.data.data (Laravel API Resource style)', () => {
    const res = { data: { data: { id: 1, name: 'Test' } } }
    expect(unwrapApiData(res)).toEqual({ id: 1, name: 'Test' })
  })

  it('falls back to response.data when data.data is absent', () => {
    const res = { data: { id: 1 } }
    expect(unwrapApiData(res)).toEqual({ id: 1 })
  })

  it('returns null for undefined response', () => {
    expect(unwrapApiData(undefined)).toBeNull()
    expect(unwrapApiData(null)).toBeNull()
  })

  it('returns null for response with no data', () => {
    expect(unwrapApiData({})).toBeNull()
  })
})

// ─── unwrapApiItems ───────────────────────────────────────────────────────────

describe('unwrapApiItems', () => {
  it('returns array directly from response.data.data', () => {
    const res = { data: { data: [1, 2, 3] } }
    expect(unwrapApiItems(res)).toEqual([1, 2, 3])
  })

  it('unwraps items from payload.items', () => {
    const res = { data: { data: { items: ['a', 'b'] } } }
    expect(unwrapApiItems(res)).toEqual(['a', 'b'])
  })

  it('unwraps from nested payload.data array', () => {
    const res = { data: { data: { data: ['x', 'y'] } } }
    expect(unwrapApiItems(res)).toEqual(['x', 'y'])
  })

  it('returns empty array when response is missing', () => {
    expect(unwrapApiItems({})).toEqual([])
    expect(unwrapApiItems(undefined)).toEqual([])
  })
})

// ─── unwrapApiPagination ──────────────────────────────────────────────────────

describe('unwrapApiPagination', () => {
  it('extracts pagination from a standard response', () => {
    const res = {
      data: {
        data: { pagination: { page: 2, perPage: 15, total: 100, totalPages: 7 } },
      },
    }
    const pagination = unwrapApiPagination(res)
    expect(pagination.page).toBe(2)
    expect(pagination.perPage).toBe(15)
    expect(pagination.total).toBe(100)
    expect(pagination.totalPages).toBe(7)
  })

  it('handles Laravel-style current_page / per_page keys', () => {
    const res = {
      data: { data: { pagination: { current_page: 3, per_page: 20, total: 200, last_page: 10 } } },
    }
    const pagination = unwrapApiPagination(res)
    expect(pagination.page).toBe(3)
    expect(pagination.perPage).toBe(20)
    expect(pagination.total).toBe(200)
    expect(pagination.totalPages).toBe(10)
  })

  it('uses fallback values when pagination data is absent', () => {
    const pagination = unwrapApiPagination({})
    expect(pagination.page).toBe(1)
    expect(pagination.perPage).toBe(10)
    expect(pagination.total).toBe(0)
  })

  it('calculates totalPages from total and perPage when not provided', () => {
    const res = {
      data: { data: { pagination: { page: 1, perPage: 10, total: 35 } } },
    }
    const { totalPages } = unwrapApiPagination(res)
    expect(totalPages).toBe(4) // ceil(35 / 10) = 4
  })
})

// ─── buildQueryParams ─────────────────────────────────────────────────────────

describe('buildQueryParams', () => {
  it('removes null and undefined values', () => {
    const result = buildQueryParams({ a: null, b: undefined, c: 'value' })
    expect(result).toEqual({ c: 'value' })
  })

  it('removes empty or whitespace-only strings', () => {
    const result = buildQueryParams({ search: '  ', name: 'test' })
    expect(result).toEqual({ name: 'test' })
  })

  it('trims string values', () => {
    const result = buildQueryParams({ name: '  John  ' })
    expect(result).toEqual({ name: 'John' })
  })

  it('keeps zero and false (falsy non-null values)', () => {
    const result = buildQueryParams({ page: 0, active: false, count: 0 })
    expect(result).toEqual({ page: 0, active: false, count: 0 })
  })

  it('returns empty object for empty params', () => {
    expect(buildQueryParams({})).toEqual({})
    expect(buildQueryParams()).toEqual({})
  })
})

// ─── getApiErrorMessage ───────────────────────────────────────────────────────

describe('getApiErrorMessage', () => {
  it('returns backend-unreachable message for isNetworkError', () => {
    const msg = getApiErrorMessage({ isNetworkError: true }, 'fallback')
    expect(msg).toMatch(/backend API/)
  })

  it('returns backend-unreachable message for ERR_NETWORK code', () => {
    const msg = getApiErrorMessage({ code: 'ERR_NETWORK' }, 'fallback')
    expect(msg).toMatch(/backend API/)
  })

  it('returns fallback message for validation errors', () => {
    const error = { validationErrors: { email: ['The email field is required.'] } }
    expect(getApiErrorMessage(error, 'Validation failed')).toBe('Validation failed')
  })

  it('returns error.message when available', () => {
    expect(getApiErrorMessage({ message: 'Unauthorized' }, 'fallback')).toBe('Unauthorized')
  })

  it('reads message from response.data.message', () => {
    const error = { response: { data: { message: 'Not found' } } }
    expect(getApiErrorMessage(error, 'fallback')).toBe('Not found')
  })

  it('falls back to the provided fallback message', () => {
    expect(getApiErrorMessage({}, 'Something went wrong')).toBe('Something went wrong')
    expect(getApiErrorMessage(null, 'Default')).toBe('Default')
  })
})
