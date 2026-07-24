import { describe, expect, it } from 'vitest'
import { preschoolRoutes } from '@/modules/preschool/routes'

describe('preschool unified notifications redirect', () => {
  it('redirects the legacy Preschool notifications route to dashboard notifications with tab=tasks', () => {
    const notificationsRoute = preschoolRoutes.find(
      (route) => route.name === 'dashboard-preschool-admin-notifications',
    )

    expect(Boolean(notificationsRoute?.redirect)).toBe(true)
    expect(notificationsRoute.redirect({ query: { from: 'preschool' } })).toEqual({
      name: 'dashboard-notifications',
      query: {
        from: 'preschool',
        tab: 'tasks',
      },
    })
  })
})
