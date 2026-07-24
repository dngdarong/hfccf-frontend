import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ReceiptView from '@/modules/preschool/admin/pages/payments/ReceiptView.vue'
import { fetchPreschoolReceipt, printPreschoolReceipt } from '@/modules/preschool/services/api/preschoolPaymentApi'

const routeState = vi.hoisted(() => ({
  params: { id: '3' },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => routeState,
    useRouter: () => ({
      push: vi.fn(),
    }),
  }
})

vi.mock('@/modules/preschool/services/api/preschoolPaymentApi', () => ({
  fetchPreschoolReceipt: vi.fn(),
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
  }
}

describe('ReceiptView', () => {
  const printWindow = {
    document: {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    },
    focus: vi.fn(),
  }

  beforeEach(() => {
    routeState.params.id = '3'
    fetchPreschoolReceipt.mockResolvedValue({
      id: 3,
      receiptNumber: 'RCPT-001',
      studentName: 'Alice Student',
      invoiceNumber: 'INV-20260716-0001',
      amount: 25,
      issuedAt: '2026-07-16',
      paymentMethod: 'cash',
      paymentReference: 'PAY-001',
      issuedBy: 'Admin',
      notes: '',
    })
    printPreschoolReceipt.mockResolvedValue('<html><body>Receipt</body></html>')
    printWindow.document.open.mockReset()
    printWindow.document.write.mockReset()
    printWindow.document.close.mockReset()
    printWindow.focus.mockReset()
    window.open = vi.fn(() => printWindow)
  })

  it('renders receipt preview and writes printable HTML into a writable window', async () => {
    const wrapper = mountWithPlugins(ReceiptView, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('RCPT-001')

    const printButton = wrapper.findAll('button').find((button) => button.text() === 'Print Receipt')
    expect(printButton).toBeTruthy()
    await printButton.trigger('click')
    await flushPromises()

    expect(printPreschoolReceipt).toHaveBeenCalledWith(3)
    expect(window.open).toHaveBeenCalledWith('', '_blank')
    expect(printWindow.document.open).toHaveBeenCalled()
    expect(printWindow.document.write).toHaveBeenCalledWith('<html><body>Receipt</body></html>')
    expect(printWindow.document.close).toHaveBeenCalled()
    expect(printWindow.focus).toHaveBeenCalled()
  })

  it('shows a friendly error when the print popup is blocked', async () => {
    window.open = vi.fn(() => null)

    const wrapper = mountWithPlugins(ReceiptView, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const printButton = wrapper.findAll('button').find((button) => button.text() === 'Print Receipt')
    expect(printButton).toBeTruthy()
    await printButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Invoice export failed.')
  })
})
