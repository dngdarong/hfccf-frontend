import { describe, expect, it } from 'vitest'
import enDashboardPages from '@/i18n/en/dashboard/pages'
import khDashboardPages from '@/i18n/kh/dashboard/pages'

describe('profile security locale parity', () => {
  it('exposes the password mismatch hint in both EN and KH dashboard pages', () => {
    expect(enDashboardPages.profile.security.passwordMismatchHint).toBe('The new password and confirmation must match.')
    expect(khDashboardPages.profile.security.passwordMismatchHint).toBe('ពាក្យសម្ងាត់មិនដូចគ្នា។')
    expect(typeof enDashboardPages.profile.security.passwordMismatchHint).toBe('string')
    expect(typeof khDashboardPages.profile.security.passwordMismatchHint).toBe('string')
  })
})
