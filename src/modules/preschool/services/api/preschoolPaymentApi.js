import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeInvoiceItemRow(row = {}) {
  return {
    id: row.id ?? '',
    invoiceId: row.invoiceId ?? row.invoice_id ?? '',
    description: normalizeText(row.description),
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unitPrice ?? row.unit_price ?? 0),
    amount: Number(row.amount ?? 0),
    sortOrder: Number(row.sortOrder ?? row.sort_order ?? 0),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

function normalizePaymentRow(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name || row.student?.fullName || `${row.student?.first_name || ''} ${row.student?.last_name || ''}`),
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name || row.preschoolClass?.name),
    invoiceId: row.invoiceId ?? row.invoice_id ?? '',
    invoiceNumber: normalizeText(row.invoiceNumber || row.invoice_number || row.invoice?.invoice_number),
    paymentReference: normalizeText(row.paymentReference || row.payment_reference),
    amount: Number(row.amount || 0),
    currency: normalizeText(row.currency || 'USD'),
    paymentMethod: normalizeText(row.paymentMethod || row.payment_method),
    paymentStatus: normalizeText(row.paymentStatus || row.payment_status),
    paidAt: row.paidAt || row.paid_at || '',
    dueDate: row.dueDate || row.due_date || '',
    note: normalizeText(row.note),
    receiptCount: Number(row.receiptCount ?? row.receipt_count ?? 0),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeInvoiceRow(row = {}) {
  return {
    id: row.id ?? '',
    studentId: row.studentId ?? row.student_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name),
    classId: row.classId ?? row.class_id ?? '',
    className: normalizeText(row.className || row.class_name),
    academicYearId: row.academicYearId ?? row.academic_year_id ?? '',
    academicYearLabel: normalizeText(row.academicYearLabel || row.academic_year_label),
    termId: row.termId ?? row.term_id ?? '',
    termLabel: normalizeText(row.termLabel || row.term_label),
    invoiceNumber: normalizeText(row.invoiceNumber || row.invoice_number),
    issueDate: row.issueDate || row.issue_date || '',
    dueDate: row.dueDate || row.due_date || '',
    subtotal: Number(row.subtotal ?? 0),
    discountAmount: Number(row.discountAmount ?? row.discount_amount ?? 0),
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    paidAmount: Number(row.paidAmount ?? row.paid_amount ?? 0),
    balanceDue: Number(row.balanceDue ?? row.balance_due ?? 0),
    status: normalizeText(row.status || 'draft'),
    items: Array.isArray(row.items) ? row.items.map(normalizeInvoiceItemRow) : [],
    payments: Array.isArray(row.payments) ? row.payments.map(normalizePaymentRow) : [],
    receipts: Array.isArray(row.receipts) ? row.receipts.map(normalizeReceiptRow) : [],
    createdBy: normalizeText(row.createdBy || row.created_by),
    updatedBy: normalizeText(row.updatedBy || row.updated_by),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeReceiptRow(row = {}) {
  return {
    id: row.id ?? '',
    paymentId: row.paymentId ?? row.payment_id ?? '',
    invoiceId: row.invoiceId ?? row.invoice_id ?? '',
    studentName: normalizeText(row.studentName || row.student_name),
    invoiceNumber: normalizeText(row.invoiceNumber || row.invoice_number),
    paymentReference: normalizeText(row.paymentReference || row.payment_reference),
    receiptNumber: normalizeText(row.receiptNumber || row.receipt_number),
    issuedAt: row.issuedAt || row.issued_at || '',
    issuedBy: normalizeText(row.issuedBy || row.issued_by),
    amount: Number(row.amount ?? 0),
    paymentMethod: normalizeText(row.paymentMethod || row.payment_method),
    notes: normalizeText(row.notes),
    reissuedFromReceiptId: row.reissuedFromReceiptId ?? row.reissued_from_receipt_id ?? '',
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeInvoiceListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizeInvoiceRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export async function fetchPreschoolInvoices(
  { page = 1, perPage = 10, search = '', classId = '', studentId = '', status = '' } = {},
  options = {},
) {
  const response = await http.get('/preschool/invoices', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      class_id: classId,
      student_id: studentId,
      status,
    }),
    signal: options.signal,
  })

  return normalizeInvoiceListResponse(response, page, perPage)
}

