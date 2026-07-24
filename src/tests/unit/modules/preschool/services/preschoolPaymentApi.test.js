import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import { downloadPreschoolInvoiceExport } from '@/modules/preschool/services/api/preschoolPaymentApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool payment api export helpers', () => {
  it('parses invoice export filenames from the response headers', async () => {
    http.get.mockResolvedValueOnce({
      data: new Blob(['pdf']),
      headers: {
        'content-disposition': 'attachment; filename="preschool-invoice-INV-20260716-0001.pdf"',
        'content-type': 'application/pdf',
      },
    })

    await expect(downloadPreschoolInvoiceExport(7, 'pdf')).resolves.toMatchObject({
      filename: 'preschool-invoice-INV-20260716-0001.pdf',
      mimeType: 'application/pdf',
    })

    expect(http.get).toHaveBeenCalledWith(
      '/preschool/invoices/7/download',
      expect.objectContaining({
        params: { format: 'pdf' },
        responseType: 'blob',
      }),
    )
  })
})
