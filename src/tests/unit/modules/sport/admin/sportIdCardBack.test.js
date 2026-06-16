import { describe, it, expect, vi } from 'vitest'
import {
  buildBackQrDataUrl,
  getCoachName,
  getCoachPhone,
  getInitials,
  getCoachInitials,
} from '@/modules/sport/admin/pages/utilities/sportIdCardBack'

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,TEST_QR'),
  },
}))

describe('sportIdCardBack', () => {
  describe('buildBackQrDataUrl', () => {
    it('generates QR code from player data', async () => {
      const player = {
        publicId: 'P-001',
        coachName: 'Coach Name',
        coachPhone: '+855123456789',
      }

      const result = await buildBackQrDataUrl(player)

      expect(result).toBe('data:image/png;base64,TEST_QR')
    })

    it('uses correct QR settings', async () => {
      const QRCode = (await import('qrcode')).default
      const player = { id: '1', coachName: 'Test', coachPhone: '123' }

      await buildBackQrDataUrl(player)

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          scale: 6,
          color: { dark: '#1e40af', light: '#ffffff' },
        }),
      )
    })

    it('includes HFCCF-SPORT prefix in QR payload', async () => {
      const QRCode = (await import('qrcode')).default
      const player = { publicId: 'P-001', coachName: 'Coach', coachPhone: '555' }

      await buildBackQrDataUrl(player)

      const payload = QRCode.toDataURL.mock.calls[0][0]
      expect(payload).toContain('HFCCF-SPORT')
    })
  })

  // Language text is tested implicitly through component tests
  // getBackText() is an internal helper function used by components

  describe('getCoachName', () => {
    it('returns coachName when available', () => {
      const player = { coachName: 'Coach One' }
      expect(getCoachName(player)).toBe('Coach One')
    })

    it('falls back to coach_name snake_case', () => {
      const player = { coach_name: 'Coach Two' }
      expect(getCoachName(player)).toBe('Coach Two')
    })

    it('returns dash when missing', () => {
      expect(getCoachName({})).toBe('—')
    })

    it('prioritizes coachName over coach_name', () => {
      const player = { coachName: 'First', coach_name: 'Second' }
      expect(getCoachName(player)).toBe('First')
    })
  })

  describe('getCoachPhone', () => {
    it('returns coachPhone when available', () => {
      const player = { coachPhone: '+855123456789' }
      expect(getCoachPhone(player)).toBe('+855123456789')
    })

    it('falls back to coach_phone snake_case', () => {
      const player = { coach_phone: '987654321' }
      expect(getCoachPhone(player)).toBe('987654321')
    })

    it('returns dash when missing', () => {
      expect(getCoachPhone({})).toBe('—')
    })

    it('prioritizes coachPhone over coach_phone', () => {
      const player = { coachPhone: '+8551', coach_phone: '9876' }
      expect(getCoachPhone(player)).toBe('+8551')
    })
  })

  describe('getInitials', () => {
    it('creates initials from two-word name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('creates initial from single word', () => {
      expect(getInitials('Alice')).toBe('A')
    })

    it('uses only first two words', () => {
      expect(getInitials('John Michael Smith')).toBe('JM')
    })

    it('returns uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('returns question mark for empty name', () => {
      expect(getInitials('')).toBe('?')
    })

    it('returns dash character from dash input', () => {
      expect(getInitials('—')).toBe('—')
    })

    it('handles null and undefined', () => {
      expect(getInitials(null)).toBe('?')
      expect(getInitials(undefined)).toBe('?')
    })

    it('ignores extra spaces', () => {
      expect(getInitials('  John    Doe  ')).toBe('JD')
    })
  })

  describe('getCoachInitials', () => {
    it('creates initials from coach name', () => {
      const player = { coachName: 'John Doe' }
      expect(getCoachInitials(player)).toBe('JD')
    })

    it('returns question mark when coach is dash', () => {
      const player = {}
      expect(getCoachInitials(player)).toBe('?')
    })

    it('uses coach_name if coachName missing', () => {
      const player = { coach_name: 'Alice Smith' }
      expect(getCoachInitials(player)).toBe('AS')
    })

    it('handles dash-to-empty conversion', () => {
      const player = { coachName: '—' }
      expect(getCoachInitials(player)).toBe('?')
    })
  })
})