export async function fetchPreschoolInvoice(id, options = {}) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return null

  const response = await http.get(`/preschool/invoices/${encodeURIComponent(invoiceId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeInvoiceRow(payload.invoice || payload)
}

export async function createPreschoolInvoice(payload = {}) {
  const response = await http.post('/preschool/invoices', payload)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function updatePreschoolInvoice(id, payload = {}) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) throw new Error('Invoice id is required.')

  const response = await http.put(`/preschool/invoices/${encodeURIComponent(invoiceId)}`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function issuePreschoolInvoice(id) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return null

  const response = await http.post(`/preschool/invoices/${encodeURIComponent(invoiceId)}/issue`)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function cancelPreschoolInvoice(id) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return null

  const response = await http.post(`/preschool/invoices/${encodeURIComponent(invoiceId)}/cancel`)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function deletePreschoolInvoice(id) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return null

  const response = await http.delete(`/preschool/invoices/${encodeURIComponent(invoiceId)}`)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function markPreschoolInvoiceOverdue(id) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return null

  const response = await http.post(`/preschool/invoices/${encodeURIComponent(invoiceId)}/overdue`)
  const data = unwrapApiData(response) || {}
  return normalizeInvoiceRow(data.invoice || data)
}

export async function fetchPreschoolStudentInvoices(studentId, options = {}) {
  const id = String(studentId ?? '').trim()
  if (!id) return []

  const response = await http.get(`/preschool/students/${encodeURIComponent(id)}/invoices`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return Array.isArray(payload.items) ? payload.items.map(normalizeInvoiceRow) : []
}

export async function fetchPreschoolStudentPaymentSummary(studentId, options = {}) {
  const id = String(studentId ?? '').trim()
  if (!id) return null

  const response = await http.get(`/preschool/students/${encodeURIComponent(id)}/payment-summary`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return {
    summary: payload.summary || {},
    recentInvoices: Array.isArray(payload.recentInvoices) ? payload.recentInvoices.map(normalizeInvoiceRow) : [],
    recentReceipts: Array.isArray(payload.recentReceipts) ? payload.recentReceipts.map(normalizeReceiptRow) : [],
  }
}

export async function createPreschoolReceiptFromPayment(paymentId, payload = {}) {
  const id = String(paymentId ?? '').trim()
  if (!id) return null

  const response = await http.post(`/preschool/payments/${encodeURIComponent(id)}/receipt`, payload)
  const data = unwrapApiData(response) || {}
  return normalizeReceiptRow(data.receipt || data)
}

export async function fetchPreschoolReceipt(id, options = {}) {
  const receiptId = String(id ?? '').trim()
  if (!receiptId) return null

  const response = await http.get(`/preschool/receipts/${encodeURIComponent(receiptId)}`, {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizeReceiptRow(payload.receipt || payload)
}

export async function printPreschoolInvoice(id) {
  const invoiceId = String(id ?? '').trim()
  if (!invoiceId) return ''

  const response = await http.get(`/preschool/invoices/${encodeURIComponent(invoiceId)}/print`, {
    responseType: 'text',
  })

  return typeof response.data === 'string' ? response.data : ''
}

export async function printPreschoolReceipt(id) {
  const receiptId = String(id ?? '').trim()
  if (!receiptId) return ''

  const response = await http.get(`/preschool/receipts/${encodeURIComponent(receiptId)}/print`, {
    responseType: 'text',
  })

  return typeof response.data === 'string' ? response.data : ''
}

export {
  normalizeInvoiceRow,
  normalizeReceiptRow,
  normalizePaymentRow,
}
