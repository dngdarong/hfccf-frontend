import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCurrentPermissions,
  hasPermission,
  isSuperAdmin,
  hasSessionExpired,
  login,
} from '@/services/auth'

// These match the private constants in auth.js.
// If they ever change the storage keys, these tests will catch the regression.
const TOKEN_KEY = 'hfccf-auth-token'
const ACTIVITY_KEY = 'hfccf-last-activity-at'
const INACTIVITY_MS = 12 * 60 * 60 * 1000

// ─── getCurrentPermissions ────────────────────────────────────────────────────

describe('getCurrentPermissions', () => {
  it('returns empty array for null user', () => {
    expect(getCurrentPermissions(null)).toEqual([])
  })

  it('returns empty array for non-object input', () => {
    expect(getCurrentPermissions('string')).toEqual([])
  })

  it('reads from the permissions array first', () => {
    const user = { permissions: ['students:view'], role_permission: ['other'] }
    expect(getCurrentPermissions(user)).toEqual(['students:view'])
  })

  it('falls back to role_permission when permissions is absent', () => {
    const user = { role_permission: ['students:edit'] }
    expect(getCurrentPermissions(user)).toEqual(['students:edit'])
  })

  it('falls back to role_permissions when both others are absent', () => {
    const user = { role_permissions: ['students:delete'] }
    expect(getCurrentPermissions(user)).toEqual(['students:delete'])
  })

  it('returns empty array when all permission fields are absent', () => {
    expect(getCurrentPermissions({ id: 1, email: 'a@b.com' })).toEqual([])
  })
})

// ─── hasPermission ────────────────────────────────────────────────────────────

describe('hasPermission', () => {
  it('returns false for user with no permissions', () => {
    expect(hasPermission('students:view', { permissions: [] })).toBe(false)
  })

  it('returns true when user has the exact permission', () => {
    expect(hasPermission('students:view', { permissions: ['students:view'] })).toBe(true)
  })

  it('returns true when user has the all:* wildcard', () => {
    expect(hasPermission('any:random:permission', { permissions: ['all:*'] })).toBe(true)
  })

  it('returns false when permission is not present', () => {
    expect(hasPermission('students:delete', { permissions: ['students:view'] })).toBe(false)
  })

  it('returns false for null user', () => {
    expect(hasPermission('students:view', null)).toBe(false)
  })
})

// ─── isSuperAdmin ─────────────────────────────────────────────────────────────

describe('isSuperAdmin', () => {
  it('returns true when user has the all:* wildcard', () => {
    expect(isSuperAdmin({ permissions: ['all:*'] })).toBe(true)
  })

  it('returns false for regular admin permissions', () => {
    expect(isSuperAdmin({ permissions: ['students:view', 'students:edit'] })).toBe(false)
  })

  it('returns false for empty permissions', () => {
    expect(isSuperAdmin({ permissions: [] })).toBe(false)
  })

  it('returns false for null user', () => {
    expect(isSuperAdmin(null)).toBe(false)
  })
})

// ─── hasSessionExpired ────────────────────────────────────────────────────────

describe('hasSessionExpired', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns false when not authenticated (no token)', () => {
    expect(hasSessionExpired()).toBe(false)
  })

  it('returns false when last activity is within the timeout window', () => {
    const now = Date.now()
    localStorage.setItem(TOKEN_KEY, 'test-token')
    localStorage.setItem(ACTIVITY_KEY, String(now - 1000)) // 1 second ago
    expect(hasSessionExpired(now)).toBe(false)
  })

  it('returns true when inactivity exceeded the 12-hour timeout', () => {
    const now = Date.now()
    localStorage.setItem(TOKEN_KEY, 'test-token')
    localStorage.setItem(ACTIVITY_KEY, String(now - INACTIVITY_MS - 1000))
    expect(hasSessionExpired(now)).toBe(true)
  })

  it('returns false and seeds activity when no last activity is stored', () => {
    const now = Date.now()
    localStorage.setItem(TOKEN_KEY, 'test-token')

    expect(hasSessionExpired(now)).toBe(false)

    // The call must persist the activity timestamp so a second call won't expire.
    const stored = Number(
      localStorage.getItem(ACTIVITY_KEY) || sessionStorage.getItem(ACTIVITY_KEY),
    )
    expect(stored).toBe(now)
  })
})

// ─── login – validation paths (before HTTP) ───────────────────────────────────

describe('login validation', () => {
  it('throws when email is empty', async () => {
    await expect(login({ email: '', password: 'secret' })).rejects.toThrow(
      'Please enter both email and password.',
    )
  })

  it('throws when password is empty', async () => {
    await expect(login({ email: 'user@example.com', password: '' })).rejects.toThrow(
      'Please enter both email and password.',
    )
  })

  it('throws when both email and password are empty', async () => {
    await expect(login({ email: '', password: '' })).rejects.toThrow(
      'Please enter both email and password.',
    )
  })

  it('throws when email is whitespace only', async () => {
    await expect(login({ email: '   ', password: 'secret' })).rejects.toThrow(
      'Please enter both email and password.',
    )
  })
})
