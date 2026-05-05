import { defineAppRoute } from '@/router/defineAppRoute'
import DashboardPage from '@/modules/dashboard/pages/Dashboard.vue'
import CalendarPage from '@/modules/dashboard/pages/Calendar.vue'
import NotificationsPage from '@/modules/dashboard/pages/Notifications.vue'

export const dashboardRoutes = [
  {
    path: '/',
    redirect: '/module/dashboard',
  },
  defineAppRoute({
    path: '/module/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    access: {},
  }),
  defineAppRoute({
    path: '/module/calendar',
    name: 'calendar',
    component: CalendarPage,
    access: {},
  }),
  defineAppRoute({
    path: '/module/notifications',
    name: 'notifications',
    component: NotificationsPage,
    access: {},
  }),
]
