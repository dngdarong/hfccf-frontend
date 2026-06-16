import { beforeEach, describe, expect, it } from 'vitest'
import { applyDocumentLocale, normalizeLocale } from '@/utils/documentLocale'

describe('documentLocale', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('lang')
    document.documentElement.classList.remove('locale-kh')
  })

  it('normalizes locale values safely', () => {
    expect(normalizeLocale('kh')).toBe('kh')
    expect(normalizeLocale('KH')).toBe('kh')
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale('fr')).toBe('en')
  })

  it('applies document language attributes', () => {
    applyDocumentLocale('kh')

    expect(document.documentElement.lang).toBe('kh')
    expect(document.documentElement.classList.contains('locale-kh')).toBe(true)

    applyDocumentLocale('en')

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.classList.contains('locale-kh')).toBe(false)
  })
})
