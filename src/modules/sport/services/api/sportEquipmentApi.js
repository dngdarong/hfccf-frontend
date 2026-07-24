import http from '@/services/http'
import {
  buildFormData,
  buildQueryParams,
  normalizeEquipmentItemListResponse,
  normalizeEquipmentRequestListResponse,
  normalizeEquipmentItemRow,
  normalizeEquipmentRequestRow,
  normalizeEquipmentAssignmentListResponse,
  normalizeEquipmentAssignmentRow,
  unwrapApiData,
} from './sportApiUtils'

export async function fetchSportEquipmentItems(options = {}) {
  const response = await http.get('/sport/admin/equipment', {
    params: buildQueryParams({
      page: options.page ?? 1,
      per_page: options.perPage ?? 10,
      search: options.search || '',
      category: options.category || '',
      status: options.status || '',
      stock: options.stock || '',
      sort_by: options.sortBy || 'created_at',
      sort_direction: options.sortDirection || 'desc',
    }),
    signal: options.signal,
  })

  return normalizeEquipmentItemListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchSportEquipmentItem(id, options = {}) {
  const response = await http.get(`/sport/admin/equipment/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeEquipmentItemRow(payload.item || payload)
}

export async function createSportEquipmentItem(payload = {}, options = {}) {
  const response = await http.post('/sport/admin/equipment', buildFormData(payload, options))
  const data = unwrapApiData(response) || {}
  return normalizeEquipmentItemRow(data.item || data)
}

export async function updateSportEquipmentItem(id, payload = {}, options = {}) {
  const response = await http.post(`/sport/admin/equipment/${encodeURIComponent(id)}`, buildFormData(payload, { ...options, method: 'PUT' }))
  const data = unwrapApiData(response) || {}
  return normalizeEquipmentItemRow(data.item || data)
}

export async function fetchSportEquipmentRequests(options = {}) {
  const response = await http.get('/sport/admin/equipment-requests', {
    params: buildQueryParams({
      page: options.page ?? 1,
      per_page: options.perPage ?? 10,
      search: options.search || '',
      status: options.status || '',
      coach_user_id: options.coachUserId || '',
      team_id: options.teamId || '',
      equipment_item_id: options.equipmentItemId || '',
      sort_by: options.sortBy || 'created_at',
      sort_direction: options.sortDirection || 'desc',
    }),
    signal: options.signal,
  })

  return normalizeEquipmentRequestListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchSportEquipmentRequest(id, options = {}) {
  const response = await http.get(`/sport/admin/equipment-requests/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(payload.request || payload)
}

export async function approveSportEquipmentRequest(id, payload = {}, options = {}) {
  const response = await http.patch(
    `/sport/admin/equipment-requests/${encodeURIComponent(id)}/approve`,
    {
      approved_quantity: payload.approved_quantity ?? payload.approvedQuantity ?? null,
      admin_note: payload.admin_note ?? payload.adminNote ?? null,
    },
    options,
  )

  const data = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(data.request || data)
}

export async function rejectSportEquipmentRequest(id, payload = {}, options = {}) {
  const response = await http.patch(
    `/sport/admin/equipment-requests/${encodeURIComponent(id)}/reject`,
    buildFormData(payload, options),
  )

  const data = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(data.request || data)
}

export async function issueSportEquipmentRequest(id, payload = {}, options = {}) {
  const response = await http.patch(
    `/sport/admin/equipment-requests/${encodeURIComponent(id)}/issue`,
    buildFormData(payload, options),
  )

  const data = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(data.request || data)
}

export async function returnSportEquipmentRequest(id, payload = {}, options = {}) {
  const response = await http.patch(
    `/sport/admin/equipment-requests/${encodeURIComponent(id)}/return`,
    buildFormData(payload, options),
  )

  const data = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(data.request || data)
}

export async function fetchCoachEquipmentItems(options = {}) {
  const response = await http.get('/sport/coach/equipment', {
    params: buildQueryParams({
      page: options.page ?? 1,
      per_page: options.perPage ?? 10,
      search: options.search || '',
      category: options.category || '',
      stock: options.stock || '',
      sort_by: options.sortBy || 'created_at',
      sort_direction: options.sortDirection || 'desc',
    }),
    signal: options.signal,
  })

  return normalizeEquipmentItemListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchCoachEquipmentRequests(options = {}) {
  const response = await http.get('/sport/coach/equipment/requests', {
    params: buildQueryParams({
      page: options.page ?? 1,
      per_page: options.perPage ?? 10,
      search: options.search || '',
      status: options.status || '',
      team_id: options.teamId || '',
      equipment_item_id: options.equipmentItemId || '',
      sort_by: options.sortBy || 'created_at',
      sort_direction: options.sortDirection || 'desc',
    }),
    signal: options.signal,
  })

  return normalizeEquipmentRequestListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchCoachEquipmentRequest(id, options = {}) {
  const response = await http.get(`/sport/coach/equipment/requests/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(payload.request || payload)
}

export async function createCoachEquipmentRequest(payload = {}, options = {}) {
  const response = await http.post('/sport/coach/equipment/requests', buildFormData(payload, options))
  const data = unwrapApiData(response) || {}
  return normalizeEquipmentRequestRow(data.request || data)
}

function buildAssignmentQuery(options = {}) {
  return buildQueryParams({
    page: options.page ?? 1,
    per_page: options.perPage ?? 10,
    search: options.search || '',
    equipment_item_id: options.equipmentItemId || '',
    team_id: options.teamId || '',
    coach_user_id: options.coachUserId || '',
    status: options.status || '',
    sort_by: options.sortBy || '',
    sort_direction: options.sortDirection || '',
  })
}

function assignmentListOptions(options = {}) {
  return {
    params: buildAssignmentQuery(options),
    signal: options.signal,
  }
}

export async function fetchEquipmentAssignments(options = {}) {
  const response = await http.get('/sport/admin/equipment-assignments', assignmentListOptions(options))
  return normalizeEquipmentAssignmentListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchEquipmentAssignment(id, options = {}) {
  const response = await http.get(`/sport/admin/equipment-assignments/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}
  return normalizeEquipmentAssignmentRow(payload.assignment || payload)
}

export async function fetchEquipmentItemAssignments(equipmentItemId, options = {}) {
  const response = await http.get(
    `/sport/admin/equipment/${encodeURIComponent(equipmentItemId)}/assignments`,
    assignmentListOptions({ ...options, equipmentItemId: undefined }),
  )
  return normalizeEquipmentAssignmentListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchTeamEquipmentAssignments(teamId, options = {}) {
  const response = await http.get(
    `/sport/admin/teams/${encodeURIComponent(teamId)}/equipment-assignments`,
    assignmentListOptions({ ...options, teamId: undefined }),
  )
  return normalizeEquipmentAssignmentListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchCoachEquipmentAssignments(options = {}) {
  const response = await http.get('/sport/coach/equipment/assignments', assignmentListOptions(options))
  return normalizeEquipmentAssignmentListResponse(response, options.page ?? 1, options.perPage ?? 10)
}

export async function fetchCoachEquipmentAssignment(id, options = {}) {
  const response = await http.get(`/sport/coach/equipment/assignments/${encodeURIComponent(id)}`, {
    signal: options.signal,
  })
  const payload = unwrapApiData(response) || {}
  return normalizeEquipmentAssignmentRow(payload.assignment || payload)
}
