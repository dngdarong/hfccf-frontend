import { defineAppRoute } from '@/router/defineAppRoute'

export const settingsRoutes = [
  defineAppRoute({
    path: '/module/settings/profile',
    name: 'profile-settings',
    component: () => import('@/modules/settings/pages/ProfileSettings.vue'),
    access: {},
  }),
  defineAppRoute({
    path: '/module/settings/about-website',
    name: 'settings-about-website',
    component: () => import('@/modules/settings/pages/AboutWebsitePage.vue'),
    access: {},
  }),
]
