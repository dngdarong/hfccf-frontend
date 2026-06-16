import { describe, it, expect, beforeEach } from 'vitest'
import { withI18nSetup } from '../../helpers/mount'
import { useLanguage } from '@/composables/useLanguage'

function setup(_locale = 'en') {
  return withI18nSetup(() => useLanguage(), {
    en: { greeting: 'Hello' },
    kh: { greeting: 'សួស្ដី' },
  })
}

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
    document.documentElement.classList.remove('locale-kh')
  })

  // ─── initial state ──────────────────────────────────────────────────────────

  it('exposes t, te, and tm functions', () => {
    const result = setup()
    expect(typeof result.t).toBe('function')
    expect(typeof result.te).toBe('function')
    expect(typeof result.tm).toBe('function')
  })

  it('defaults to EN language when locale is "en"', () => {
    const { language } = setup()
    expect(language.value).toBe('EN')
  })

  // ─── language switching ─────────────────────────────────────────────────────

  it('setLanguage("KH") switches language to KH', () => {
    const { language, setLanguage } = setup()
    setLanguage('KH')
    expect(language.value).toBe('KH')
  })

  it('setLanguage("EN") switches back from KH to EN', () => {
    const { language, setLanguage } = setup()
    setLanguage('KH')
    setLanguage('EN')
    expect(language.value).toBe('EN')
  })

  // ─── localStorage persistence ───────────────────────────────────────────────

  it('persists "kh" to localStorage when switching to KH', () => {
    const { setLanguage } = setup()
    setLanguage('KH')
    expect(localStorage.getItem('locale')).toBe('kh')
    expect(document.documentElement.lang).toBe('kh')
    expect(document.documentElement.classList.contains('locale-kh')).toBe(true)
  })

  it('persists "en" to localStorage when switching back to EN', () => {
    const { setLanguage } = setup()
    setLanguage('KH')
    setLanguage('EN')
    expect(localStorage.getItem('locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.classList.contains('locale-kh')).toBe(false)
  })

  // ─── case insensitivity ─────────────────────────────────────────────────────

  it('accepts lowercase "kh" as input', () => {
    const { language, setLanguage } = setup()
    setLanguage('kh')
    expect(language.value).toBe('KH')
  })

  it('treats unknown values as EN', () => {
    const { language, setLanguage } = setup()
    setLanguage('fr') // unsupported locale
    expect(language.value).toBe('EN')
    expect(localStorage.getItem('locale')).toBe('en')
  })

  // ─── i18n integration ───────────────────────────────────────────────────────

  it('t() translates a key in the current locale', () => {
    const { t } = setup()
    expect(t('greeting')).toBe('Hello')
  })

  it('te() returns true for an existing key', () => {
    const { te } = setup()
    expect(te('greeting')).toBe(true)
  })

  it('te() returns false for a missing key', () => {
    const { te } = setup()
    expect(te('nonexistent.key')).toBe(false)
  })
})
