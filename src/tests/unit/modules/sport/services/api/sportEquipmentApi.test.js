import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  approveSportEquipmentRequest,
  createCoachEquipmentRequest,
  createSportEquipmentItem,
  fetchCoachEquipmentItems,
  fetchCoachEquipmentRequest,
  fetchCoachEquipmentRequests,
  fetchSportEquipmentItem,
  fetchSportEquipmentItems,
  fetchSportEquipmentRequest,
  issueSportEquipmentRequest,
  rejectSportEquipmentRequest,
  returnSportEquipmentRequest,
  updateSportEquipmentItem,
} from '@/modules/sport/services/api/sportEquipmentApi'

const {
  httpGet,
  httpPost,
  httpPatch,
  buildFormData,
  buildQueryParams,
  unwrapApiData,
  normalizeEquipmentItemRow,
  normalizeEquipmentRequestRow,
  normalizeEquipmentItemListResponse,
  normalizeEquipmentRequestListResponse,
} = vi.hoisted(() => {
  const httpGetMock = vi.fn()
  const httpPostMock = vi.fn()
  const httpPatchMock = vi.fn()
  const buildFormDataMock = vi.fn((payload) => ({ payload }))
  const buildQueryParamsMock = vi.fn((payload) => payload)
  const unwrapApiDataMock = vi.fn((response) => response?.data || {})
  const normalizeEquipmentItemRowMock = vi.fn((row) => ({ ...row, normalizedItem: true }))
  const normalizeEquipmentRequestRowMock = vi.fn((row) => ({ ...row, normalizedRequest: true }))
  const normalizeEquipmentItemListResponseMock = vi.fn((response) => ({
    items: response?.data?.items || [],
    pagination: response?.data?.pagination || {},
    summary: response?.data?.summary || {},
  }))
  const normalizeEquipmentRequestListResponseMock = vi.fn((response) => ({
    items: response?.data?.items || [],
    pagination: response?.data?.pagination || {},
    summary: response?.data?.summary || {},
  }))

  return {
    httpGet: httpGetMock,
    httpPost: httpPostMock,
    httpPatch: httpPatchMock,
    buildFormData: buildFormDataMock,
    buildQueryParams: buildQueryParamsMock,
    unwrapApiData: unwrapApiDataMock,
    normalizeEquipmentItemRow: normalizeEquipmentItemRowMock,
    normalizeEquipmentRequestRow: normalizeEquipmentRequestRowMock,
    normalizeEquipmentItemListResponse: normalizeEquipmentItemListResponseMock,
    normalizeEquipmentRequestListResponse: normalizeEquipmentRequestListResponseMock,
  }
})

vi.mock('@/services/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
    patch: httpPatch,
  },
}))

vi.mock('@/modules/sport/services/api/sportApiUtils', () => ({
  buildFormData,
  buildQueryParams,
  normalizeEquipmentItemListResponse,
  normalizeEquipmentRequestListResponse,
  normalizeEquipmentItemRow,
  normalizeEquipmentRequestRow,
  unwrapApiData,
}))

describe('sportEquipmentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches admin equipment items from the equipment inventory endpoint', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [{ id: 'item-1' }], pagination: { page: 1 }, summary: { lowStockItems: 2 } } })

    const result = await fetchSportEquipmentItems({ page: 2, perPage: 15, search: 'ball', category: 'ball', status: 'active', stock: 'low' })

    expect(httpGet).toHaveBeenCalledWith(
      '/sport/admin/equipment',
      expect.objectContaining({
        params: {
          page: 2,
          per_page: 15,
          search: 'ball',
          category: 'ball',
          status: 'active',
          stock: 'low',
          sort_by: 'created_at',
          sort_direction: 'desc',
        },
      }),
    )
    expect(buildQueryParams).toHaveBeenCalled()
    expect(normalizeEquipmentItemListResponse).toHaveBeenCalled()
    expect(result.summary.lowStockItems).toBe(2)
  })

  it('uses the coach request endpoints without changing the payload contract', async () => {
    httpPost.mockResolvedValueOnce({ data: { request: { id: 'req-1' } } })
    httpGet.mockResolvedValueOnce({ data: { request: { id: 'req-2' } } })
    httpPatch.mockResolvedValueOnce({ data: { request: { id: 'req-3' } } })

    const created = await createCoachEquipmentRequest({
      equipmentItemId: 'item-1',
      teamId: 'team-1',
      requestedQuantity: 3,
      purpose: 'Training',
      requiredDate: '2026-07-15',
      expectedReturnDate: '2026-07-20',
    })

    const coachItems = await fetchCoachEquipmentItems({ page: 1, perPage: 10 })
    const coachRequests = await fetchCoachEquipmentRequests({ page: 1, perPage: 10 })
    const request = await fetchCoachEquipmentRequest('req-2')
    const item = await fetchSportEquipmentItem('item-1')
    const adminRequest = await fetchSportEquipmentRequest('req-2')
    await createSportEquipmentItem({ name: 'Cones' })
    await updateSportEquipmentItem('item-1', { name: 'Cones 2' })
    await approveSportEquipmentRequest('req-3', { approved_quantity: 2 })
    await rejectSportEquipmentRequest('req-3', { rejectedReason: 'No stock' })
    await issueSportEquipmentRequest('req-3', { issuedQuantity: 1 })
    await returnSportEquipmentRequest('req-3', { returnedQuantity: 1, damagedQuantity: 0, missingQuantity: 0 })

    expect(httpPost).toHaveBeenCalledWith(
      '/sport/coach/equipment/requests',
      expect.objectContaining({ payload: expect.objectContaining({ teamId: 'team-1' }) }),
    )
    expect(httpGet).toHaveBeenCalledWith('/sport/coach/equipment', expect.any(Object))
    expect(httpGet).toHaveBeenCalledWith('/sport/coach/equipment/requests', expect.any(Object))
    expect(httpGet).toHaveBeenCalledWith('/sport/coach/equipment/requests/req-2', expect.any(Object))
    expect(httpGet).toHaveBeenCalledWith('/sport/admin/equipment/item-1', expect.any(Object))
    expect(httpGet).toHaveBeenCalledWith('/sport/admin/equipment-requests/req-2', expect.any(Object))
    expect(httpPost).toHaveBeenCalledWith('/sport/admin/equipment', expect.any(Object))
    expect(httpPost).toHaveBeenCalledWith('/sport/admin/equipment/item-1', expect.any(Object))
    expect(httpPatch).toHaveBeenCalledWith(
      '/sport/admin/equipment-requests/req-3/approve',
      { approved_quantity: 2, admin_note: null },
      {},
    )
    expect(httpPatch).toHaveBeenCalledWith('/sport/admin/equipment-requests/req-3/reject', expect.any(Object))
    expect(httpPatch).toHaveBeenCalledWith('/sport/admin/equipment-requests/req-3/issue', expect.any(Object))
    expect(buildFormData).toHaveBeenCalled()
    expect(created.normalizedRequest).toBe(true)
    expect(coachItems).toBeDefined()
    expect(coachRequests).toBeDefined()
    expect(request.normalizedRequest).toBe(true)
    expect(item.normalizedItem).toBe(true)
    expect(adminRequest.normalizedRequest).toBe(true)
    expect(httpPatch).toHaveBeenCalledWith(
      '/sport/admin/equipment-requests/req-3/return',
      expect.any(Object),
    )
  })
})
