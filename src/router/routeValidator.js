import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { ROLES, normalizeRole } from '@/constants/roles'

const validScopes = new Set(Object.values(ACCESS_SCOPES))
const validDomains = new Set(Object.values(DOMAINS))
const validRoles = new Set(Object.values(ROLES).map((role) => normalizeRole(role)))

function normalizeStringList(values = []) {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
}

function validateAccessRule(route, access, warnings) {
  const roleIssues = normalizeStringList(access.roles).filter((role) => !validRoles.has(role))
  const scopeIssues = normalizeStringList(access.scopes).filter((scope) => !validScopes.has(scope))
  const domainIssues = normalizeStringList(access.domains).filter((domain) => !validDomains.has(domain))

  if (roleIssues.length) {
    warnings.push(`invalid role(s): ${roleIssues.join(', ')}`)
  }

  if (scopeIssues.length) {
    warnings.push(`invalid scope(s): ${scopeIssues.join(', ')}`)
  }

  if (domainIssues.length) {
    warnings.push(`invalid domain(s): ${domainIssues.join(', ')}`)
  }

  if (access.requiresAuth && !route.meta?.access && !route.meta?.scopes && !route.meta?.domains && !route.meta?.roles) {
    warnings.push('requiresAuth is set but access metadata is missing')
  }
}

function walkRoutes(routes, callback, parentPath = '') {
  for (const route of Array.isArray(routes) ? routes : []) {
    callback(route, parentPath)

    if (Array.isArray(route.children) && route.children.length) {
      walkRoutes(route.children, callback, route.path || parentPath)
    }
  }
}

export function validateRouteConfig(routes) {
  if (!import.meta.env.DEV) return

  walkRoutes(routes, (route) => {
    if (!route || typeof route !== 'object') return

    const warnings = []
    const meta = route.meta || {}
    const access = meta.access

    if (meta.requiresAuth && !access && !meta.scopes && !meta.domains && !meta.roles) {
      warnings.push('requiresAuth is set but access metadata is missing')
    }

    if (access && typeof access === 'object') {
      validateAccessRule(route, access, warnings)
    }

    if (!warnings.length) return

    const routeLabel = route.name ? `${route.name} (${route.path || 'unknown path'})` : route.path || 'unknown route'
    console.warn(`[router] ${routeLabel} -> ${warnings.join('; ')}`)
  })
}
