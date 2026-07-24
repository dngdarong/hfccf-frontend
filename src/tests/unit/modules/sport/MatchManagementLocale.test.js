import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

function collectKeys(source, prefix = '') {
  return Object.entries(source || {}).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value, path)
    }

    return [path]
  })
}

function collectStrings(source) {
  return Object.values(source || {}).flatMap((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectStrings(value)
    }

    return typeof value === 'string' ? [value] : []
  })
}

describe('match management locale parity', () => {
  it('keeps the sportMatchesManagement key structure identical in en and kh', () => {
    const enSection = enSport.sportMatchesManagement
    const khSection = khSport.sportMatchesManagement

    expect(collectKeys(enSection).sort()).toEqual(collectKeys(khSection).sort())
  })

  it('keeps draft status labels available in both locales', () => {
    expect(enSport.sportMatchesManagement.status.draft).toBe('Draft')
    expect(khSport.sportMatchesManagement.status.draft).toBe('ព្រាង')
  })

  it('does not contain unresolved question-mark placeholder runs in the match management bundle', () => {
    expect(collectStrings(enSport.sportMatchesManagement).some((value) => /\?{3,}/.test(value))).toBe(false)
    expect(collectStrings(khSport.sportMatchesManagement).some((value) => /\?{3,}/.test(value))).toBe(false)
  })
})
