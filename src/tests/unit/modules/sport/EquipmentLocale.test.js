import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

function resolvePath(source, path) {
  return path.split('.').reduce((accumulator, segment) => accumulator?.[segment], source)
}

function collectLeafPaths(source, prefix = '') {
  if (!source || typeof source !== 'object') {
    return []
  }

  return Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectLeafPaths(value, path)
    }

    return [path]
  })
}

function collectStringValues(source) {
  if (!source || typeof source !== 'object') {
    return []
  }

  return Object.values(source).flatMap((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectStringValues(value)
    }

    return typeof value === 'string' ? [value] : []
  })
}

describe('sport equipment locale parity', () => {
  const requiredPaths = [
    'form.create.codeHint',
    'form.edit.codeHint',
    'summary.totalRequests',
  ]

  it('keeps the same sportEquipment key structure in en and kh', () => {
    expect(collectLeafPaths(enSport.sportEquipment)).toEqual(collectLeafPaths(khSport.sportEquipment))
  })

  it('exposes the verified code hint and total requests keys in both locales', () => {
    for (const path of requiredPaths) {
      expect(typeof resolvePath(enSport.sportEquipment, path)).toBe('string')
      expect(typeof resolvePath(khSport.sportEquipment, path)).toBe('string')
    }
  })

  it('does not use question-mark placeholders in the sport equipment copy', () => {
    expect(collectStringValues(enSport.sportEquipment).some((value) => value.includes('?'))).toBe(false)
    expect(collectStringValues(khSport.sportEquipment).some((value) => value.includes('?'))).toBe(false)
  })
})
