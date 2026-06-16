import { describe, it, expect, vi } from 'vitest'
import { buildBackQrDataUrl } from '@/modules/preschool/admin/pages/attendanceIdCardBack'

// Mock QRCode since it's an external library with DOM dependencies
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,TEST'),
  },
}))

describe('attendanceIdCardBack', () => {
  describe('buildBackQrDataUrl', () => {
    it('generates QR data URL from student data', async () => {
      const student = {
        publicId: 'STU-001',
        guardianName: 'John Doe',
        guardianPhone: '+855123456789',
      }

      const result = await buildBackQrDataUrl(student)

      expect(result).toBe('data:image/png;base64,TEST')
    })

    it('uses error correction level M and scale 6', async () => {
      const QRCode = (await import('qrcode')).default
      const student = { id: '1', guardianName: 'Test', guardianPhone: '123' }

      await buildBackQrDataUrl(student)

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          scale: 6,
        }),
      )
    })

    it('uses blue color for dark and white for light', async () => {
      const QRCode = (await import('qrcode')).default
      const student = { id: '1', guardianName: 'Test', guardianPhone: '123' }

      await buildBackQrDataUrl(student)

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          color: { dark: '#1e40af', light: '#ffffff' },
        }),
      )
    })

    it('accepts empty student object without crashing', async () => {
      const result = await buildBackQrDataUrl({})

      expect(result).toBe('data:image/png;base64,TEST')
    })
  })
})
