import { vi, describe, it, expect, beforeEach } from 'vitest'
import http from '@/services/http'
import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  hasSessionExpired,
  isAuthenticated,
  logout,
  getAuthToken,
} from '@/services/auth'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

// ─── helpers ────────────────────────────────────────────────────────────────────

function stubSuccess(data) {
  return { data: { success: true, message: 'ok', data } }
}

function stubHttpError(message, status = 422) {
  return Object.assign(new Error(message), {
    response: { status, data: { message } },
  })
}

function stubNetworkError() {
  return Object.assign(new Error('Network Error'), {
    code: 'ERR_NETWORK',
    request: {},
  })
}

const TOKEN_KEY = 'hfccf-auth-token'
const ACTIVITY_KEY = 'hfccf-last-activity-at'

// ─── requestPasswordReset ────────────────────────────────────────────────────────

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when email is empty', async () => {
    await expect(requestPasswordReset('')).rejects.toThrow('Please enter your email address.')
    await expect(requestPasswordReset('  ')).rejects.toThrow('Please enter your email address.')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('normalizes email before posting', async () => {
    http.post.mockResolvedValueOnce(stubSuccess({ expiresAt: '2026-05-15T00:00:00Z' }))

    await requestPasswordReset('  Admin@Example.COM  ')

    expect(http.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'admin@example.com',
    })
  })

  it('returns unwrapped data on success', async () => {
    const payload = { expiresAt: '2026-05-15T10:00:00Z' }
    http.post.mockResolvedValueOnce(stubSuccess(payload))

    const result = await requestPasswordReset('user@example.com')
    expect(result).toEqual(payload)
  })

  it('wraps server error message from response.data.message', async () => {
    http.post.mockRejectedValueOnce(stubHttpError('Too many requests.', 429))

    await expect(requestPasswordReset('user@example.com')).rejects.toThrow('Too many requests.')
  })

  it('wraps network error with backend-unreachable message', async () => {
    http.post.mockRejectedValueOnce(stubNetworkError())

    await expect(requestPasswordReset('user@example.com')).rejects.toThrow(/backend API/)
  })

  it('falls back to default message when response has no message', async () => {
    // Plain object (no .message) so getApiErrorMessage reaches the fallback.
    http.post.mockRejectedValueOnce({ response: { status: 500, data: {} } })

    await expect(requestPasswordReset('user@example.com')).rejects.toThrow(
      'Unable to send reset code right now.',
    )
  })
})

// ─── verifyPasswordResetOtp ──────────────────────────────────────────────────────

describe('verifyPasswordResetOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when email is missing', async () => {
    await expect(verifyPasswordResetOtp({ email: '', code: '123456' })).rejects.toThrow(
      'Please enter a valid verification code.',
    )
    expect(http.post).not.toHaveBeenCalled()
  })

  it('throws when code is not 6 digits', async () => {
    await expect(verifyPasswordResetOtp({ email: 'u@x.com', code: '12345' })).rejects.toThrow(
      'Please enter a valid verification code.',
    )
    await expect(verifyPasswordResetOtp({ email: 'u@x.com', code: '' })).rejects.toThrow(
      'Please enter a valid verification code.',
    )
    expect(http.post).not.toHaveBeenCalled()
  })

  it('strips non-digits from code before posting', async () => {
    http.post.mockResolvedValueOnce(stubSuccess({ email: 'u@x.com', verifiedAt: null }))

    await verifyPasswordResetOtp({ email: 'u@x.com', code: '12 34 56' })

    expect(http.post).toHaveBeenCalledWith('/auth/verify-otp', {
      email: 'u@x.com',
      code: '123456',
    })
  })

  it('returns unwrapped data on success', async () => {
    const payload = { email: 'u@x.com', verifiedAt: '2026-05-15T10:00:00Z' }
    http.post.mockResolvedValueOnce(stubSuccess(payload))

    const result = await verifyPasswordResetOtp({ email: 'u@x.com', code: '123456' })
    expect(result).toEqual(payload)
  })

  it('wraps 422 server error as invalid/expired message', async () => {
    http.post.mockRejectedValueOnce(stubHttpError('Invalid OTP code.', 422))

    await expect(verifyPasswordResetOtp({ email: 'u@x.com', code: '000000' })).rejects.toThrow(
      'Invalid OTP code.',
    )
  })

  it('falls back to default message when server gives no message', async () => {
    http.post.mockRejectedValueOnce({ response: { status: 422, data: {} } })

    await expect(verifyPasswordResetOtp({ email: 'u@x.com', code: '000000' })).rejects.toThrow(
      'Invalid or expired verification code.',
    )
  })
})

