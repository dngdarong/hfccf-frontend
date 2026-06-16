import { describe, it, expect } from 'vitest'
import {
  normalizeAccessRule,
  getAccessProfile,
  canAccess,
  canAccessRoute,
  getSidebarToneClass,
} from '@/services/accessControl'
import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import {
  makeUser,
  makeSuperAdmin,
  makeAdminEnglish,
  makeAdminSport,
  makeCoach,
} from '../../helpers/factories'

// ─── normalizeAccessRule ──────────────────────────────────────────────────────

describe('normalizeAccessRule', () => {
  it('returns safe defaults for empty input', () => {
    const rule = normalizeAccessRule()
    expect(rule.requiresAuth).toBe(true)
    expect(rule.allowSuperAdmin).toBe(true)
    expect(rule.domains).toEqual([])
    expect(rule.scopes).toEqual([])
    expect(rule.roles).toEqual([])
    expect(rule.permissions).toEqual([])
  })

  it('normalizes string lists to lowercase trimmed arrays', () => {
    const rule = normalizeAccessRule({ scopes: [' Admin ', 'STAFF'], domains: ['English'] })
    expect(rule.scopes).toEqual(['admin', 'staff'])
    expect(rule.domains).toEqual(['english'])
  })

  it('preserves requiresAuth: false when explicitly set', () => {
    expect(normalizeAccessRule({ requiresAuth: false }).requiresAuth).toBe(false)
  })

  it('preserves allowSuperAdmin: false when explicitly set', () => {
    expect(normalizeAccessRule({ allowSuperAdmin: false }).allowSuperAdmin).toBe(false)
  })

  it('ignores non-array values for list fields', () => {
    const rule = normalizeAccessRule({ scopes: 'admin', roles: null, permissions: 42 })
    expect(rule.scopes).toEqual([])
    expect(rule.roles).toEqual([])
    expect(rule.permissions).toEqual([])
  })

  it('filters empty strings from list fields', () => {
    const rule = normalizeAccessRule({ scopes: ['admin', '', '  '] })
    expect(rule.scopes).toEqual(['admin'])
  })
})

// ─── getAccessProfile ─────────────────────────────────────────────────────────

describe('getAccessProfile', () => {
  it('extracts scope and domain for super admin', () => {
    const profile = getAccessProfile(makeSuperAdmin())
    expect(profile.scope).toBe(ACCESS_SCOPES.SUPER_ADMIN)
    expect(profile.domain).toBe(DOMAINS.GLOBAL)
    expect(profile.isSuperAdmin).toBe(true)
  })

  it('extracts scope and domain for english admin', () => {
    const profile = getAccessProfile(makeAdminEnglish())
    expect(profile.scope).toBe(ACCESS_SCOPES.ADMIN)
    expect(profile.domain).toBe(DOMAINS.ENGLISH)
    expect(profile.isSuperAdmin).toBe(false)
  })

  it('extracts scope and domain for sport coach', () => {
    const profile = getAccessProfile(makeCoach())
    expect(profile.scope).toBe(ACCESS_SCOPES.STAFF)
    expect(profile.domain).toBe(DOMAINS.SPORT)
  })

  it('marks isAuthenticated true for any user object', () => {
    expect(getAccessProfile(makeUser()).isAuthenticated).toBe(true)
  })

  it('marks isAuthenticated false for null', () => {
    expect(getAccessProfile(null).isAuthenticated).toBe(false)
  })
})

// ─── canAccess ────────────────────────────────────────────────────────────────

