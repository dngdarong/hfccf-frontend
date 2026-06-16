import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IdCardBackPreview from '@/modules/preschool/admin/components/IdCardBackPreview.vue'

// Mock QRCode since it has DOM dependencies
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,TEST_QR'),
  },
}))

const mountWithPlugins = (component, options = {}) => {
  return mount(component, {
    global: { stubs: { img: true } },
    ...options,
  })
}

describe('IdCardBackPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('props defaults', () => {
    it('renders with minimal student data', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses landscape orientation by default', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('uses English text by default', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
    })

    it('defaults width to 300px', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.cardPx.width).toBe('300px')
    })
  })

  describe('guardian name resolution', () => {
    it('uses guardianName when available', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: 'Parent Name' },
        },
      })
      expect(wrapper.vm.guardianName).toBe('Parent Name')
    })

    it('falls back to guardian_name snake_case', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardian_name: 'Another Parent' },
        },
      })
      expect(wrapper.vm.guardianName).toBe('Another Parent')
    })

    it('returns dash when no guardian name', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.guardianName).toBe('—')
    })

    it('prioritizes guardianName over guardian_name', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: {
            id: '1',
            guardianName: 'First',
            guardian_name: 'Second',
          },
        },
      })
      expect(wrapper.vm.guardianName).toBe('First')
    })
  })

  describe('guardian phone resolution', () => {
    it('uses guardianPhone when available', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianPhone: '+855123456789' },
        },
      })
      expect(wrapper.vm.guardianPhone).toBe('+855123456789')
    })

    it('falls back to guardian_phone snake_case', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardian_phone: '987654321' },
        },
      })
      expect(wrapper.vm.guardianPhone).toBe('987654321')
    })

    it('returns dash when no phone', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.guardianPhone).toBe('—')
    })
  })

  describe('student name resolution', () => {
    it('prefers fullName', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: {
            id: '1',
            name: 'Short',
            fullName: 'Full Student Name',
          },
        },
      })
      expect(wrapper.vm.studentName).toBe('Full Student Name')
    })

    it('falls back to name', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', name: 'John Doe' },
        },
      })
      expect(wrapper.vm.studentName).toBe('John Doe')
    })

    it('returns dash when both missing', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.studentName).toBe('—')
    })
  })

  describe('student code resolution', () => {
    it('prioritizes publicId', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: {
            id: '1',
            studentCode: 'CODE-1',
            publicId: 'PUB-1',
          },
        },
      })
      expect(wrapper.vm.studentCode).toBe('PUB-1')
    })

    it('falls back to studentCode', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: {
            id: '1',
            studentCode: 'CODE-123',
          },
        },
      })
      expect(wrapper.vm.studentCode).toBe('CODE-123')
    })

    it('falls back to id', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '42' } },
      })
      expect(wrapper.vm.studentCode).toBe('42')
    })

    it('returns dash when all missing', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: {} },
      })
      expect(wrapper.vm.studentCode).toBe('—')
    })
  })

  describe('initials generation', () => {
    it('creates initials from guardian name', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: 'John Doe' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('JD')
    })

    it('uses only first two words', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: 'John Michael Smith' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('JM')
    })

    it('handles single word names', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: 'Madonna' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('M')
    })

    it('returns question mark for dash guardian name', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.guardianInitials).toBe('?')
    })

    it('returns dash for empty name which becomes question mark', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: '' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('?')
    })
  })

  describe('QR code generation', () => {
    it('generates QR code immediately with watch', async () => {
      const QRCode = (await import('qrcode')).default

      mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', publicId: 'STU-001', guardianPhone: '+855123456789' },
        },
      })

      await flushPromises()

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.stringContaining('STU-001'),
        expect.any(Object),
      )
    })

    it('uses provided qrDataUrl prop', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          qrDataUrl: 'data:image/png;custom',
        },
      })

      await flushPromises()

      expect(wrapper.vm.resolvedQrDataUrl).toBe('data:image/png;custom')
    })

    it('falls back to generated QR when prop empty', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', publicId: 'STU-001', guardianPhone: '555' },
          qrDataUrl: '',
        },
      })

      await flushPromises()

      expect(wrapper.vm.resolvedQrDataUrl).toBe('data:image/png;base64,TEST_QR')
    })

    it('regenerates QR when codeSeed changes', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', publicId: 'STU-001', guardianPhone: '+855123456789' },
        },
      })

      await flushPromises()
      const callCount1 = (await import('qrcode')).default.toDataURL.mock.calls.length

      await wrapper.setProps({
        student: { id: '1', publicId: 'STU-002', guardianPhone: '+855987654321' },
      })

      await flushPromises()
      const callCount2 = (await import('qrcode')).default.toDataURL.mock.calls.length

      expect(callCount2).toBeGreaterThan(callCount1)
    })

    it('uses error correction M and scale 6', async () => {
      const QRCode = (await import('qrcode')).default

      mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
        },
      })

      await flushPromises()

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          scale: 6,
        }),
      )
    })

    it('clears QR on generation error', async () => {
      const QRCode = (await import('qrcode')).default
      QRCode.toDataURL.mockRejectedValueOnce(new Error('QR error'))

      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
        },
      })

      await flushPromises()

      expect(wrapper.vm.qrDataUrlInternal).toBe('')
    })
  })

  describe('orientation', () => {
    it('detects portrait orientation', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(true)
    })

    it('defaults to landscape', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('sets portrait card width to 54mm', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardWmm).toBe(54)
    })

    it('sets landscape card width to 85.6mm', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.cardWmm).toBe(85.6)
    })
  })

  describe('language support', () => {
    it('renders English text by default', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
      expect(wrapper.vm.T.badge).toBe('GUARDIAN CARD')
    })

    it('renders Khmer text when lang="kh"', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          lang: 'kh',
        },
      })
      expect(wrapper.vm.T.badge).toBe('កាតអាណាព្យាបាល')
      expect(wrapper.vm.T.profile).toBe('ព័ត៌មានអាណាព្យាបាល')
    })

    it('defaults to English for unknown language', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          lang: 'fr',
        },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
    })
  })

  describe('card dimensions', () => {
    it('calculates ppm from width prop', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          width: 300,
        },
      })
      expect(wrapper.vm.ppm).toBeCloseTo(300 / 85.6)
    })

    it('recalculates height with orientation', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardHmm).toBe(85.6)
    })

    it('maintains aspect ratio', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          width: 600,
        },
      })
      const width = parseFloat(wrapper.vm.cardPx.width)
      const height = parseFloat(wrapper.vm.cardPx.height)
      const ratio = width / height
      const expectedRatio = 85.6 / 54
      expect(ratio).toBeCloseTo(expectedRatio, 2)
    })
  })

  describe('codeSeed computation', () => {
    it('combines student code and guardian phone', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', publicId: 'STU-001', guardianPhone: '+855123456789' },
        },
      })
      expect(wrapper.vm.codeSeed).toBe('STU-001-+855123456789')
    })

    it('uses dashes when data missing', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.codeSeed).toContain('—')
    })
  })

  describe('codeTitle computation', () => {
    it('creates title from student ID and phone labels', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          lang: 'en',
        },
      })
      expect(wrapper.vm.codeTitle).toContain('Student ID')
      expect(wrapper.vm.codeTitle).toContain('Guardian Phone')
    })
  })

  describe('prop reactivity', () => {
    it('updates initials when student name changes', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: 'John Doe' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('JD')

      await wrapper.setProps({
        student: { id: '1', guardianName: 'Jane Smith' },
      })
      expect(wrapper.vm.guardianInitials).toBe('JS')
    })

    it('recalculates geometry when width changes', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          width: 300,
        },
      })
      const ppm1 = wrapper.vm.ppm

      await wrapper.setProps({ width: 600 })
      const ppm2 = wrapper.vm.ppm

      expect(ppm2).toBe(ppm1 * 2)
    })

    it('updates language text', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1' },
          lang: 'en',
        },
      })
      expect(wrapper.vm.T.badge).toBe('GUARDIAN CARD')

      await wrapper.setProps({ lang: 'kh' })
      expect(wrapper.vm.T.badge).toBe('កាតអាណាព្យាបាល')
    })
  })

  describe('edge cases', () => {
    it('handles undefined student fields gracefully', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: {
            id: undefined,
            guardianName: undefined,
            guardianPhone: undefined,
            fullName: undefined,
            publicId: undefined,
          },
        },
      })
      expect(wrapper.vm.guardianName).toBe('—')
      expect(wrapper.vm.guardianPhone).toBe('—')
      expect(wrapper.vm.studentName).toBe('—')
      expect(wrapper.vm.studentCode).toBe('—')
    })

    it('handles numeric student IDs', () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: 123, publicId: 456 },
        },
      })
      expect(wrapper.vm.studentCode).toBe(456)
    })

    it('handles whitespace in names', async () => {
      const wrapper = mountWithPlugins(IdCardBackPreview, {
        props: {
          student: { id: '1', guardianName: '  John    Doe  ' },
        },
      })
      expect(wrapper.vm.guardianInitials).toBe('JD')
    })
  })
})
