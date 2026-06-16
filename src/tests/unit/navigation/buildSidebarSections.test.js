import { describe, it, expect } from 'vitest'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import {
  makeSuperAdmin,
  makeAdminEnglish,
  makeAdminSport,
  makeCoach,
} from '../../helpers/factories'

// Pass-through translation function.
// resolveText() falls back to the key when t(key) === key, so labels
// in test assertions will be the raw labelKey string.
const t = (key) => key

/**
 * Minimal mock router. Only supports routeName-based items (not routeNameByDomain).
 * Pass an array of { name, path, meta? } to register known routes.
 */
function createMockRouter(routes = []) {
  const routeMap = new Map(routes.map((r) => [r.name, r]))

  return {
    hasRoute: (name) => routeMap.has(name),
    resolve: (target) => {
      if (!target?.name) return { path: '/', name: null, matched: [] }
      const route = routeMap.get(target.name)
      if (!route) return { path: '/:pathMatch(.*)*', name: undefined, matched: [] }
      return {
        path: route.path,
        name: target.name,
        matched: [{ path: route.path, meta: route.meta ?? {} }],
      }
    },
  }
}

// ─── Test fixture config ──────────────────────────────────────────────────────
// Covers the four access patterns we need to verify:
//   1. allowSuperAdmin: false  (main section – blocks super admin)
//   2. super_admin scope only  (super-admin section)
//   3. admin + domain filter   (english section)
//   4. mixed admin/staff + domain filter (sport section)

const config = {
  sections: [
    {
      id: 'main',
      labelKey: 'nav.main',
      access: { scopes: ['admin', 'staff'], allowSuperAdmin: false },
      items: [
        {
          id: 'dashboard-admin',
          labelKey: 'nav.dashboard',
          routeName: 'dashboard-admin',
          access: { scopes: ['admin'] },
        },
        {
          id: 'dashboard-staff',
          labelKey: 'nav.dashboard',
          routeName: 'dashboard-staff',
          access: { scopes: ['staff'] },
        },
      ],
    },
    {
      id: 'super-admin',
      labelKey: 'nav.super-admin',
      access: { scopes: ['super_admin'] },
      items: [
        {
          id: 'all-users',
          labelKey: 'nav.users',
          routeName: 'all-users',
          access: { scopes: ['super_admin'] },
        },
      ],
    },
    {
      id: 'english',
      labelKey: 'nav.english',
      access: { scopes: ['admin'], domains: ['english'] },
      items: [
        {
          id: 'english-classes',
          labelKey: 'nav.classes',
          routeName: 'english-classes',
          access: { scopes: ['admin'], domains: ['english'] },
        },
      ],
    },
    {
      id: 'sport',
      labelKey: 'nav.sport',
      access: { scopes: ['admin', 'staff'], domains: ['sport'] },
      items: [
        {
          id: 'sport-teams',
          labelKey: 'nav.teams',
          routeName: 'sport-teams',
          access: { scopes: ['admin'], domains: ['sport'] },
        },
        {
          id: 'sport-training',
          labelKey: 'nav.training',
          routeName: 'sport-training',
          access: { scopes: ['staff'], domains: ['sport'] },
        },
      ],
    },
  ],
}

const allRoutes = [
  { name: 'dashboard-admin', path: '/dashboard/admin' },
  { name: 'dashboard-staff', path: '/dashboard/staff' },
  { name: 'all-users', path: '/users' },
  { name: 'english-classes', path: '/english/classes' },
  { name: 'sport-teams', path: '/sport/teams' },
  { name: 'sport-training', path: '/sport/training' },
]

function buildFor(user, routes = allRoutes) {
  return buildSidebarSections({ config, router: createMockRouter(routes), user, t })
}

// ─── null / unauthenticated ───────────────────────────────────────────────────

describe('unauthenticated user', () => {
  it('returns empty sections', () => {
    expect(buildFor(null)).toEqual([])
  })
})

// ─── super admin ──────────────────────────────────────────────────────────────

describe('super admin', () => {
  it('sees the super-admin section', () => {
    const ids = buildFor(makeSuperAdmin()).map((s) => s.id)
    expect(ids).toContain('super-admin')
  })

  it('does not see sections with allowSuperAdmin: false', () => {
    const ids = buildFor(makeSuperAdmin()).map((s) => s.id)
    expect(ids).not.toContain('main')
  })
})

// ─── english admin ────────────────────────────────────────────────────────────

describe('english admin', () => {
  it('sees the main section and english section', () => {
    const ids = buildFor(makeAdminEnglish()).map((s) => s.id)
    expect(ids).toContain('main')
    expect(ids).toContain('english')
  })

  it('does not see sport or super-admin sections', () => {
    const ids = buildFor(makeAdminEnglish()).map((s) => s.id)
    expect(ids).not.toContain('sport')
    expect(ids).not.toContain('super-admin')
  })

  it('shows only the admin dashboard item (not the staff dashboard)', () => {
    const mainSection = buildFor(makeAdminEnglish()).find((s) => s.id === 'main')
    const itemIds = mainSection.items.map((item) => item.id)
    expect(itemIds).toContain('dashboard-admin')
    expect(itemIds).not.toContain('dashboard-staff')
  })
})

// ─── sport admin ──────────────────────────────────────────────────────────────

describe('sport admin', () => {
  it('sees sport section but not english section', () => {
    const ids = buildFor(makeAdminSport()).map((s) => s.id)
    expect(ids).toContain('sport')
    expect(ids).not.toContain('english')
  })

  it('sees admin-only sport items (teams) but not staff-only items (training)', () => {
    const sportSection = buildFor(makeAdminSport()).find((s) => s.id === 'sport')
    const itemIds = sportSection.items.map((item) => item.id)
    expect(itemIds).toContain('sport-teams')
    expect(itemIds).not.toContain('sport-training')
  })
})

// ─── sport coach (staff) ──────────────────────────────────────────────────────

describe('sport coach', () => {
  it('sees the sport section', () => {
    const sections = buildFor(makeCoach())
    expect(sections.find((s) => s.id === 'sport')).toBeDefined()
  })

  it('sees staff-only training item but not admin-only teams item', () => {
    const sportSection = buildFor(makeCoach()).find((s) => s.id === 'sport')
    const itemIds = sportSection.items.map((item) => item.id)
    expect(itemIds).toContain('sport-training')
    expect(itemIds).not.toContain('sport-teams')
  })
})

// ─── route resolution ─────────────────────────────────────────────────────────

describe('route resolution', () => {
  it('filters out all sections when no routes are registered', () => {
    expect(buildFor(makeAdminEnglish(), [])).toEqual([])
  })

  it('attaches resolved route target and path to the item', () => {
    const englishSection = buildFor(makeAdminEnglish()).find((s) => s.id === 'english')
    const classesItem = englishSection.items[0]
    expect(classesItem.to).toEqual({ name: 'english-classes' })
    expect(classesItem.routeName).toBe('english-classes')
    expect(classesItem.routePath).toBe('/english/classes')
  })

  it('filters out items whose route does not exist in the router', () => {
    // Register only one of the two english routes.
    const partialRoutes = [{ name: 'dashboard-admin', path: '/dashboard/admin' }]
    const sections = buildFor(makeAdminEnglish(), partialRoutes)
    const ids = sections.flatMap((s) => s.items.map((item) => item.id))
    expect(ids).not.toContain('english-classes')
  })
})
