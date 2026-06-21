import { describe, expect, it } from 'vitest'
import enSport from '@/i18n/en/sport'
import khSport from '@/i18n/kh/sport'

function resolvePath(source, path) {
  return path.split('.').reduce((accumulator, segment) => accumulator?.[segment], source)
}

describe('sport coach management locale parity', () => {
  it('contains matching translation keys in en and kh', () => {
    const paths = [
      'sportCoachManagement.title',
      'sportCoachManagement.subtitle',
      'sportCoachManagement.addButton',
      'sportCoachManagement.addButtonCaption',
      'sportCoachManagement.searchPlaceholder',
      'sportCoachManagement.tableEmpty',
      'sportCoachManagement.toolbarEyebrow',
      'sportCoachManagement.toolbarSummary',
      'sportCoachManagement.visibleRange',
      'sportCoachManagement.noResults',
      'sportCoachManagement.activeRateLabel',
      'sportCoachManagement.resetPassword',
      'sportCoachManagement.resetPasswordTitle',
      'sportCoachManagement.resetPasswordDescription',
      'sportCoachManagement.passwordResetSuccess',
      'sportCoachManagement.newPassword',
      'sportCoachManagement.confirmPassword',
      'sportCoachManagement.reason',
      'sportCoachManagement.reasonPlaceholder',
      'sportCoachManagement.validation.passwordRequired',
      'sportCoachManagement.validation.confirmPasswordRequired',
      'sportCoachManagement.validation.passwordTooShort',
      'sportCoachManagement.validation.passwordMismatch',
      'sportCoachManagement.validation.reasonRequired',
    ]

    for (const path of paths) {
      expect(typeof resolvePath(enSport, path)).toBe('string')
      expect(typeof resolvePath(khSport, path)).toBe('string')
    }
  })
})
