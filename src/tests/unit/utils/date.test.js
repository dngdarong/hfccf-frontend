import { describe, expect, it } from 'vitest'
import { normalizeDateForInput } from '@/utils/date'

describe('date utils', () => {
  it('normalizes ISO datetimes for date inputs', () => {
    expect(normalizeDateForInput('2026-06-17T00:00:00.000000Z')).toBe('2026-06-17')
    expect(normalizeDateForInput('2026-06-17')).toBe('2026-06-17')
  })

  it('returns an empty string for invalid input values', () => {
    expect(normalizeDateForInput('')).toBe('')
    expect(normalizeDateForInput(null)).toBe('')
    expect(normalizeDateForInput('not-a-date')).toBe('')
  })
})
