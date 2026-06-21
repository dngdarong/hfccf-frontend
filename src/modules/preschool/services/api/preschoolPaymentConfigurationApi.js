import http from '@/services/http'
import { unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function resolveId(input) {
  if (typeof input === 'string' || typeof input === 'number') {
    return String(input).trim()
  }

  return String(input?.id || '').trim()
}

function unwrapRecord(payload = {}, keys = []) {
  for (const key of keys) {
    const value = payload?.[key]
    if (value && typeof value === 'object') {
      return value
    }
  }

  return payload
}

function resolveStatus(record = {}) {
  if (record.status) {
    return normalizeText(record.status)
  }

  return normalizeBoolean(record.isActive ?? record.is_active, true) ? 'active' : 'archived'
}

export function normalizePaymentSettings(record = {}) {
  return {
    id: record.id ?? '',
    invoicePrefix: normalizeText(record.invoicePrefix ?? record.invoice_prefix ?? 'INV'),
    receiptPrefix: normalizeText(record.receiptPrefix ?? record.receipt_prefix ?? 'RCT'),
    nextInvoiceNumber: normalizeNumber(record.nextInvoiceNumber ?? record.next_invoice_number, 1),
    nextReceiptNumber: normalizeNumber(record.nextReceiptNumber ?? record.next_receipt_number, 1),
    lateFeeEnabled: normalizeBoolean(record.lateFeeEnabled ?? record.late_fee_enabled, true),
    lateFeeType: normalizeText(record.lateFeeType || record.late_fee_type || 'fixed'),
    lateFeeAmount: normalizeNumber(record.lateFeeAmount ?? record.late_fee_amount, 5),
    gracePeriodDays: normalizeNumber(record.gracePeriodDays ?? record.grace_period_days, 5),
    prorationEnabled: normalizeBoolean(record.prorationEnabled ?? record.proration_enabled, false),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

export function normalizeFeeType(record = {}) {
  const status = resolveStatus(record)

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    defaultAmount: normalizeNumber(record.defaultAmount ?? record.default_amount, 0),
    isRequired: normalizeBoolean(record.isRequired ?? record.is_required, false),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizePaymentMethod(record = {}) {
  const status = resolveStatus(record)

  return {
    id: record.id ?? '',
    name: normalizeText(record.name),
    code: normalizeText(record.code),
    description: normalizeText(record.description),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, status === 'active'),
    status,
    sortOrder: normalizeNumber(record.sortOrder ?? record.sort_order, 0),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    deletedAt: record.deletedAt || record.deleted_at || '',
    raw: record,
  }
}

export function normalizeBillingRule(record = {}) {
  return {
    id: record.id ?? '',
    ruleName: normalizeText(record.ruleName || record.rule_name),
    ruleCode: normalizeText(record.ruleCode || record.rule_code),
    ruleValue: normalizeText(record.ruleValue || record.rule_value),
    description: normalizeText(record.description),
    isActive: normalizeBoolean(record.isActive ?? record.is_active, true),
    createdBy: record.createdBy ?? record.created_by ?? '',
    updatedBy: record.updatedBy ?? record.updated_by ?? '',
    createdAt: record.createdAt || record.created_at || '',
    updatedAt: record.updatedAt || record.updated_at || '',
    raw: record,
  }
}

function normalizeListResponse(response, normalizer, fallbackPage = 1, fallbackPerPage = 20) {
  const items = unwrapApiItems(response)
  return {
    items: items.map(normalizer),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeRecordResponse(response, keys) {
  const payload = unwrapApiData(response) || {}
  return unwrapRecord(payload, keys)
}

function buildPaymentSettingsPayload(settings = {}) {
  return {
    invoice_prefix: normalizeText((settings.invoicePrefix ?? settings.invoice_prefix) || 'INV'),
    receipt_prefix: normalizeText((settings.receiptPrefix ?? settings.receipt_prefix) || 'RCT'),
    next_invoice_number: normalizeNumber(settings.nextInvoiceNumber ?? settings.next_invoice_number, 1),
    next_receipt_number: normalizeNumber(settings.nextReceiptNumber ?? settings.next_receipt_number, 1),
    late_fee_enabled: normalizeBoolean(settings.lateFeeEnabled ?? settings.late_fee_enabled, true),
    late_fee_type: normalizeText((settings.lateFeeType ?? settings.late_fee_type) || 'fixed'),
    late_fee_amount: normalizeNumber(settings.lateFeeAmount ?? settings.late_fee_amount, 5),
    grace_period_days: normalizeNumber(settings.gracePeriodDays ?? settings.grace_period_days, 5),
    proration_enabled: normalizeBoolean(settings.prorationEnabled ?? settings.proration_enabled, false),
  }
}

function buildFeeTypePayload(feeType = {}) {
  return {
    name: normalizeText(feeType.name),
    code: normalizeText(feeType.code),
    description: normalizeText(feeType.description),
    default_amount: normalizeNumber(feeType.defaultAmount ?? feeType.default_amount, 0),
    is_required: normalizeBoolean(feeType.isRequired ?? feeType.is_required, false),
    is_active: normalizeBoolean(feeType.isActive ?? feeType.is_active, true),
    sort_order: normalizeNumber(feeType.sortOrder ?? feeType.sort_order, 0),
  }
}

function buildPaymentMethodPayload(method = {}) {
  return {
    name: normalizeText(method.name),
    code: normalizeText(method.code),
    description: normalizeText(method.description),
    is_active: normalizeBoolean(method.isActive ?? method.is_active, true),
    sort_order: normalizeNumber(method.sortOrder ?? method.sort_order, 0),
  }
}

function buildBillingRulesPayload(rules = []) {
  return {
    rules: Array.isArray(rules)
      ? rules.map((rule) => ({
        rule_name: normalizeText(rule.ruleName ?? rule.rule_name),
        rule_code: normalizeText(rule.ruleCode ?? rule.rule_code),
        rule_value: normalizeText(rule.ruleValue ?? rule.rule_value),
        description: normalizeText(rule.description),
        is_active: normalizeBoolean(rule.isActive ?? rule.is_active, true),
      }))
      : [],
  }
}

export async function fetchPaymentSettings(options = {}) {
  const response = await http.get('/preschool/settings/payments', {
    signal: options.signal,
  })

  const payload = unwrapApiData(response) || {}
  return normalizePaymentSettings(payload.settings || payload)
}

export async function updatePaymentSettings(settings = {}) {
  const response = await http.put('/preschool/settings/payments', buildPaymentSettingsPayload(settings))
  const payload = unwrapApiData(response) || {}
  return normalizePaymentSettings(payload.settings || payload)
}

export async function fetchFeeTypes(options = {}) {
  const response = await http.get('/preschool/settings/payments/fee-types', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeFeeType)
}

export async function createFeeType(feeType = {}) {
  const response = await http.post('/preschool/settings/payments/fee-types', buildFeeTypePayload(feeType))
  const payload = unwrapApiData(response) || {}
  return normalizeFeeType(normalizeRecordResponse(response, ['fee_type', 'feeType', 'data']) || payload)
}

export async function updateFeeType(feeTypeOrId, feeType = {}) {
  const feeTypeId = resolveId(feeTypeOrId)
  const response = await http.put(
    `/preschool/settings/payments/fee-types/${encodeURIComponent(feeTypeId)}`,
    buildFeeTypePayload(feeType),
  )
  const payload = unwrapApiData(response) || {}
  return normalizeFeeType(normalizeRecordResponse(response, ['fee_type', 'feeType', 'data']) || payload)
}

export async function archiveFeeType(feeTypeOrId) {
  const feeTypeId = resolveId(feeTypeOrId)
  const response = await http.post(`/preschool/settings/payments/fee-types/${encodeURIComponent(feeTypeId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizeFeeType(normalizeRecordResponse(response, ['fee_type', 'feeType', 'data']) || payload)
}

export async function fetchPaymentMethods(options = {}) {
  const response = await http.get('/preschool/settings/payments/payment-methods', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizePaymentMethod)
}

export async function createPaymentMethod(method = {}) {
  const response = await http.post('/preschool/settings/payments/payment-methods', buildPaymentMethodPayload(method))
  const payload = unwrapApiData(response) || {}
  return normalizePaymentMethod(normalizeRecordResponse(response, ['payment_method', 'paymentMethod', 'data']) || payload)
}

export async function updatePaymentMethod(methodOrId, method = {}) {
  const methodId = resolveId(methodOrId)
  const response = await http.put(
    `/preschool/settings/payments/payment-methods/${encodeURIComponent(methodId)}`,
    buildPaymentMethodPayload(method),
  )
  const payload = unwrapApiData(response) || {}
  return normalizePaymentMethod(normalizeRecordResponse(response, ['payment_method', 'paymentMethod', 'data']) || payload)
}

export async function archivePaymentMethod(methodOrId) {
  const methodId = resolveId(methodOrId)
  const response = await http.post(`/preschool/settings/payments/payment-methods/${encodeURIComponent(methodId)}/archive`)
  const payload = unwrapApiData(response) || {}
  return normalizePaymentMethod(normalizeRecordResponse(response, ['payment_method', 'paymentMethod', 'data']) || payload)
}

export async function fetchBillingRules(options = {}) {
  const response = await http.get('/preschool/settings/payments/billing-rules', {
    signal: options.signal,
  })

  return normalizeListResponse(response, normalizeBillingRule)
}

export async function updateBillingRules(rules = []) {
  const response = await http.put('/preschool/settings/payments/billing-rules', buildBillingRulesPayload(rules))
  const payload = unwrapApiData(response) || {}
  const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.rules) ? payload.rules : []
  return items.map(normalizeBillingRule)
}
