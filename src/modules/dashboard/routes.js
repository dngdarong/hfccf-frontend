import { defineAppRoute } from '@/router/defineAppRoute'

export const dashboardRoutes = [
  {
    path: '/',
    redirect: '/module/dashboard',
  },
  defineAppRoute({
    path: '/module/dashboard',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/Dashboard.vue'),
    access: {},
  }),
  defineAppRoute({
    path: '/module/calendar',
    name: 'calendar',
    component: () => import('@/modules/dashboard/pages/Calendar.vue'),
    access: {},
  }),
  defineAppRoute({
    path: '/module/notifications',
    name: 'dashboard-notifications',
    component: () => import('@/modules/dashboard/pages/Notifications.vue'),
    access: {},
  }),
]
