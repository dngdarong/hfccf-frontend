import { describe, expect, it } from 'vitest'
import { getFormPayload, validateForm } from '@/modules/sport/admin/pages/forms/AddCoach/utils/addCoachHelpers'

describe('addCoachHelpers', () => {
  it('requires a full name with at least two parts for add validation', () => {
    const message = validateForm(
      {
        name: 'Coach',
        email: 'coach@example.com',
        phone: '012345678',
        status: 'active',
        password: 'coach-pass',
        confirmPassword: 'coach-pass',
      },
      true,
      (key: string) => key,
    )

    expect(message).toBe('sportAddCoach.validation.fullNameRequired')
  })

  it('omits password fields from edit payloads', () => {
    const payload = getFormPayload(
      {
        name: 'Coach One',
        email: 'coach.one@example.com',
        phone: '012345678',
        status: 'active',
        password: 'coach-pass',
        confirmPassword: 'coach-pass',
        profileImage: null,
      },
      false,
    )

    expect(payload).toEqual(
      expect.objectContaining({
        name: 'Coach One',
        email: 'coach.one@example.com',
        phone: '012345678',
        status: 'active',
      }),
    )
    expect(payload).not.toHaveProperty('password')
    expect(payload).not.toHaveProperty('confirmPassword')
  })

  it('does not require passwords for edit validation', () => {
    const message = validateForm(
      {
        name: 'Coach One',
        email: 'coach.one@example.com',
        phone: '012345678',
        status: 'active',
        password: '',
        confirmPassword: '',
      },
      false,
      (key: string) => key,
    )

    expect(message).toBe('')
  })
})
