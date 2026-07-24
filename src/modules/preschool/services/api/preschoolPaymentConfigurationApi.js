const PAYMENT_SETTINGS_STORAGE_KEY = 'hfccf.preschool.payment-settings'
const FEE_TYPES_STORAGE_KEY = 'hfccf.preschool.payment-fee-types'
const PAYMENT_METHODS_STORAGE_KEY = 'hfccf.preschool.payment-methods'
const BILLING_RULES_STORAGE_KEY = 'hfccf.preschool.payment-billing-rules'

const DEFAULT_PAYMENT_SETTINGS = {
  invoicePrefix: 'INV',
  receiptPrefix: 'RCT',
  nextInvoiceNumber: 1,
  nextReceiptNumber: 1,
  lateFeeEnabled: true,
  lateFeeType: 'fixed',
  lateFeeAmount: 5,
  gracePeriodDays: 5,
  prorationEnabled: false,
}

const DEFAULT_BILLING_RULES = [
  {
    id: 'due_day_of_month',
    ruleName: 'Due Day',
    ruleCode: 'due_day_of_month',
    ruleValue: '1',
    description: '',
    isActive: true,
  },
  {
    id: 'grace_period_days',
    ruleName: 'Grace Period',
    ruleCode: 'grace_period_days',
    ruleValue: '5',
    description: '',
    isActive: true,
  },
  {
    id: 'invoice_generation_day',
    ruleName: 'Invoice Generation Day',
    ruleCode: 'invoice_generation_day',
    ruleValue: '1',
    description: '',
    isActive: true,
  },
  {
    id: 'late_fee_enabled',
    ruleName: 'Late Fee Enabled',
    ruleCode: 'late_fee_enabled',
    ruleValue: 'true',
    description: '',
    isActive: true,
  },
]

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

function readStoredJson(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback
    }

    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback

    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStoredJson(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures and keep the page usable.
  }
}

function cloneRows(rows = []) {
  return Array.isArray(rows) ? rows.map((row) => ({ ...row })) : []
}

function createEmptyListResponse(items = []) {
  return {
    items,
    pagination: {
      page: 1,
      perPage: Math.max(items.length, 1),
      total: items.length,
      totalPages: items.length ? 1 : 0,
    },
  }
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

export async function fetchPaymentSettings(options = {}) {
  void options.signal
  return normalizePaymentSettings(
    readStoredJson(PAYMENT_SETTINGS_STORAGE_KEY, DEFAULT_PAYMENT_SETTINGS),
  )
}

export async function updatePaymentSettings(settings = {}) {
  const payload = buildPaymentSettingsPayload(settings)
  const next = normalizePaymentSettings({
    ...DEFAULT_PAYMENT_SETTINGS,
    ...readStoredJson(PAYMENT_SETTINGS_STORAGE_KEY, DEFAULT_PAYMENT_SETTINGS),
    invoicePrefix: payload.invoice_prefix,
    receiptPrefix: payload.receipt_prefix,
    nextInvoiceNumber: payload.next_invoice_number,
    nextReceiptNumber: payload.next_receipt_number,
    lateFeeEnabled: payload.late_fee_enabled,
    lateFeeType: payload.late_fee_type,
    lateFeeAmount: payload.late_fee_amount,
    gracePeriodDays: payload.grace_period_days,
    prorationEnabled: payload.proration_enabled,
  })

  writeStoredJson(PAYMENT_SETTINGS_STORAGE_KEY, next)
  return next
}

export async function fetchFeeTypes(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(FEE_TYPES_STORAGE_KEY, [])),
  )
}

export async function createFeeType(feeType = {}) {
  const next = normalizeFeeType({
    id: resolveId(feeType) || Date.now().toString(),
    ...buildFeeTypePayload(feeType),
    status: normalizeBoolean(feeType.isActive ?? feeType.is_active, true) ? 'active' : 'archived',
  })

  const items = cloneRows(readStoredJson(FEE_TYPES_STORAGE_KEY, []))
  items.unshift(next)
  writeStoredJson(FEE_TYPES_STORAGE_KEY, items)
  return next
}

