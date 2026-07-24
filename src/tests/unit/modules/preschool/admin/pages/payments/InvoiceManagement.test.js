import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import InvoiceManagement from '@/modules/preschool/admin/pages/payments/InvoiceManagement.vue'
import {
  cancelPreschoolInvoice,
  deletePreschoolInvoice,
  downloadPreschoolInvoiceExport,
  fetchPreschoolInvoices,
  printPreschoolInvoice,
} from '@/modules/preschool/services/api/preschoolPaymentApi'
import { fetchPreschoolClasses, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'

const pushMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: vi.fn(),
  fetchPreschoolStudents: vi.fn(),
}))

vi.mock('@/modules/preschool/services/api/preschoolPaymentApi', () => ({
  cancelPreschoolInvoice: vi.fn(),
  deletePreschoolInvoice: vi.fn(),
  downloadPreschoolInvoiceExport: vi.fn(),
  fetchPreschoolInvoices: vi.fn(),
  printPreschoolInvoice: vi.fn(),
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PaymentSummaryCards: { template: '<div />' },
    PaymentFilters: { template: '<div />' },
    PaymentToolbar: {
      props: ['eyebrow', 'title', 'clearLabel', 'addLabel'],
      emits: ['clear', 'add'],
      template: '<div><span class="toolbar-title">{{ title }}</span><button v-if="addLabel" type="button" class="add-btn" @click="$emit(\'add\')">{{ addLabel }}</button></div>',
    },
    Pagination: { template: '<div />' },
    AlertQuestion: { template: '<div />' },
    AlertSuccess: { template: '<div />' },
    InvoiceTable: {
      emits: ['view', 'delete', 'cancel', 'print', 'download-pdf', 'download-excel', 'add-payment'],
      template: `
        <div>
          <button type="button" class="row-add-payment" @click="$emit('add-payment', { id: 42, status: 'issued', balanceDue: 25 })">Add payment</button>
          <button type="button" class="row-print" @click="$emit('print', { id: 42 })">Print</button>
        </div>
      `,
    },
  }
}

describe('InvoiceManagement', () => {
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
    fetchPreschoolClasses.mockResolvedValue({
      items: [
        { id: 7, code: 'A1', name: 'Class A1', status: 'active' },
      ],
    })
    fetchPreschoolStudents.mockResolvedValue({
      items: [
        { id: 1, fullName: 'Alice Student', studentType: 'paying' },
      ],
    })
    fetchPreschoolInvoices.mockResolvedValue({
      items: [
        {
          id: 42,
          invoiceNumber: 'INV-20260716-0001',
          studentId: 1,
          classId: 7,
          totalAmount: 50,
          paidAmount: 25,
          balanceDue: 25,
          status: 'issued',
        },
      ],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })
    deletePreschoolInvoice.mockResolvedValue({})
    cancelPreschoolInvoice.mockResolvedValue({})
    downloadPreschoolInvoiceExport.mockResolvedValue({ blob: new Blob(['x']), filename: 'invoice.pdf' })
    printPreschoolInvoice.mockResolvedValue('<html><body>Invoice</body></html>')
    printWindow.document.open.mockReset()
    printWindow.document.write.mockReset()
    printWindow.document.close.mockReset()
    printWindow.focus.mockReset()
    window.open = vi.fn(() => printWindow)
  })

  it('keeps invoice management focused on administration instead of manual invoice creation', async () => {
    const wrapper = mountWithPlugins(InvoiceManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.find('.add-btn').exists()).toBe(false)
    expect(wrapper.find('#invoice-number').exists()).toBe(false)
    expect(wrapper.text()).toContain('Showing 1-1 of 1 invoice records')
  })

  it('routes add payment actions back to the primary payment flow', async () => {
    const wrapper = mountWithPlugins(InvoiceManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.find('.row-add-payment').trigger('click')
    await flushPromises()

    expect(pushMock).toHaveBeenCalledWith({
      name: 'dashboard-preschool-admin-payment',
      query: { invoiceId: 42 },
    })
  })

  it('supports printing invoices from the list actions', async () => {
    const wrapper = mountWithPlugins(InvoiceManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.find('.row-print').trigger('click')
    await flushPromises()

    expect(printPreschoolInvoice).toHaveBeenCalledWith(42)
    expect(window.open).toHaveBeenCalledWith('', '_blank')
    expect(printWindow.document.open).toHaveBeenCalled()
    expect(printWindow.document.write).toHaveBeenCalledWith('<html><body>Invoice</body></html>')
    expect(printWindow.document.close).toHaveBeenCalled()
    expect(printWindow.focus).toHaveBeenCalled()
  })

  it('shows a friendly error when the print popup is blocked', async () => {
    window.open = vi.fn(() => null)

    const wrapper = mountWithPlugins(InvoiceManagement, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.find('.row-print').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Invoice export failed.')
  })
})
