export const PAGE_SIZE = 10

export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export const DEFAULT_FORM = {
  mode: 'existing_invoice',
  student_id: '',
  class_id: '',
  invoice_id: '',
  payment_reference: '',
  description: '',
  amount: '',
  currency: 'USD',
  payment_method: 'cash',
  payment_status: 'paid',
  paid_at: '',
  issue_date: '',
  due_date: '',
  note: '',
}

export const MODAL_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
}
