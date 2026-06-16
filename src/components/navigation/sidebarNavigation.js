import { canAccess, getAccessProfile } from '@/services/accessControl'

function resolveText(t, key, fallback = '') {
  if (!key) return fallback

  const value = typeof t === 'function' ? t(key) : ''

  return value && value !== key ? value : fallback || key
}

function resolveItemTarget(item, profile) {
  if (item.routeName) {
    return { name: item.routeName }
  }

  const routeNameByDomain = item.routeNameByDomain || {}
  const routeName = routeNameByDomain[profile.domain] || routeNameByDomain.default

  if (routeName) {
    return { name: routeName }
  }

  if (item.to) {
    return { path: item.to }
  }

  return null
}

function resolveRouteRecord(router, target) {
  if (!router || !target) return null

  if (target.name && !router.hasRoute(target.name)) {
    return null
  }

  try {
    const resolved = router.resolve(target)
    const record = resolved.matched[resolved.matched.length - 1]

    if (!record) return null
    if (!target.name && record.path === '/:pathMatch(.*)*') return null

    return {
      target,
      path: resolved.path,
      name: resolved.name ? String(resolved.name) : '',
      meta: record.meta || {},
    }
  } catch (error) {
    console.warn('Invalid sidebar route target:', target, error)
    return null
  }
}

function resolveItem(item, context) {
  if (!canAccess(context.user, item.access)) return null

  const children = (Array.isArray(item.children) ? item.children : [])
    .map((child) => resolveItem(child, context))
    .filter(Boolean)

  const routeInfo = resolveRouteRecord(
    context.router,
    resolveItemTarget(item, context.profile),
  )

  if (!routeInfo) return null

  if (!canAccess(context.user, routeInfo.meta?.access)) {
    return null
  }

  return {
    ...item,
    to: routeInfo.target,
    routePath: routeInfo.path,
    routeName: routeInfo.name,
    label: resolveText(context.t, item.labelKey, item.label || item.id),
    badge: resolveText(context.t, item.badgeKey, item.badge || ''),
    children,
  }
}

export function buildSidebarSections({ config, router, user, t }) {
  const profile = getAccessProfile(user)

  return (Array.isArray(config?.sections) ? config.sections : [])
    .filter((section) => canAccess(user, section.access))
    .map((section) => ({
      ...section,
      label: resolveText(t, section.labelKey, section.label || section.id),
      caption: resolveText(t, section.captionKey, section.caption || ''),
      badge: resolveText(t, section.badgeKey, section.badge || ''),
      items: (Array.isArray(section.items) ? section.items : [])
        .map((item) => resolveItem(item, { profile, router, t, user }))
        .filter(Boolean),
    }))
    .filter((section) => section.items.length)
}
