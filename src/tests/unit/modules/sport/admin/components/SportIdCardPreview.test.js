import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SportIdCardPreview from '@/modules/sport/admin/components/SportIdCardPreview.vue'

const mountWithPlugins = (component, options = {}) => {
  return mount(component, {
    global: { stubs: { img: true } },
    ...options,
  })
}

describe('SportIdCardPreview', () => {
  describe('props defaults', () => {
    it('renders with minimal player data', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses landscape orientation by default', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('defaults to English text', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
    })

    it('defaults width to 300px', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.cardPx.width).toBe('300px')
    })
  })

  describe('player name resolution', () => {
    it('prefers fullName over name', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: {
            id: '1',
            name: 'Short',
            fullName: 'Full Player Name',
          },
        },
      })
      expect(wrapper.vm.name).toBe('Full Player Name')
    })

    it('falls back to name', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', name: 'John Doe' } },
      })
      expect(wrapper.vm.name).toBe('John Doe')
    })

    it('returns dash when both missing', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.name).toBe('—')
    })
  })

  describe('player ID resolution', () => {
    it('prioritizes publicId', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: {
            id: '1',
            playerCode: 'CODE-1',
            publicId: 'PUB-1',
          },
        },
      })
      expect(wrapper.vm.pid).toBe('PUB-1')
    })

    it('falls back to playerCode', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: {
            id: '1',
            playerCode: 'CODE-123',
          },
        },
      })
      expect(wrapper.vm.pid).toBe('CODE-123')
    })

    it('falls back to id', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '42' } },
      })
      expect(wrapper.vm.pid).toBe('42')
    })
  })

  describe('initials generation', () => {
    it('creates initials from full name', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', name: 'John Doe' } },
      })
      expect(wrapper.vm.initials).toBe('JD')
    })

    it('uses only first two words', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', name: 'John Michael Smith' } },
      })
      expect(wrapper.vm.initials).toBe('JM')
    })

    it('returns dash for empty name (name fallback resolves to dash)', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', name: '' } },
      })
      expect(wrapper.vm.initials).toBe('—')
    })

    it('returns dash when name missing', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.initials).toBe('—')
    })
  })

  describe('orientation', () => {
    it('detects portrait orientation', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(true)
    })

    it('sets portrait card width to 54mm', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardWmm).toBe(54)
    })

    it('sets landscape card width to 85.6mm', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.cardWmm).toBe(85.6)
    })
  })

  describe('gender handling', () => {
    it('shows gender badge when gender present', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1', gender: 'male' },
        },
      })
      expect(wrapper.vm.hasGender).toBe(true)
    })

    it('hides gender badge when gender missing', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.hasGender).toBe(false)
    })

    it('detects male gender', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', gender: 'male' } },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })

    it('detects female gender', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1', gender: 'female' } },
      })
      expect(wrapper.vm.isMale).toBe(false)
    })

    it('defaults to male when gender undefined', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })
  })

  describe('photo handling', () => {
    it('uses photoSrc prop when provided', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1', avatarUrl: 'avatar.jpg' },
          photoSrc: 'photo.jpg',
        },
      })
      expect(wrapper.vm.photoUrl).toBe('photo.jpg')
    })

    it('falls back to player.avatarUrl', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1', avatarUrl: 'avatar.jpg' },
        },
      })
      expect(wrapper.vm.photoUrl).toBe('avatar.jpg')
    })

    it('returns empty string when no photo available', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.photoUrl).toBe('')
    })
  })

  describe('card dimensions', () => {
    it('calculates ppm from width prop', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          width: 300,
        },
      })
      expect(wrapper.vm.ppm).toBeCloseTo(300 / 85.6)
    })

    it('maintains aspect ratio', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          width: 600,
          orientation: 'landscape',
        },
      })
      const width = parseFloat(wrapper.vm.cardPx.width)
      const height = parseFloat(wrapper.vm.cardPx.height)
      const ratio = width / height
      const expectedRatio = 85.6 / 54
      expect(ratio).toBeCloseTo(expectedRatio, 2)
    })
  })

  describe('language support', () => {
    it('renders English text by default', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: { player: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
      expect(wrapper.vm.T.badge).toBe('PLAYER ID CARD')
    })

    it('renders Khmer text when requested', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          lang: 'kh',
        },
      })
      expect(wrapper.vm.T.school).toBe('កីឡា HFCCF')
      expect(wrapper.vm.T.badge).toBe('បណ្ណសម្គាល់កីឡាករ')
    })

    it('defaults to English for unknown language', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          lang: 'fr',
        },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF SPORT')
    })
  })

  describe('prop reactivity', () => {
    it('updates initials when player name changes', async () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1', name: 'John Doe' },
        },
      })
      expect(wrapper.vm.initials).toBe('JD')

      await wrapper.setProps({
        player: { id: '1', name: 'Jane Smith' },
      })
      expect(wrapper.vm.initials).toBe('JS')
    })

    it('recalculates geometry when width changes', async () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          width: 300,
        },
      })
      const ppm1 = wrapper.vm.ppm

      await wrapper.setProps({ width: 600 })
      const ppm2 = wrapper.vm.ppm

      expect(ppm2).toBe(ppm1 * 2)
    })

    it('switches orientation', async () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: '1' },
          orientation: 'landscape',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(false)

      await wrapper.setProps({ orientation: 'portrait' })
      expect(wrapper.vm.isPortrait).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles undefined player fields', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: {
            id: '1',
            fullName: undefined,
            publicId: undefined,
            gender: undefined,
            avatarUrl: undefined,
          },
        },
      })
      expect(wrapper.vm.name).toBe('—')
      expect(wrapper.vm.pid).toBe('1')
      expect(wrapper.vm.hasGender).toBe(false)
      expect(wrapper.vm.photoUrl).toBe('')
    })

    it('handles numeric player ID (returns as-is)', () => {
      const wrapper = mountWithPlugins(SportIdCardPreview, {
        props: {
          player: { id: 1, publicId: 456 },
        },
      })
      expect(wrapper.vm.pid).toBe(456)
    })
  })
})
