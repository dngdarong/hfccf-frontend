import { describe, expect, it } from 'vitest'
import enAssessment from '@/i18n/en/assessment'
import khAssessment from '@/i18n/kh/assessment'

function collectLeafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, val]) => {
    const full = prefix ? `${prefix}.${key}` : key
    return val && typeof val === 'object' ? collectLeafKeys(val, full) : [full]
  })
}

describe('assessment i18n locale', () => {
  const enKeys = collectLeafKeys(enAssessment)
  const khKeys = collectLeafKeys(khAssessment)

  it('en locale has no empty string values', () => {
    const empties = enKeys.filter((k) => {
      const parts = k.split('.')
      let cur = enAssessment
      for (const p of parts) cur = cur?.[p]
      return cur === ''
    })
    expect(empties).toEqual([])
  })

  it('kh locale has the same keys as en locale', () => {
    const enSet = new Set(enKeys)
    const khSet = new Set(khKeys)
    const missingInKh = enKeys.filter((k) => !khSet.has(k))
    const missingInEn = khKeys.filter((k) => !enSet.has(k))
    expect(missingInKh).toEqual([])
    expect(missingInEn).toEqual([])
  })

  it('form builder has all 19 question type keys in both locales', () => {
    const expectedTypes = [
      'short_text', 'long_text', 'number', 'date', 'radio', 'checkbox',
      'dropdown', 'multi_select', 'rating_scale', 'score_rubric', 'matrix',
      'dynamic_table', 'file_upload', 'image_upload', 'signature',
      'gps_location', 'calculated', 'conditional', 'repeating_group',
    ]
    for (const type of expectedTypes) {
      expect(enAssessment.formBuilder?.questionTypes?.[type]).toBeDefined()
      expect(khAssessment.formBuilder?.questionTypes?.[type]).toBeDefined()
    }
  })

  it('submissions locale has all 6 status keys', () => {
    const expectedStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'archived']
    for (const status of expectedStatuses) {
      expect(enAssessment.submissions?.statuses?.[status]).toBeDefined()
      expect(khAssessment.submissions?.statuses?.[status]).toBeDefined()
    }
  })
})
