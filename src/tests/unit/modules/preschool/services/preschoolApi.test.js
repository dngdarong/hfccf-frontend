import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import { createPreschoolPayment } from '@/modules/preschool/services/preschoolApi'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool payment api serialization', () => {
  it('omits invoice_id from the multipart payload when the main create flow uses quick invoice mode', async () => {
    http.post.mockResolvedValueOnce({ data: { data: {} } })

    await createPreschoolPayment({
      mode: 'quick_invoice',
      student_id: 1,
      class_id: 7,
      description: 'Registration fee',
      amount: 50,
      currency: 'USD',
      payment_method: 'cash',
      paid_at: '2026-07-16',
      issue_date: '2026-07-16',
      due_date: '2026-07-30',
      payment_reference: 'PAY-TEST-001',
      note: 'First payment',
      invoice_id: null,
    })

    expect(http.post).toHaveBeenCalledTimes(1)
    const [path, payload] = http.post.mock.calls[0]
    expect(path).toBe('/preschool/payments')
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.has('invoice_id')).toBe(false)
    expect(payload.get('mode')).toBe('quick_invoice')
    expect(payload.get('student_id')).toBe('1')
    expect(payload.get('class_id')).toBe('7')
    expect(payload.get('description')).toBe('Registration fee')
    expect(payload.get('amount')).toBe('50')
    expect(payload.get('payment_method')).toBe('cash')
    expect(payload.get('payment_reference')).toBe('PAY-TEST-001')
  })
})
