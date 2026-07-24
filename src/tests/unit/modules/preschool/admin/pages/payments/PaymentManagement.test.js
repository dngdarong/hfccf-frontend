import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PaymentManagement from '@/modules/preschool/admin/pages/payments/PaymentManagement.vue'
import { normalizePayload } from '@/modules/preschool/admin/pages/payments/utils/paymentManagementHelpers'
import {
  createPreschoolPayment,
  deletePreschoolPayment,
  fetchPreschoolClasses,
  fetchPreschoolPayments,
  fetchPreschoolStudents,
  updatePreschoolPayment,
} from '@/modules/preschool/services/preschoolApi'
import {
  fetchPreschoolInvoice,
  fetchPreschoolStudentInvoices,
} from '@/modules/preschool/services/api/preschoolPaymentApi'
import {
  fetchPaymentMethods,
} from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolPayments: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
  createPreschoolPayment: vi.fn(),
  updatePreschoolPayment: vi.fn(),
  deletePreschoolPayment: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolPaymentApi', () => ({
  fetchPreschoolInvoice: vi.fn(),
  fetchPreschoolStudentInvoices: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolPaymentConfigurationApi', () => ({
  fetchPaymentMethods: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PaymentSummaryCards: { template: '<div />' },
    PaymentTable: { template: '<div />' },
    PaymentFilters: { template: '<div />' },
    PaymentToolbar: {
      props: ['eyebrow', 'title', 'clearLabel', 'addLabel'],
      emits: ['clear', 'add'],
      template: '<div><button type="button" @click="$emit(\'add\')">{{ addLabel }}</button><button type="button" @click="$emit(\'clear\')">{{ clearLabel }}</button></div>',
    },
    Pagination: { template: '<div />' },
    Dialog: {
      inheritAttrs: false,
      props: ['visible'],
      template: '<div v-if="visible" v-bind="$attrs"><slot /><slot name="footer" /></div>',
    },
    Button: {
      inheritAttrs: false,
      props: ['loading', 'disabled'],
      emits: ['click'],
      template: '<button v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
    },
    AlertQuestion: { template: '<div />' },
    AlertSuccess: { template: '<div />' },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  fetchPreschoolClasses.mockResolvedValue({
    items: [
      { id: 7, code: 'A1', name: 'Class A1', status: 'active' },
    ],
  })
  fetchPreschoolStudents.mockResolvedValue({
    items: [
      {
        id: 1,
        fullName: 'Alice Student',
        studentType: 'paying',
        classes: [{ id: 7, code: 'A1', name: 'Class A1', status: 'active' }],
      },
    ],
  })
  fetchPreschoolPayments.mockResolvedValue({ items: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 1 } })
  fetchPreschoolStudentInvoices.mockResolvedValue([
    {
      id: 11,
      studentId: 1,
      classId: 7,
      invoiceNumber: 'INV-20260716-0001',
      totalAmount: 50,
      paidAmount: 0,
      balanceDue: 50,
      totalAmountLabel: '50.00 USD',
      balanceDueLabel: '50.00 USD',
      dueDate: '2026-07-30',
      status: 'issued',
    },
  ])
  fetchPaymentMethods.mockResolvedValue({ items: [{ id: 1, name: 'Cash', code: 'cash' }] })
  createPreschoolPayment.mockResolvedValue({ id: 123 })
  updatePreschoolPayment.mockResolvedValue({ id: 99 })
  deletePreschoolPayment.mockResolvedValue({})
  fetchPreschoolInvoice.mockResolvedValue(null)
})

describe('PaymentManagement', () => {
  it('renders the automatic quick-invoice create form without mode or invoice selectors', async () => {
    const wrapper = mountWithPlugins(PaymentManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const createButton = wrapper.findAll('button').find((button) => button.text() === 'Create Payment')
    expect(createButton).toBeTruthy()
    await createButton.trigger('click')
    await flushPromises()

    expect(wrapper.find('#payment-mode').exists()).toBe(false)
    expect(wrapper.find('#payment-invoice-id').exists()).toBe(false)
    expect(wrapper.text()).toContain('Automatic billing')
    expect(wrapper.text()).toContain('Invoice, invoice item, payment, and receipt will be created automatically.')
    expect(wrapper.text()).toContain('Billing Description')

    await wrapper.find('#payment-student-id').setValue('1')
    await flushPromises()

    await wrapper.find('#payment-class-id').setValue('7')
    await wrapper.find('#payment-description').setValue('Registration fee')
    const amountInput = wrapper.find('#payment-amount')
    await amountInput.setValue('25')
    await wrapper.find('#payment-due-date').setValue('2026-07-30')
    await wrapper.find('#payment-paid-at').setValue('2026-07-16')
    await wrapper.find('#payment-reference').setValue('PAY-TEST-001')
    const payload = normalizePayload(wrapper.vm.$.setupState.form)
    expect(payload).toMatchObject({
      mode: 'quick_invoice',
      student_id: '1',
      invoice_id: null,
      class_id: 7,
      description: 'Registration fee',
      amount: 25,
      payment_method: 'cash',
      payment_status: 'paid',
      payment_reference: 'PAY-TEST-001',
    })

    const saveButton = wrapper.findAll('button').find((button) => button.text() === 'Save')
    expect(saveButton).toBeTruthy()
    await saveButton.trigger('click')
    await flushPromises()

    expect(createPreschoolPayment).toHaveBeenCalledTimes(1)
    expect(createPreschoolPayment.mock.calls[0][0]).toMatchObject({
      mode: 'quick_invoice',
      student_id: '1',
      invoice_id: null,
      class_id: 7,
      description: 'Registration fee',
      amount: 25,
      payment_method: 'cash',
      payment_status: 'paid',
      payment_reference: 'PAY-TEST-001',
    })
    expect(fetchPreschoolPayments).toHaveBeenCalledTimes(2)
    expect(fetchPreschoolInvoice).not.toHaveBeenCalled()
    expect(wrapper.vm.$.setupState.successMessage).toBe('Payment recorded successfully. Invoice created automatically. Receipt generated automatically.')
    expect(wrapper.vm.$.setupState.showSuccess).toBe(true)
  })

  it('maps backend validation errors onto the payment fields', async () => {
    createPreschoolPayment.mockRejectedValueOnce({
      response: {
        status: 422,
        data: {
          data: {
            errors: {
              amount: ['Amount exceeds the available balance.'],
            },
          },
        },
      },
    })

    const wrapper = mountWithPlugins(PaymentManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const createButton = wrapper.findAll('button').find((button) => button.text() === 'Create Payment')
    expect(createButton).toBeTruthy()
    await createButton.trigger('click')
    await flushPromises()

    await wrapper.find('#payment-student-id').setValue('1')
    await flushPromises()
    await wrapper.find('#payment-class-id').setValue('7')
    await wrapper.find('#payment-description').setValue('Registration fee')
    await wrapper.find('#payment-amount').setValue('25')
    await wrapper.find('#payment-due-date').setValue('2026-07-30')
    await wrapper.find('#payment-paid-at').setValue('2026-07-16')
    await wrapper.find('#payment-reference').setValue('PAY-TEST-001')

    const saveButton = wrapper.findAll('button').find((button) => button.text() === 'Save')
    expect(saveButton).toBeTruthy()
    await saveButton.trigger('click')
    await flushPromises()

    expect(createPreschoolPayment).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Amount exceeds the available balance.')
    expect(wrapper.vm.$.setupState.showSuccess).toBe(false)
    expect(wrapper.vm.$.setupState.errorMessage).toBe('Resolve the highlighted fields before saving.')
  })
})
