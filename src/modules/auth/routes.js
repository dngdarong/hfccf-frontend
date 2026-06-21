import { defineAppRoute } from '@/router/defineAppRoute'

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/modules/auth/pages/ForgotPassword.vue'),
    meta: { guestOnly: true },
  },
  defineAppRoute({
    path: '/change-password',
    name: 'force-password-change',
    component: () => import('@/modules/auth/pages/ForcePasswordChange.vue'),
    access: {
      requiresAuth: true,
    },
  }),
]