export async function updateFeeType(feeTypeOrId, feeType = {}) {
  const feeTypeId = resolveId(feeTypeOrId)
  const next = normalizeFeeType({
    id: feeTypeId,
    ...buildFeeTypePayload(feeType),
    status: normalizeBoolean(feeType.isActive ?? feeType.is_active, true) ? 'active' : 'archived',
  })

  const items = cloneRows(readStoredJson(FEE_TYPES_STORAGE_KEY, []))
  const index = items.findIndex((item) => String(item.id) === String(feeTypeId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(FEE_TYPES_STORAGE_KEY, items)
  return next
}

export async function archiveFeeType(feeTypeOrId) {
  const feeTypeId = resolveId(feeTypeOrId)
  const items = cloneRows(readStoredJson(FEE_TYPES_STORAGE_KEY, []))
  const index = items.findIndex((item) => String(item.id) === String(feeTypeId))
  if (index >= 0) {
    items[index] = normalizeFeeType({
      ...items[index],
      isActive: false,
      status: 'archived',
    })
    writeStoredJson(FEE_TYPES_STORAGE_KEY, items)
    return items[index]
  }

  return normalizeFeeType({ id: feeTypeId, isActive: false, status: 'archived' })
}

export async function fetchPaymentMethods(options = {}) {
  void options.signal
  return createEmptyListResponse(
    cloneRows(readStoredJson(PAYMENT_METHODS_STORAGE_KEY, [])),
  )
}

export async function createPaymentMethod(method = {}) {
  const next = normalizePaymentMethod({
    id: resolveId(method) || Date.now().toString(),
    ...buildPaymentMethodPayload(method),
    status: normalizeBoolean(method.isActive ?? method.is_active, true) ? 'active' : 'archived',
  })

  const items = cloneRows(readStoredJson(PAYMENT_METHODS_STORAGE_KEY, []))
  items.unshift(next)
  writeStoredJson(PAYMENT_METHODS_STORAGE_KEY, items)
  return next
}

export async function updatePaymentMethod(methodOrId, method = {}) {
  const methodId = resolveId(methodOrId)
  const next = normalizePaymentMethod({
    id: methodId,
    ...buildPaymentMethodPayload(method),
    status: normalizeBoolean(method.isActive ?? method.is_active, true) ? 'active' : 'archived',
  })

  const items = cloneRows(readStoredJson(PAYMENT_METHODS_STORAGE_KEY, []))
  const index = items.findIndex((item) => String(item.id) === String(methodId))
  if (index >= 0) {
    items.splice(index, 1, next)
  } else {
    items.unshift(next)
  }
  writeStoredJson(PAYMENT_METHODS_STORAGE_KEY, items)
  return next
}

export async function archivePaymentMethod(methodOrId) {
  const methodId = resolveId(methodOrId)
  const items = cloneRows(readStoredJson(PAYMENT_METHODS_STORAGE_KEY, []))
  const index = items.findIndex((item) => String(item.id) === String(methodId))
  if (index >= 0) {
    items[index] = normalizePaymentMethod({
      ...items[index],
      isActive: false,
      status: 'archived',
    })
    writeStoredJson(PAYMENT_METHODS_STORAGE_KEY, items)
    return items[index]
  }

  return normalizePaymentMethod({ id: methodId, isActive: false, status: 'archived' })
}

export async function fetchBillingRules(options = {}) {
  void options.signal
  const stored = readStoredJson(BILLING_RULES_STORAGE_KEY, DEFAULT_BILLING_RULES)
  return createEmptyListResponse(cloneRows(stored).map(normalizeBillingRule))
}

export async function updateBillingRules(rules = []) {
  const next = Array.isArray(rules) ? rules.map(normalizeBillingRule) : []
  writeStoredJson(BILLING_RULES_STORAGE_KEY, next)
  return next
}
