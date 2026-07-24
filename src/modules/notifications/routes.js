import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const notificationsRoutes = [
  defineAppRoute({
    path: '/notifications',
    name: 'notifications',
    redirect: {
      name: 'dashboard-notifications',
    },
    access: {},
  }),
  defineAppRoute({
    path: '/notifications/create',
    name: 'notifications-create',
    component: () => import('@/modules/notifications/pages/CreateNotificationPage.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
]
