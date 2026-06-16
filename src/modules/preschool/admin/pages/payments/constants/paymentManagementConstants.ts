export const PAGE_SIZE = 10

export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export const DEFAULT_FORM = {
  student_id: '',
  class_id: '',
  payment_reference: '',
  amount: '',
  currency: 'USD',
  payment_method: 'cash',
  payment_status: 'pending',
  paid_at: '',
  due_date: '',
  note: '',
}

export const MODAL_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
}
