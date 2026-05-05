import { defineAppRoute } from '@/router/defineAppRoute'
import ProfileSettingsPage from '@/modules/settings/pages/ProfileSettings.vue'
import AboutWebsitePage from '@/modules/settings/pages/AboutWebsitePage.vue'

export const settingsRoutes = [
  defineAppRoute({
    path: '/module/settings/profile',
    name: 'profile-settings',
    component: ProfileSettingsPage,
    access: {},
  }),
  defineAppRoute({
    path: '/module/settings/about-website',
    name: 'settings-about-website',
    component: AboutWebsitePage,
    access: {},
  }),
]
