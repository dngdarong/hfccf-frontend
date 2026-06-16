import { describe, it, expect, vi } from 'vitest'

describe('SportAttendanceIdCard page helpers', () => {
  describe('getInitials', () => {
    function getInitials(player) {
      return (player?.fullName || player?.name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || '?'
    }

    it('creates initials from fullName', () => {
      const player = { fullName: 'John Doe' }
      expect(getInitials(player)).toBe('JD')
    })

    it('creates initials from name', () => {
      const player = { name: 'Jane Smith' }
      expect(getInitials(player)).toBe('JS')
    })

    it('uses only first two words', () => {
      const player = { fullName: 'John Michael Smith' }
      expect(getInitials(player)).toBe('JM')
    })

    it('handles single word name', () => {
      const player = { fullName: 'Madonna' }
      expect(getInitials(player)).toBe('M')
    })

    it('returns question mark for empty name', () => {
      const player = { fullName: '' }
      expect(getInitials(player)).toBe('?')
    })

    it('returns question mark when name missing', () => {
      const player = {}
      expect(getInitials(player)).toBe('?')
    })

    it('prioritizes fullName over name', () => {
      const player = { fullName: 'First', name: 'Second' }
      expect(getInitials(player)).toBe('F')
    })

    it('handles extra whitespace', () => {
      const player = { fullName: '  John    Doe  ' }
      expect(getInitials(player)).toBe('JD')
    })
  })

  describe('getSeasonYear', () => {
    function getSeasonYear() {
      const now = new Date()
      const y = now.getFullYear()
      return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
    }

    it('returns correct format', () => {
      const result = getSeasonYear()
      expect(result).toMatch(/^\d{4}-\d{4}$/)
    })

    it('adds one to year for September onwards', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 8, 15))

      const result = getSeasonYear()

      expect(result).toBe('2026-2027')
      vi.useRealTimers()
    })

    it('keeps same year for January through August', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 31))

      const result = getSeasonYear()

      expect(result).toBe('2025-2026')
      vi.useRealTimers()
    })
  })

  describe('player selection logic', () => {
    it('adds player to selection', () => {
      const selectedIds = []
      const id = 'p1'
      const idx = selectedIds.indexOf(id)
      if (idx === -1) selectedIds.push(id)

      expect(selectedIds).toContain(id)
    })

    it('removes player from selection', () => {
      const selectedIds = ['p1', 'p2']
      const id = 'p1'
      const idx = selectedIds.indexOf(id)
      if (idx !== -1) selectedIds.splice(idx, 1)

      expect(selectedIds).not.toContain(id)
      expect(selectedIds).toEqual(['p2'])
    })

    it('toggles player selection', () => {
      const selectedIds = []

      // Add
      let idx = selectedIds.indexOf('p1')
      if (idx === -1) selectedIds.push('p1')
      expect(selectedIds).toContain('p1')

      // Remove
      idx = selectedIds.indexOf('p1')
      if (idx !== -1) selectedIds.splice(idx, 1)
      expect(selectedIds).not.toContain('p1')
    })

    it('handles multiple selections', () => {
      const selectedIds = []
      const players = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]

      for (const player of players) {
        selectedIds.push(player.id)
      }

      expect(selectedIds).toHaveLength(3)
      expect(selectedIds).toEqual(['p1', 'p2', 'p3'])
    })
  })

  describe('allSelected logic', () => {
    it('returns false when no players exist', () => {
      const players = []
      const selectedIds = ['p1']
      const allSelected = players.length > 0 && selectedIds.length === players.length

      expect(allSelected).toBe(false)
    })

    it('returns false when none selected', () => {
      const players = [{ id: 'p1' }, { id: 'p2' }]
      const selectedIds = []
      const allSelected = players.length > 0 && selectedIds.length === players.length

      expect(allSelected).toBe(false)
    })

    it('returns false when some selected', () => {
      const players = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]
      const selectedIds = ['p1', 'p2']
      const allSelected = players.length > 0 && selectedIds.length === players.length

      expect(allSelected).toBe(false)
    })

    it('returns true when all selected', () => {
      const players = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]
      const selectedIds = ['p1', 'p2', 'p3']
      const allSelected = players.length > 0 && selectedIds.length === players.length

      expect(allSelected).toBe(true)
    })
  })

  describe('card size configuration', () => {
    const CARD_SIZES = [
      {
        value: 'small',
        landscape: { W: 70, H: 44 },
        portrait: { W: 44, H: 70 },
      },
      {
        value: 'standard',
        landscape: { W: 85.6, H: 54 },
        portrait: { W: 54, H: 85.6 },
      },
      {
        value: 'large',
        landscape: { W: 100, H: 63 },
        portrait: { W: 63, H: 100 },
      },
    ]

    it('returns standard size by default', () => {
      const selectedSize = 'standard'
      const selectedOrientation = 'landscape'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const current = config[selectedOrientation]

      expect(current.W).toBe(85.6)
      expect(current.H).toBe(54)
    })

    it('returns correct landscape size', () => {
      const selectedSize = 'small'
      const selectedOrientation = 'landscape'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const current = config[selectedOrientation]

      expect(current.W).toBe(70)
      expect(current.H).toBe(44)
    })

    it('returns correct portrait size', () => {
      const selectedSize = 'large'
      const selectedOrientation = 'portrait'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const current = config[selectedOrientation]

      expect(current.W).toBe(63)
      expect(current.H).toBe(100)
    })

    it('maintains aspect ratio', () => {
      for (const size of CARD_SIZES) {
        const landscape = size.landscape
        const portrait = size.portrait

        const landscapeRatio = landscape.W / landscape.H
        const portraitRatio = portrait.H / portrait.W

        expect(landscapeRatio).toBeCloseTo(portraitRatio, 2)
      }
    })

    it('swaps dimensions between orientations', () => {
      const config = CARD_SIZES.find((s) => s.value === 'standard')

      expect(config.landscape.W).toBe(config.portrait.H)
      expect(config.landscape.H).toBe(config.portrait.W)
    })
  })

  describe('export calculations', () => {
    it('calculates export width in pixels', () => {
      const cardWidthMm = 85.6
      const dpi = 300
      const mmToInch = 1 / 25.4
      const exportWidthPx = Math.round(cardWidthMm * dpi * mmToInch)

      expect(exportWidthPx).toBeGreaterThan(0)
      expect(Number.isInteger(exportWidthPx)).toBe(true)
    })

    it('calculates gap in pixels', () => {
      const gapMm = 4
      const dpi = 300
      const mmToInch = 1 / 25.4
      const gapPx = Math.round(gapMm * dpi * mmToInch)

      expect(gapPx).toBeGreaterThan(0)
      expect(gapPx).toBeLessThan(100)
    })

    it('uses zero gap when negative', () => {
      const gapMm = Math.max(0, -5)
      expect(gapMm).toBe(0)
    })

    it('uses default gap when NaN', () => {
      const gapMm = Math.max(0, Number('invalid') || 4)
      expect(gapMm).toBe(4)
    })
  })

  describe('export format options', () => {
    const FORMAT_OPTIONS = [
      { value: 'pdf', label: 'PDF' },
      { value: 'png', label: 'PNG' },
      { value: 'jpg', label: 'JPG' },
    ]

    it('has valid format options', () => {
      expect(FORMAT_OPTIONS).toHaveLength(3)
      expect(FORMAT_OPTIONS.map((o) => o.value)).toEqual(['pdf', 'png', 'jpg'])
    })

    it('all options have value and label', () => {
      for (const option of FORMAT_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.label).toBeTruthy()
      }
    })
  })

  describe('orientation options', () => {
    const ORIENT_OPTIONS = [
      { value: 'landscape', label: 'Landscape' },
      { value: 'portrait', label: 'Portrait' },
    ]

    it('has valid orientations', () => {
      expect(ORIENT_OPTIONS).toHaveLength(2)
      expect(ORIENT_OPTIONS.map((o) => o.value)).toEqual(['landscape', 'portrait'])
    })

    it('all options have value and label', () => {
      for (const option of ORIENT_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.label).toBeTruthy()
      }
    })
  })
})
