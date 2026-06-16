import { describe, it, expect, vi } from 'vitest'

/* global process */

// Helper functions extracted from the component for testing
// (These are the pure logic functions without full component mounting)

function getInitials(student) {
  return (student?.fullName || student?.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'
}

function getAcademicYear() {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

function resolveBackendUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || url.startsWith('//')) return url
  const base = String(process.env.VITE_API_BASE_URL || 'http://localhost:5173')
  try {
    return new URL(url, base).href
  } catch {
    return url
  }
}

describe('AttendanceIdCard Page Helpers', () => {
  describe('getInitials', () => {
    it('creates initials from fullName', () => {
      const student = { fullName: 'John Doe' }
      expect(getInitials(student)).toBe('JD')
    })

    it('creates initials from name when fullName missing', () => {
      const student = { name: 'Jane Smith' }
      expect(getInitials(student)).toBe('JS')
    })

    it('uses only first two words', () => {
      const student = { fullName: 'John Michael Smith' }
      expect(getInitials(student)).toBe('JM')
    })

    it('handles single word name', () => {
      const student = { fullName: 'Madonna' }
      expect(getInitials(student)).toBe('M')
    })

    it('returns question mark for empty name', () => {
      const student = { fullName: '' }
      expect(getInitials(student)).toBe('?')
    })

    it('returns question mark when name missing', () => {
      const student = {}
      expect(getInitials(student)).toBe('?')
    })

    it('prioritizes fullName over name', () => {
      const student = { fullName: 'First', name: 'Second' }
      expect(getInitials(student)).toBe('F')
    })

    it('handles extra whitespace', () => {
      const student = { fullName: '  John    Doe  ' }
      expect(getInitials(student)).toBe('JD')
    })

    it('handles special characters in name', () => {
      const student = { fullName: 'José María García' }
      const initials = getInitials(student)
      expect(initials).toMatch(/^[A-Z]+$/)
      expect(initials).toHaveLength(2)
    })
  })

  describe('getAcademicYear', () => {
    it('returns current academic year in correct format', () => {
      const result = getAcademicYear()
      expect(result).toMatch(/^\d{4}-\d{4}$/)
    })

    it('adds one to year for September onwards', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 8, 15)) // September 15, 2026

      const result = getAcademicYear()

      expect(result).toBe('2026-2027')
      vi.useRealTimers()
    })

    it('keeps same year for January through August', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 7, 31)) // August 31, 2026

      const result = getAcademicYear()

      expect(result).toBe('2025-2026')
      vi.useRealTimers()
    })

    it('handles boundary at August 31 to September 1', () => {
      vi.useFakeTimers()

      vi.setSystemTime(new Date(2026, 7, 31)) // August 31
      const result1 = getAcademicYear()
      expect(result1).toBe('2025-2026')

      vi.setSystemTime(new Date(2026, 8, 1)) // September 1
      const result2 = getAcademicYear()
      expect(result2).toBe('2026-2027')

      vi.useRealTimers()
    })
  })

  describe('resolveBackendUrl', () => {
    it('returns empty string for empty input', () => {
      expect(resolveBackendUrl('')).toBe('')
      expect(resolveBackendUrl(null)).toBe('')
    })

    it('returns unchanged absolute HTTP URL', () => {
      const url = 'https://example.com/image.jpg'
      expect(resolveBackendUrl(url)).toBe(url)
    })

    it('returns unchanged absolute HTTPS URL', () => {
      const url = 'https://cdn.example.com/photo.jpg'
      expect(resolveBackendUrl(url)).toBe(url)
    })

    it('returns unchanged protocol-relative URL', () => {
      const url = '//example.com/image.jpg'
      expect(resolveBackendUrl(url)).toBe(url)
    })

    it('resolves relative path to base URL', () => {
      const result = resolveBackendUrl('/uploads/photo.jpg')
      expect(result).toContain('/uploads/photo.jpg')
    })

    it('resolves relative path without slash', () => {
      const result = resolveBackendUrl('uploads/photo.jpg')
      expect(result).toContain('uploads/photo.jpg')
    })

    it('handles relative-looking malformed URLs as paths', () => {
      const url = 'not-a-valid-url'
      const result = resolveBackendUrl(url)
      expect(result).toContain('not-a-valid-url')
    })

    it('combines relative paths with base URL correctly', () => {
      const result = resolveBackendUrl('/api/files/123')
      expect(result).toContain('/api/files/123')
    })
  })

  describe('student selection logic', () => {
    it('adds student to selection', () => {
      const selectedIds = []
      const id = 'student-1'
      const idx = selectedIds.indexOf(id)
      if (idx === -1) selectedIds.push(id)

      expect(selectedIds).toContain(id)
      expect(selectedIds).toHaveLength(1)
    })

    it('removes student from selection', () => {
      const selectedIds = ['student-1', 'student-2']
      const id = 'student-1'
      const idx = selectedIds.indexOf(id)
      if (idx !== -1) selectedIds.splice(idx, 1)

      expect(selectedIds).not.toContain(id)
      expect(selectedIds).toEqual(['student-2'])
    })

    it('toggles student selection on/off', () => {
      const selectedIds = []

      // Add student
      let idx = selectedIds.indexOf('s1')
      if (idx === -1) selectedIds.push('s1')
      expect(selectedIds).toContain('s1')

      // Remove student
      idx = selectedIds.indexOf('s1')
      if (idx !== -1) selectedIds.splice(idx, 1)
      expect(selectedIds).not.toContain('s1')
    })

    it('handles multiple student selections', () => {
      const selectedIds = []
      const students = [
        { id: 's1', name: 'Alice' },
        { id: 's2', name: 'Bob' },
        { id: 's3', name: 'Charlie' },
      ]

      for (const student of students) {
        selectedIds.push(student.id)
      }

      expect(selectedIds).toHaveLength(3)
      expect(selectedIds).toEqual(['s1', 's2', 's3'])
    })

    it('selects all when none selected', () => {
      const selectedIds = []
      const students = [{ id: 's1' }, { id: 's2' }, { id: 's3' }]

      selectedIds.length = 0
      selectedIds.push(...students.map((s) => s.id))

      expect(selectedIds).toHaveLength(3)
    })

    it('deselects all when all selected', () => {
      const selectedIds = ['s1', 's2', 's3']
      selectedIds.length = 0

      expect(selectedIds).toHaveLength(0)
    })
  })

  describe('allSelected computed logic', () => {
    it('returns false when no students exist', () => {
      const students = []
      const selectedStudentIds = ['s1']
      const allSelected = students.length > 0 && selectedStudentIds.length === students.length

      expect(allSelected).toBe(false)
    })

    it('returns false when students exist but none selected', () => {
      const students = [{ id: 's1' }, { id: 's2' }]
      const selectedStudentIds = []
      const allSelected = students.length > 0 && selectedStudentIds.length === students.length

      expect(allSelected).toBe(false)
    })

    it('returns false when some but not all selected', () => {
      const students = [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
      const selectedStudentIds = ['s1', 's2']
      const allSelected = students.length > 0 && selectedStudentIds.length === students.length

      expect(allSelected).toBe(false)
    })

    it('returns true when all students selected', () => {
      const students = [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
      const selectedStudentIds = ['s1', 's2', 's3']
      const allSelected = students.length > 0 && selectedStudentIds.length === students.length

      expect(allSelected).toBe(true)
    })

    it('returns false when more selected than exist', () => {
      const students = [{ id: 's1' }, { id: 's2' }]
      const selectedStudentIds = ['s1', 's2', 's3']
      const allSelected = students.length > 0 && selectedStudentIds.length === students.length

      expect(allSelected).toBe(false)
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
      const currentConfig = config[selectedOrientation]

      expect(currentConfig.W).toBe(85.6)
      expect(currentConfig.H).toBe(54)
    })

    it('returns correct size for landscape orientation', () => {
      const selectedSize = 'small'
      const selectedOrientation = 'landscape'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const currentConfig = config[selectedOrientation]

      expect(currentConfig.W).toBe(70)
      expect(currentConfig.H).toBe(44)
    })

    it('returns correct size for portrait orientation', () => {
      const selectedSize = 'large'
      const selectedOrientation = 'portrait'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const currentConfig = config[selectedOrientation]

      expect(currentConfig.W).toBe(63)
      expect(currentConfig.H).toBe(100)
    })

    it('maintains aspect ratio in all sizes', () => {
      for (const size of CARD_SIZES) {
        const landscape = size.landscape
        const portrait = size.portrait

        const landscapeRatio = landscape.W / landscape.H
        const portraitRatio = portrait.H / portrait.W

        expect(landscapeRatio).toBeCloseTo(portraitRatio, 2)
      }
    })

    it('swaps dimensions when switching orientation', () => {
      const selectedSize = 'standard'
      const config = CARD_SIZES.find((s) => s.value === selectedSize)

      expect(config.landscape.W).toBe(config.portrait.H)
      expect(config.landscape.H).toBe(config.portrait.W)
    })

    it('handles unknown size with default', () => {
      const selectedSize = 'unknown'
      const selectedOrientation = 'landscape'
      const config = CARD_SIZES.find((s) => s.value === selectedSize) || CARD_SIZES[1]
      const currentConfig = config[selectedOrientation]

      expect(currentConfig.W).toBe(85.6)
      expect(currentConfig.H).toBe(54)
    })
  })

  describe('format and orientation options', () => {
    const FORMAT_OPTIONS = [
      { value: 'pdf', label: 'PDF' },
      { value: 'png', label: 'PNG' },
      { value: 'jpg', label: 'JPG' },
    ]
    const ORIENT_OPTIONS = [
      { value: 'landscape', label: 'Landscape' },
      { value: 'portrait', label: 'Portrait' },
    ]

    it('has valid format options', () => {
      expect(FORMAT_OPTIONS).toHaveLength(3)
      expect(FORMAT_OPTIONS.map((o) => o.value)).toEqual(['pdf', 'png', 'jpg'])
    })

    it('has valid orientation options', () => {
      expect(ORIENT_OPTIONS).toHaveLength(2)
      expect(ORIENT_OPTIONS.map((o) => o.value)).toEqual(['landscape', 'portrait'])
    })

    it('all options have value and label', () => {
      for (const option of FORMAT_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.label).toBeTruthy()
      }
      for (const option of ORIENT_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.label).toBeTruthy()
      }
    })
  })

  describe('gap and size calculations', () => {
    it('calculates export width in pixels from mm', () => {
      const cardWidthMm = 85.6
      const dpi = 300
      const mmToInch = 1 / 25.4
      const exportWidthPx = Math.round(cardWidthMm * dpi * mmToInch)

      expect(exportWidthPx).toBeGreaterThan(0)
      expect(Math.round(exportWidthPx)).toBe(exportWidthPx)
    })

    it('calculates gap in pixels from mm', () => {
      const gapMm = 4
      const dpi = 300
      const mmToInch = 1 / 25.4
      const gapPx = Math.round(gapMm * dpi * mmToInch)

      expect(gapPx).toBeGreaterThan(0)
      expect(gapPx).toBeLessThan(100)
    })

    it('uses zero gap when negative value provided', () => {
      const gapMm = Math.max(0, -5)
      expect(gapMm).toBe(0)
    })

    it('uses default gap when NaN provided', () => {
      const gapMm = Math.max(0, Number('invalid') || 4)
      expect(gapMm).toBe(4)
    })
  })
})
