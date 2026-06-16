import { FINAL_STATUSES, EDITABLE_STATUSES } from '../constants/enrollmentManagementConstants'

export function formatPaginationFromResponse(response: any) {
  return {
    currentPage: response?.meta?.current_page ?? 1,
    lastPage: response?.meta?.last_page ?? 1,
    total: response?.meta?.total ?? 0,
  }
}

export function extractApplicationsFromResponse(response: any) {
  return response?.data ?? []
}

export function isFinalStatus(status: string): boolean {
  return FINAL_STATUSES.includes(status)
}

export function canEdit(status: string): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function canShowDecisionActions(status: string): boolean {
  return !isFinalStatus(status)
}

export function canShowEditButton(status: string): boolean {
  return !isFinalStatus(status)
}

export function canShowSubmitButton(status: string): boolean {
  return status === 'draft'
}

export function canShowReviewButton(status: string): boolean {
  return ['submitted', 'waitlisted'].includes(status)
}

export function canShowApproveButton(status: string): boolean {
  return status === 'under_review'
}

export function canShowWaitlistButton(status: string): boolean {
  return ['submitted', 'under_review'].includes(status)
}

export function canShowEnrollButton(status: string): boolean {
  return status === 'approved'
}

export function canShowRejectButton(status: string): boolean {
  return ['submitted', 'under_review'].includes(status)
}

export function canShowCancelButton(status: string): boolean {
  return !['enrolled', 'rejected'].includes(status)
}

export function applyUpdate(applicationsList: any[], selectedRecord: any, id: string, updated: any) {
  const idx = applicationsList.findIndex((a) => a.id === id)
  if (idx !== -1 && updated) {
    applicationsList[idx] = updated
  }
  if (selectedRecord?.id === id && updated) {
    return updated
  }
  return selectedRecord
}

export function resetFilters() {
  return {
    search: '',
    status: '',
    academicYearId: '',
  }
}

export function buildPaymentToast(t: any, payment: any) {
  if (!payment) return null

  const { amount, currency, description } = payment
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(Number(amount))

  return {
    severity: 'info',
    summary: t('preschoolEnrollmentPage.messages.paymentCreated'),
    detail: `${t('preschoolEnrollmentPage.messages.paymentCreatedDetail', { amount: formatted })} — ${description ?? ''}`.trim(),
    life: 6000,
  }
}

export function extractApplicationFromResponse(response: any) {
  return response?.application ?? response
}
