import { describe, expect, it } from 'vitest'
import enCommon from '@/i18n/en/common'
import khCommon from '@/i18n/kh/common'

describe('shared common locale', () => {
  it('exposes the shared viewAll action in both locales', () => {
    expect(enCommon.actions.viewAll).toBeTruthy()
    expect(khCommon.actions.viewAll).toBeTruthy()
  })
})
