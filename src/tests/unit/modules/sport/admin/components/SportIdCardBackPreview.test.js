import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SportIdCardBackPreview from '@/modules/sport/admin/components/SportIdCardBackPreview.vue'

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

describe('SportIdCardBackPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('props defaults', () => {
    it('renders with minimal player data', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses landscape orientation by default', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('defaults to English', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
    })

    it('defaults width to 300px', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.cardPx.width).toBe('300px')
    })
  })

  describe('coach info resolution', () => {
    it('uses coachName when available', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coachName: 'Coach One' } },
      })
      expect(wrapper.vm.coachName).toBe('Coach One')
    })

    it('falls back to coach_name', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coach_name: 'Coach Two' } },
      })
      expect(wrapper.vm.coachName).toBe('Coach Two')
    })

    it('returns dash when missing', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.coachName).toBe('—')
    })
  })

  describe('coach phone resolution', () => {
    it('uses coachPhone when available', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coachPhone: '+855123456789' } },
      })
      expect(wrapper.vm.coachPhone).toBe('+855123456789')
    })

    it('falls back to coach_phone', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coach_phone: '987654321' } },
      })
      expect(wrapper.vm.coachPhone).toBe('987654321')
    })

    it('returns dash when missing', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.coachPhone).toBe('—')
    })
  })

  describe('player info resolution', () => {
    it('prefers fullName', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: {
            id: '1',
            name: 'Short',
            fullName: 'Full Name',
          },
        },
      })
      expect(wrapper.vm.playerName).toBe('Full Name')
    })

    it('falls back to name', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', name: 'John Doe' } },
      })
      expect(wrapper.vm.playerName).toBe('John Doe')
    })

    it('returns dash when both missing', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.playerName).toBe('—')
    })
  })

  describe('player code resolution', () => {
    it('prioritizes publicId', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: {
            id: '1',
            playerCode: 'CODE-1',
            publicId: 'PUB-1',
          },
        },
      })
      expect(wrapper.vm.playerCode).toBe('PUB-1')
    })

    it('falls back to playerCode', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: {
            id: '1',
            playerCode: 'CODE-123',
          },
        },
      })
      expect(wrapper.vm.playerCode).toBe('CODE-123')
    })

    it('falls back to id', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '42' } },
      })
      expect(wrapper.vm.playerCode).toBe('42')
    })
  })

  describe('initials generation', () => {
    it('creates initials from coach name', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coachName: 'John Doe' } },
      })
      expect(wrapper.vm.coachInitials).toBe('JD')
    })

    it('uses coach_name if coachName missing', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1', coach_name: 'Alice Smith' } },
      })
      expect(wrapper.vm.coachInitials).toBe('AS')
    })

    it('returns dash when coach is missing (resolves to dash then initials)', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.coachInitials).toBe('?')
    })
  })

  describe('QR code generation', () => {
    it('generates QR code on mount with watch', async () => {
      const QRCode = (await import('qrcode')).default

      mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1', publicId: 'P-001', coachPhone: '+855123456789' },
        },
      })

      await flushPromises()

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.stringContaining('P-001'),
        expect.any(Object),
      )
    })

    it('uses provided qrDataUrl prop', async () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          qrDataUrl: 'data:image/png;custom',
        },
      })

      await flushPromises()

      expect(wrapper.vm.resolvedQrDataUrl).toBe('data:image/png;custom')
    })

    it('falls back to generated QR when prop empty', async () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1', publicId: 'P-001', coachPhone: '555' },
          qrDataUrl: '',
        },
      })

      await flushPromises()

      expect(wrapper.vm.resolvedQrDataUrl).toBe('data:image/png;base64,TEST_QR')
    })

    it('regenerates QR when codeSeed changes', async () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1', publicId: 'P-001', coachPhone: '+855123456789' },
        },
      })

      await flushPromises()
      const callCount1 = (await import('qrcode')).default.toDataURL.mock.calls.length

      await wrapper.setProps({
        player: { id: '1', publicId: 'P-002', coachPhone: '+855987654321' },
      })

      await flushPromises()
      const callCount2 = (await import('qrcode')).default.toDataURL.mock.calls.length

      expect(callCount2).toBeGreaterThan(callCount1)
    })

    it('clears QR on generation error', async () => {
      const QRCode = (await import('qrcode')).default
      QRCode.toDataURL.mockRejectedValueOnce(new Error('QR error'))

      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })

      await flushPromises()

      expect(wrapper.vm.qrDataUrlInternal).toBe('')
    })
  })

  describe('orientation', () => {
    it('detects portrait', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(true)
    })

    it('sets portrait width to 54mm', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardWmm).toBe(54)
    })

    it('sets landscape width to 85.6mm', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.cardWmm).toBe(85.6)
    })
  })

  describe('language support', () => {
    it('renders English by default', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
      expect(wrapper.vm.T.badge).toBe('COACH CARD')
    })

    it('renders Khmer when requested', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          lang: 'kh',
        },
      })
      expect(wrapper.vm.T.badge).toBe('កាតបាទ')
    })

    it('defaults to English for unknown language', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          lang: 'fr',
        },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
    })
  })

  describe('codeSeed computation', () => {
    it('combines player code and coach phone', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1', publicId: 'P-001', coachPhone: '+855123456789' },
        },
      })
      expect(wrapper.vm.codeSeed).toBe('P-001-+855123456789')
    })

    it('uses dashes when data missing', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.codeSeed).toContain('—')
    })
  })

  describe('prop reactivity', () => {
    it('updates initials when coach name changes', async () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1', coachName: 'John Doe' },
        },
      })
      expect(wrapper.vm.coachInitials).toBe('JD')

      await wrapper.setProps({
        player: { id: '1', coachName: 'Jane Smith' },
      })
      expect(wrapper.vm.coachInitials).toBe('JS')
    })

    it('updates language text', async () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: '1' },
          lang: 'en',
        },
      })
      expect(wrapper.vm.T.badge).toBe('COACH CARD')

      await wrapper.setProps({ lang: 'kh' })
      expect(wrapper.vm.T.badge).toBe('កាតបាទ')
    })
  })

  describe('edge cases', () => {
    it('handles undefined player fields', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: {
            id: undefined,
            coachName: undefined,
            coachPhone: undefined,
          },
        },
      })
      expect(wrapper.vm.coachName).toBe('—')
      expect(wrapper.vm.coachPhone).toBe('—')
    })

    it('handles numeric player ID', () => {
      const wrapper = mountWithPlugins(SportIdCardBackPreview, {
        props: {
          player: { id: 123, publicId: 456 },
        },
      })
      expect(wrapper.vm.playerCode).toBe(456)
    })
  })
})
