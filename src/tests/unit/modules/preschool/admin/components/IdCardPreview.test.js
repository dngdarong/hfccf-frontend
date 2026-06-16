import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IdCardPreview from '@/modules/preschool/admin/components/IdCardPreview.vue'

const mountWithPlugins = (component, options = {}) => {
  return mount(component, {
    global: { stubs: { img: true } },
    ...options,
  })
}

describe('IdCardPreview', () => {
  describe('props defaults', () => {
    it('renders with minimal student data', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses landscape orientation by default', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('uses English text by default', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
    })

    it('defaults width to 300px', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.cardPx.width).toBe('300px')
    })
  })

  describe('student name resolution', () => {
    it('prefers fullName over name', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: {
            id: '1',
            name: 'Short Name',
            fullName: 'Full Student Name',
          },
        },
      })
      expect(wrapper.vm.name).toBe('Full Student Name')
    })

    it('falls back to name when fullName missing', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1', name: 'John Doe' } },
      })
      expect(wrapper.vm.name).toBe('John Doe')
    })

    it('returns dash when both name and fullName missing', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.name).toBe('—')
    })
  })

  describe('student ID resolution', () => {
    it('prioritizes publicId', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: {
            id: '1',
            studentCode: 'CODE-1',
            publicId: 'PUB-1',
          },
        },
      })
      expect(wrapper.vm.sid).toBe('PUB-1')
    })

    it('falls back to studentCode', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: {
            id: '1',
            studentCode: 'CODE-123',
          },
        },
      })
      expect(wrapper.vm.sid).toBe('CODE-123')
    })

    it('falls back to id as last resort', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '42' } },
      })
      expect(wrapper.vm.sid).toBe('42')
    })

    it('returns dash when all ID fields missing', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: {} },
      })
      expect(wrapper.vm.sid).toBe('—')
    })
  })

  describe('initials generation', () => {
    it('creates initials from full name', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', name: 'John Doe' },
        },
      })
      expect(wrapper.vm.initials).toBe('JD')
    })

    it('uses only first two words', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', name: 'John Michael Smith' },
        },
      })
      expect(wrapper.vm.initials).toBe('JM')
    })

    it('handles single word names', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', name: 'Madonna' },
        },
      })
      expect(wrapper.vm.initials).toBe('M')
    })

    it('returns dash for empty name', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1', name: '' } },
      })
      expect(wrapper.vm.initials).toBe('—')
    })

    it('returns dash when name missing', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.initials).toBe('—')
    })
  })

  describe('orientation', () => {
    it('detects portrait orientation', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(true)
    })

    it('returns landscape as default', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.isPortrait).toBe(false)
    })

    it('sets portrait card width to 54mm', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardWmm).toBe(54)
    })

    it('sets landscape card width to 85.6mm', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.cardWmm).toBe(85.6)
    })
  })

  describe('gender handling', () => {
    it('shows gender badge when gender present', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', gender: 'male' },
        },
      })
      expect(wrapper.vm.hasGender).toBe(true)
    })

    it('hides gender badge when gender missing', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.hasGender).toBe(false)
    })

    it('detects male gender from "male"', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', gender: 'male' },
        },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })

    it('detects male from "MALE" case-insensitive', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', gender: 'MALE' },
        },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })

    it('detects male from "M" prefix', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', gender: 'M' },
        },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })

    it('treats non-male genders as female', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', gender: 'female' },
        },
      })
      expect(wrapper.vm.isMale).toBe(false)
    })

    it('defaults to male when gender undefined', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
        },
      })
      expect(wrapper.vm.isMale).toBe(true)
    })
  })

  describe('photo handling', () => {
    it('uses photoSrc prop when provided', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', avatarUrl: 'avatar.jpg' },
          photoSrc: 'photo.jpg',
        },
      })
      expect(wrapper.vm.photoUrl).toBe('photo.jpg')
    })

    it('falls back to student.avatarUrl', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', avatarUrl: 'avatar.jpg' },
        },
      })
      expect(wrapper.vm.photoUrl).toBe('avatar.jpg')
    })

    it('returns empty string when no photo available', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.photoUrl).toBe('')
    })
  })

  describe('card dimensions', () => {
    it('calculates ppm (pixels per mm) from width prop', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          width: 300,
        },
      })
      expect(wrapper.vm.ppm).toBeCloseTo(300 / 85.6)
    })

    it('calculates portrait height correctly', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          orientation: 'portrait',
        },
      })
      expect(wrapper.vm.cardHmm).toBe(85.6)
    })

    it('calculates landscape height correctly', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          orientation: 'landscape',
        },
      })
      expect(wrapper.vm.cardHmm).toBe(54)
    })
  })

  describe('language support', () => {
    it('renders English text by default', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: { student: { id: '1' } },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
      expect(wrapper.vm.T.badge).toBe('STUDENT ID CARD')
      expect(wrapper.vm.T.male).toBe('MALE')
    })

    it('renders Khmer text when lang prop set', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          lang: 'kh',
        },
      })
      expect(wrapper.vm.T.school).toBe('សាលាមត្តេយ្យ HFCCF')
      expect(wrapper.vm.T.badge).toBe('អត្តសញ្ញាណបណ្ណ')
      expect(wrapper.vm.T.male).toBe('ប្រុស')
    })

    it('defaults to English for unknown language', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          lang: 'fr',
        },
      })
      expect(wrapper.vm.T.school).toBe('HFCCF PRESCHOOL')
    })
  })

  describe('prop reactivity', () => {
    it('updates initials when student name changes', async () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', name: 'John Doe' },
        },
      })
      expect(wrapper.vm.initials).toBe('JD')

      await wrapper.setProps({
        student: { id: '1', name: 'Jane Smith' },
      })
      expect(wrapper.vm.initials).toBe('JS')
    })

    it('recalculates geometry when width prop changes', async () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
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

    it('switches orientation when prop changes', async () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
          orientation: 'landscape',
        },
      })
      expect(wrapper.vm.isPortrait).toBe(false)

      await wrapper.setProps({ orientation: 'portrait' })
      expect(wrapper.vm.isPortrait).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles student object with undefined fields', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: {
            id: '1',
            fullName: undefined,
            publicId: undefined,
            gender: undefined,
            avatarUrl: undefined,
          },
        },
      })
      expect(wrapper.vm.name).toBe('—')
      expect(wrapper.vm.sid).toBe('1')
      expect(wrapper.vm.hasGender).toBe(false)
      expect(wrapper.vm.photoUrl).toBe('')
    })

    it('handles names with extra whitespace', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1', name: '  John    Doe  ' },
        },
      })
      expect(wrapper.vm.initials).toMatch(/^[A-Z]+$/)
    })

    it('handles numeric student ID', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: 123, publicId: 456 },
        },
      })
      expect(wrapper.vm.sid).toBe(456)
    })

    it('maintains aspect ratio in custom widths', () => {
      const wrapper = mountWithPlugins(IdCardPreview, {
        props: {
          student: { id: '1' },
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
})