// ─── resetPassword ────────────────────────────────────────────────────────────────

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when email is missing', async () => {
    await expect(
      resetPassword({ email: '', code: '123456', password: 'new-pass' }),
    ).rejects.toThrow('Please complete the password reset form.')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('throws when code is not 6 digits', async () => {
    await expect(
      resetPassword({ email: 'u@x.com', code: '12345', password: 'new-pass' }),
    ).rejects.toThrow('Please complete the password reset form.')
  })

  it('throws when password is missing', async () => {
    await expect(
      resetPassword({ email: 'u@x.com', code: '123456', password: '' }),
    ).rejects.toThrow('Please complete the password reset form.')
  })

  it('posts normalized values and uses password_confirmation fallback', async () => {
    http.post.mockResolvedValueOnce(stubSuccess(null))

    await resetPassword({ email: '  U@X.COM  ', code: '1 2 3 4 5 6', password: 'new-pass' })

    expect(http.post).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'u@x.com',
      code: '123456',
      password: 'new-pass',
      password_confirmation: 'new-pass',
    })
  })

  it('uses explicit password_confirmation when provided', async () => {
    http.post.mockResolvedValueOnce(stubSuccess(null))

    await resetPassword({
      email: 'u@x.com',
      code: '123456',
      password: 'new-pass',
      password_confirmation: 'new-pass',
    })

    expect(http.post).toHaveBeenCalledWith('/auth/reset-password', expect.objectContaining({
      password_confirmation: 'new-pass',
    }))
  })

  it('wraps server rejection with provided message', async () => {
    http.post.mockRejectedValueOnce(stubHttpError('Invalid OTP code.', 422))

    await expect(
      resetPassword({ email: 'u@x.com', code: '123456', password: 'new-pass' }),
    ).rejects.toThrow('Invalid OTP code.')
  })

  it('falls back to default message on empty server error', async () => {
    http.post.mockRejectedValueOnce({ response: { status: 500, data: {} } })

    await expect(
      resetPassword({ email: 'u@x.com', code: '123456', password: 'new-pass' }),
    ).rejects.toThrow('Unable to reset password right now.')
  })

  it('wraps network error with backend-unreachable message', async () => {
    http.post.mockRejectedValueOnce(stubNetworkError())

    await expect(
      resetPassword({ email: 'u@x.com', code: '123456', password: 'new-pass' }),
    ).rejects.toThrow(/backend API/)
  })
})

// ─── session expiry and token state ──────────────────────────────────────────────

describe('hasSessionExpired', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns false when not authenticated', () => {
    expect(hasSessionExpired()).toBe(false)
  })

  it('returns false and initializes activity when token exists but no activity timestamp', () => {
    localStorage.setItem(TOKEN_KEY, 'tok_abc')
    expect(hasSessionExpired()).toBe(false)
    expect(localStorage.getItem(ACTIVITY_KEY)).not.toBeNull()
  })

  it('returns false when last activity is within the inactivity window', () => {
    const now = Date.now()
    localStorage.setItem(TOKEN_KEY, 'tok_abc')
    localStorage.setItem(ACTIVITY_KEY, String(now - 60_000))
    expect(hasSessionExpired(now)).toBe(false)
  })

  it('returns true when last activity exceeds 12 hours', () => {
    const twelveHoursMs = 12 * 60 * 60 * 1000
    const now = Date.now()
    localStorage.setItem(TOKEN_KEY, 'tok_abc')
    localStorage.setItem(ACTIVITY_KEY, String(now - twelveHoursMs - 1))
    expect(hasSessionExpired(now)).toBe(true)
  })
})

// ─── logout clears all auth storage ──────────────────────────────────────────────

describe('logout', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('clears localStorage and sessionStorage auth keys by default', () => {
    localStorage.setItem(TOKEN_KEY, 'tok_abc')
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
    sessionStorage.setItem(TOKEN_KEY, 'tok_def')

    logout()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(ACTIVITY_KEY)).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('clears only sessionStorage when clearRemembered is false', () => {
    localStorage.setItem(TOKEN_KEY, 'tok_abc')
    sessionStorage.setItem(TOKEN_KEY, 'tok_def')

    logout({ clearRemembered: false })

    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok_abc')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})

// ─── getAuthToken reads from both storages ────────────────────────────────────────

describe('getAuthToken', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns token from localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'tok_local')
    expect(getAuthToken()).toBe('tok_local')
  })

  it('returns token from sessionStorage when localStorage has none', () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok_session')
    expect(getAuthToken()).toBe('tok_session')
  })

  it('returns empty string when no token exists', () => {
    expect(getAuthToken()).toBe('')
  })
})
