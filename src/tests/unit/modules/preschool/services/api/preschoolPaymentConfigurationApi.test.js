import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveFeeType,
  archivePaymentMethod,
  createFeeType,
  createPaymentMethod,
  fetchBillingRules,
  fetchFeeTypes,
  fetchPaymentMethods,
  fetchPaymentSettings,
  normalizeBillingRule,
  normalizeFeeType,
  normalizePaymentMethod,
  normalizePaymentSettings,
  updateBillingRules,
  updateFeeType,
  updatePaymentMethod,
  updatePaymentSettings,
} from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'

beforeEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe('preschool payment configuration api', () => {
  it('normalizes payment settings and record payloads', () => {
    expect(normalizePaymentSettings({
      invoice_prefix: 'INV',
      receipt_prefix: 'RCT',
      next_invoice_number: 7,
      next_receipt_number: 9,
      late_fee_enabled: true,
      late_fee_type: 'percentage',
      late_fee_amount: 5,
      grace_period_days: 4,
      proration_enabled: true,
    })).toMatchObject({
      invoicePrefix: 'INV',
      receiptPrefix: 'RCT',
      nextInvoiceNumber: 7,
      nextReceiptNumber: 9,
      lateFeeEnabled: true,
      lateFeeType: 'percentage',
      lateFeeAmount: 5,
      gracePeriodDays: 4,
      prorationEnabled: true,
    })

    expect(normalizeFeeType({
      name: 'Tuition Fee',
      code: 'tuition',
      default_amount: 120,
      is_required: true,
      is_active: true,
    })).toMatchObject({
      name: 'Tuition Fee',
      code: 'tuition',
      defaultAmount: 120,
      isRequired: true,
      isActive: true,
      status: 'active',
    })

    expect(normalizePaymentMethod({
      name: 'Cash',
      code: 'cash',
      is_active: true,
    })).toMatchObject({
      name: 'Cash',
      code: 'cash',
      isActive: true,
      status: 'active',
    })

    expect(normalizeBillingRule({
      rule_name: 'Grace Period',
      rule_code: 'grace_period_days',
      rule_value: '5',
      is_active: true,
    })).toMatchObject({
      ruleName: 'Grace Period',
      ruleCode: 'grace_period_days',
      ruleValue: '5',
      isActive: true,
    })
  })

  it('stores and reads payment settings locally', async () => {
    await expect(fetchPaymentSettings()).resolves.toMatchObject({
      invoicePrefix: 'INV',
      receiptPrefix: 'RCT',
      nextInvoiceNumber: 1,
      nextReceiptNumber: 1,
    })

    await expect(updatePaymentSettings({
      invoicePrefix: 'INV2',
      receiptPrefix: 'RCT2',
      nextInvoiceNumber: 6,
      nextReceiptNumber: 8,
      lateFeeEnabled: false,
      lateFeeType: 'percentage',
      lateFeeAmount: 10,
      gracePeriodDays: 7,
      prorationEnabled: true,
    })).resolves.toMatchObject({
      invoicePrefix: 'INV2',
      receiptPrefix: 'RCT2',
      nextInvoiceNumber: 6,
      nextReceiptNumber: 8,
    })

    await expect(fetchPaymentSettings()).resolves.toMatchObject({
      invoicePrefix: 'INV2',
      receiptPrefix: 'RCT2',
      nextInvoiceNumber: 6,
      nextReceiptNumber: 8,
      lateFeeType: 'percentage',
      prorationEnabled: true,
    })
  })

  it('stores fee types and payment methods locally', async () => {
    await expect(fetchFeeTypes()).resolves.toMatchObject({
      items: [],
    })

    await expect(createFeeType({ name: 'Activity Fee', code: 'activity_fee', defaultAmount: 10 })).resolves.toMatchObject({
      name: 'Activity Fee',
      code: 'activity_fee',
    })

    await expect(fetchFeeTypes()).resolves.toMatchObject({
      items: [
        { name: 'Activity Fee', code: 'activity_fee' },
      ],
    })

    await expect(updateFeeType('1', { name: 'Activity Fee Updated', code: 'activity_fee_2', defaultAmount: 12 })).resolves.toMatchObject({
      code: 'activity_fee_2',
    })

    await expect(archiveFeeType('1')).resolves.toMatchObject({
      status: 'archived',
    })

    await expect(fetchPaymentMethods()).resolves.toMatchObject({
      items: [],
    })

    await expect(createPaymentMethod({ name: 'Wing', code: 'wing' })).resolves.toMatchObject({
      name: 'Wing',
    })

    await expect(fetchPaymentMethods()).resolves.toMatchObject({
      items: [
        { name: 'Wing', code: 'wing' },
      ],
    })

    await expect(updatePaymentMethod('1', { name: 'Wing Plus', code: 'wing_plus' })).resolves.toMatchObject({
      code: 'wing_plus',
    })

    await expect(archivePaymentMethod('1')).resolves.toMatchObject({
      status: 'archived',
    })
  })

  it('stores billing rules locally', async () => {
    await expect(fetchBillingRules()).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ ruleName: 'Due Day' }),
        expect.objectContaining({ ruleName: 'Grace Period' }),
      ]),
    })

    await expect(updateBillingRules([
      { ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '7', isActive: true },
    ])).resolves.toMatchObject([
      { ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '7' },
    ])

    await expect(fetchBillingRules()).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '7' }),
      ]),
    })
  })
})