describe('canAccess', () => {
  it('allows access to public routes regardless of user', () => {
    expect(canAccess(null, { requiresAuth: false })).toBe(true)
    expect(canAccess(makeAdminEnglish(), { requiresAuth: false })).toBe(true)
  })

  it('denies access when no user and route requires auth', () => {
    expect(canAccess(null, {})).toBe(false)
    expect(canAccess(null, { requiresAuth: true })).toBe(false)
  })

  it('denies access when user has no scope', () => {
    const user = makeUser({ role: '', scope: '', domain: '' })
    expect(canAccess(user, {})).toBe(false)
  })

  it('grants super admin access when allowSuperAdmin is true (default)', () => {
    expect(canAccess(makeSuperAdmin(), {})).toBe(true)
  })

  it('denies super admin when allowSuperAdmin is explicitly false', () => {
    expect(canAccess(makeSuperAdmin(), { allowSuperAdmin: false })).toBe(false)
  })

  it('allows admin user matching required scope', () => {
    expect(canAccess(makeAdminEnglish(), { scopes: ['admin'] })).toBe(true)
  })

  it('denies staff user when scope requires admin', () => {
    expect(canAccess(makeCoach(), { scopes: ['admin'] })).toBe(false)
  })

  it('allows user matching required domain', () => {
    expect(canAccess(makeAdminEnglish(), { scopes: ['admin'], domains: ['english'] })).toBe(true)
  })

  it('denies user with wrong domain', () => {
    expect(canAccess(makeAdminEnglish(), { scopes: ['admin'], domains: ['sport'] })).toBe(false)
  })

  it('checks permissions - passes when user has the required permission', () => {
    const user = makeAdminEnglish({ permissions: ['students:view'], role_permission: ['students:view'] })
    expect(canAccess(user, { permissions: ['students:view'] })).toBe(true)
  })

  it('checks permissions - fails when user lacks the required permission', () => {
    expect(canAccess(makeAdminEnglish(), { permissions: ['students:delete'] })).toBe(false)
  })

  it('super admin passes permission check via wildcard', () => {
    expect(canAccess(makeSuperAdmin(), { permissions: ['any:permission'] })).toBe(true)
  })
})

// ─── canAccessRoute ───────────────────────────────────────────────────────────

describe('canAccessRoute', () => {
  it('allows access when no matched records carry access meta', () => {
    const route = { matched: [{ meta: {} }, { meta: {} }] }
    expect(canAccessRoute(makeAdminEnglish(), route)).toBe(true)
  })

  it('denies access when any matched record fails the check', () => {
    const route = {
      matched: [
        { meta: { access: { scopes: ['admin'] } } },
        { meta: { access: { scopes: ['super_admin'] } } },
      ],
    }
    expect(canAccessRoute(makeAdminEnglish(), route)).toBe(false)
  })

  it('handles meta.requiresAuth without an access object', () => {
    const route = { matched: [{ meta: { requiresAuth: true } }] }
    expect(canAccessRoute(null, route)).toBe(false)
    expect(canAccessRoute(makeAdminEnglish(), route)).toBe(true)
  })

  it('returns true for null or empty route (no restrictions)', () => {
    expect(canAccessRoute(makeAdminEnglish(), null)).toBe(true)
    expect(canAccessRoute(makeAdminEnglish(), {})).toBe(true)
  })
})

// ─── getSidebarToneClass ──────────────────────────────────────────────────────

describe('getSidebarToneClass', () => {
  it('returns super-admin class for super admin', () => {
    expect(getSidebarToneClass(makeSuperAdmin())).toBe('sidebar-shell--super-admin')
  })

  it('returns english class for english admin', () => {
    expect(getSidebarToneClass(makeAdminEnglish())).toBe('sidebar-shell--english')
  })

  it('returns sport class for sport admin', () => {
    expect(getSidebarToneClass(makeAdminSport())).toBe('sidebar-shell--sport')
  })

  it('returns sport class for coach', () => {
    expect(getSidebarToneClass(makeCoach())).toBe('sidebar-shell--sport')
  })

  it('falls back to english class for unknown domain', () => {
    expect(getSidebarToneClass(makeUser({ domain: 'unknown_domain', role: '' }))).toBe(
      'sidebar-shell--english',
    )
  })
})
