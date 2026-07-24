import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import InvoiceDetail from '@/modules/preschool/admin/pages/payments/InvoiceDetail.vue'
import {
  cancelPreschoolInvoice,
  createPreschoolReceiptFromPayment,
  deletePreschoolInvoice,
  downloadPreschoolInvoiceExport,
  fetchPreschoolInvoice,
  issuePreschoolInvoice,
  printPreschoolInvoice,
  printPreschoolReceipt,
} from '@/modules/preschool/services/api/preschoolPaymentApi'

const pushMock = vi.hoisted(() => vi.fn())
const routeState = vi.hoisted(() => ({
  params: { id: '42' },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
    useRoute: () => routeState,
  }
})

vi.mock('@/modules/preschool/services/api/preschoolPaymentApi', () => ({
  cancelPreschoolInvoice: vi.fn(),
  createPreschoolReceiptFromPayment: vi.fn(),
  deletePreschoolInvoice: vi.fn(),
  downloadPreschoolInvoiceExport: vi.fn(),
  fetchPreschoolInvoice: vi.fn(),
  issuePreschoolInvoice: vi.fn(),
  printPreschoolInvoice: vi.fn(),
  printPreschoolReceipt: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    Button: {
      inheritAttrs: false,
      props: ['loading', 'disabled'],
      emits: ['click'],
      template: '<button v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
    },
    AlertSuccess: { template: '<div />' },
    AlertQuestion: {
      props: ['show', 'title', 'message', 'confirmText', 'cancelText'],
      emits: ['confirm', 'cancel'],
      template: `
        <div v-if="show">
          <button type="button" class="confirm-btn" @click="$emit('confirm')">{{ confirmText }}</button>
          <button type="button" class="cancel-btn" @click="$emit('cancel')">{{ cancelText }}</button>
        </div>
      `,
    },
  }
}

describe('InvoiceDetail', () => {
  const printWindow = {
    document: {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    },
    focus: vi.fn(),
  }

  beforeEach(() => {
    pushMock.mockReset()
    routeState.params.id = '42'
    fetchPreschoolInvoice.mockResolvedValue({
      id: 42,
      invoiceNumber: 'INV-20260716-0001',
      studentName: 'Alice Student',
      className: 'Class A1',
      issueDate: '2026-07-16',
      dueDate: '2026-07-30',
      totalAmount: 50,
      paidAmount: 25,
      balanceDue: 25,
      status: 'issued',
      items: [
        { id: 1, description: 'Registration fee', quantity: 1, unitPrice: 50, amount: 50 },
      ],
      payments: [
        {
          id: 9,
          paymentReference: 'PAY-001',
          amount: 25,
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          paidAt: '2026-07-16',
        },
      ],
      receipts: [
        {
          id: 3,
          paymentId: 9,
          receiptNumber: 'RCPT-001',
          issuedAt: '2026-07-16',
          amount: 25,
        },
      ],
    })
    issuePreschoolInvoice.mockResolvedValue({})
    cancelPreschoolInvoice.mockResolvedValue({})
    deletePreschoolInvoice.mockResolvedValue({})
    createPreschoolReceiptFromPayment.mockResolvedValue({ id: 10 })
    downloadPreschoolInvoiceExport.mockResolvedValue({ blob: new Blob(['x']), filename: 'invoice.pdf' })
    printPreschoolInvoice.mockResolvedValue('<html><body>Invoice</body></html>')
    printPreschoolReceipt.mockResolvedValue('<html><body>Receipt</body></html>')
    printWindow.document.open.mockReset()
    printWindow.document.write.mockReset()
    printWindow.document.close.mockReset()
    printWindow.focus.mockReset()
    window.open = vi.fn(() => printWindow)
  })

  it('renders invoice information with payment and receipt history details', async () => {
    const wrapper = mountWithPlugins(InvoiceDetail, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Invoice Information')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).toContain('Class A1')
    expect(wrapper.text()).toContain('Payment Summary')
    expect(wrapper.text()).toContain('PAY-001')
    expect(wrapper.text()).toContain('RCPT-001')
    expect(wrapper.text()).toContain('Receipt Summary')
    expect(wrapper.text()).toContain('Print Receipt')
  })

  it('shows only valid issued-invoice actions and routes add payment correctly', async () => {
    const wrapper = mountWithPlugins(InvoiceDetail, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Add Payment')
    expect(wrapper.text()).toContain('Cancel Invoice')
    expect(wrapper.text()).not.toContain('Issue Invoice')

    const addPaymentButton = wrapper.findAll('button').find((button) => button.text() === 'Add Payment')
    expect(addPaymentButton).toBeTruthy()
    await addPaymentButton.trigger('click')

    expect(pushMock).toHaveBeenCalledWith({
      name: 'dashboard-preschool-admin-payment',
      query: { invoiceId: 42 },
    })
  })

  it('opens printable invoice and receipt previews in a writable window', async () => {
    const wrapper = mountWithPlugins(InvoiceDetail, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const buttons = wrapper.findAll('button')
    const printInvoiceButton = buttons.find((button) => button.text() === 'Print Invoice')
    const printReceiptButton = buttons.find((button) => button.text() === 'Print Receipt')

    expect(printInvoiceButton).toBeTruthy()
    expect(printReceiptButton).toBeTruthy()

    await printInvoiceButton.trigger('click')
    await printReceiptButton.trigger('click')
    await flushPromises()

    expect(printPreschoolInvoice).toHaveBeenCalledWith(42)
    expect(printPreschoolReceipt).toHaveBeenCalledWith(3)
    expect(window.open).toHaveBeenNthCalledWith(1, '', '_blank')
    expect(window.open).toHaveBeenNthCalledWith(2, '', '_blank')
    expect(printWindow.document.open).toHaveBeenCalledTimes(2)
    expect(printWindow.document.write).toHaveBeenNthCalledWith(1, '<html><body>Invoice</body></html>')
    expect(printWindow.document.write).toHaveBeenNthCalledWith(2, '<html><body>Receipt</body></html>')
    expect(printWindow.document.close).toHaveBeenCalledTimes(2)
    expect(printWindow.focus).toHaveBeenCalledTimes(2)
  })

  it('shows a friendly error when the print popup is blocked', async () => {
    window.open = vi.fn(() => null)

    const wrapper = mountWithPlugins(InvoiceDetail, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const printInvoiceButton = wrapper.findAll('button').find((button) => button.text() === 'Print Invoice')
    expect(printInvoiceButton).toBeTruthy()
    await printInvoiceButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Invoice export failed.')
  })

  it('shows draft-only issue and delete actions', async () => {
    fetchPreschoolInvoice.mockResolvedValueOnce({
      id: 42,
      invoiceNumber: 'INV-20260716-0002',
      studentName: 'Alice Student',
      className: 'Class A1',
      issueDate: '2026-07-16',
      dueDate: '2026-07-30',
      totalAmount: 50,
      paidAmount: 0,
      balanceDue: 50,
      status: 'draft',
      items: [],
      payments: [],
      receipts: [],
    })

    const wrapper = mountWithPlugins(InvoiceDetail, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Issue Invoice')
    expect(wrapper.text()).toContain('common.delete')
    expect(wrapper.text()).not.toContain('Cancel Invoice')
    expect(wrapper.text()).not.toContain('Add Payment')
  })
})
