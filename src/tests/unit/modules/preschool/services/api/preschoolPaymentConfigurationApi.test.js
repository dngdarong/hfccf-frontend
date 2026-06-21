import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
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

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
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

  it('fetches and updates payment settings with normalized payloads', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      settings: {
        id: 1,
        invoice_prefix: 'INV',
        receipt_prefix: 'RCT',
        next_invoice_number: 5,
        next_receipt_number: 7,
        late_fee_enabled: true,
        late_fee_type: 'fixed',
        late_fee_amount: 5,
        grace_period_days: 5,
        proration_enabled: false,
      },
    }))

    await expect(fetchPaymentSettings()).resolves.toMatchObject({
      invoicePrefix: 'INV',
      nextInvoiceNumber: 5,
      lateFeeType: 'fixed',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      settings: {
        invoice_prefix: 'INV2',
        receipt_prefix: 'RCT2',
        next_invoice_number: 6,
        next_receipt_number: 8,
      },
    }))

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

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/payments', expect.objectContaining({
      invoice_prefix: 'INV2',
      receipt_prefix: 'RCT2',
      next_invoice_number: 6,
      next_receipt_number: 8,
      late_fee_type: 'percentage',
      proration_enabled: true,
    }))
  })

  it('handles fee type and payment method CRUD endpoints', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, name: 'Registration Fee', code: 'registration_fee', default_amount: 25, is_required: true, is_active: true },
      ],
    }))

    await expect(fetchFeeTypes()).resolves.toMatchObject({
      items: [
        { id: 1, name: 'Registration Fee', code: 'registration_fee', defaultAmount: 25, isRequired: true },
      ],
    })

    http.post.mockResolvedValueOnce(stubResponse({
      fee_type: { id: 2, name: 'Activity Fee', code: 'activity_fee', default_amount: 10, is_required: false, is_active: true },
    }))
    await expect(createFeeType({ name: 'Activity Fee', code: 'activity_fee', defaultAmount: 10 })).resolves.toMatchObject({
      id: 2,
      name: 'Activity Fee',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      feeType: { id: 2, name: 'Activity Fee', code: 'activity_fee_2', default_amount: 12, is_required: false, is_active: true },
    }))
    await expect(updateFeeType(2, { name: 'Activity Fee', code: 'activity_fee_2', defaultAmount: 12 })).resolves.toMatchObject({
      id: 2,
      code: 'activity_fee_2',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      fee_type: { id: 2, name: 'Activity Fee', code: 'activity_fee_2', is_active: false, status: 'archived' },
    }))
    await expect(archiveFeeType(2)).resolves.toMatchObject({
      id: 2,
      status: 'archived',
    })

    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 3, name: 'Cash', code: 'cash', is_active: true },
      ],
    }))
    await expect(fetchPaymentMethods()).resolves.toMatchObject({
      items: [
        { id: 3, name: 'Cash', code: 'cash', isActive: true },
      ],
    })

    http.post.mockResolvedValueOnce(stubResponse({
      payment_method: { id: 4, name: 'Wing', code: 'wing', is_active: true },
    }))
    await expect(createPaymentMethod({ name: 'Wing', code: 'wing' })).resolves.toMatchObject({
      id: 4,
      name: 'Wing',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      paymentMethod: { id: 4, name: 'Wing Plus', code: 'wing_plus', is_active: true },
    }))
    await expect(updatePaymentMethod(4, { name: 'Wing Plus', code: 'wing_plus' })).resolves.toMatchObject({
      id: 4,
      code: 'wing_plus',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      payment_method: { id: 4, name: 'Wing Plus', code: 'wing_plus', is_active: false, status: 'archived' },
    }))
    await expect(archivePaymentMethod(4)).resolves.toMatchObject({
      id: 4,
      status: 'archived',
    })
  })

  it('fetches and updates billing rules payloads', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, rule_name: 'Grace Period', rule_code: 'grace_period_days', rule_value: '5', is_active: true },
      ],
    }))

    await expect(fetchBillingRules()).resolves.toMatchObject({
      items: [
        { ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '5', isActive: true },
      ],
    })

    http.put.mockResolvedValueOnce(stubResponse({
      rules: [
        { id: 1, rule_name: 'Grace Period', rule_code: 'grace_period_days', rule_value: '7', is_active: true },
      ],
    }))

    await expect(updateBillingRules([
      { ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '7', isActive: true },
    ])).resolves.toMatchObject([
      { ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '7' },
    ])

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/payments/billing-rules', {
      rules: [
        {
          rule_name: 'Grace Period',
          rule_code: 'grace_period_days',
          rule_value: '7',
          description: '',
          is_active: true,
        },
      ],
    })
  })
})
