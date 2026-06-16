import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const tournamentRoutes = [
  defineAppRoute({
    path: '/module/sport-admin/tournaments',
    name: 'dashboard-sport-admin-tournaments',
    component: () => import('@/modules/sport/tournament/pages/TournamentListPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/create',
    name: 'dashboard-sport-admin-tournaments-create',
    component: () => import('@/modules/sport/tournament/pages/TournamentCreatePage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/edit',
    name: 'dashboard-sport-admin-tournaments-edit',
    component: () => import('@/modules/sport/tournament/pages/TournamentCreatePage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/groups',
    name: 'dashboard-sport-admin-tournaments-groups',
    component: () => import('@/modules/sport/tournament/pages/TournamentGroupsPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/fixtures',
    name: 'dashboard-sport-admin-tournaments-fixtures',
    component: () => import('@/modules/sport/tournament/pages/TournamentFixturesPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/standings',
    name: 'dashboard-sport-admin-tournaments-standings',
    component: () => import('@/modules/sport/tournament/pages/TournamentStandingsPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/results',
    name: 'dashboard-sport-admin-tournaments-results',
    component: () => import('@/modules/sport/tournament/pages/TournamentResultsPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id/knockout',
    name: 'dashboard-sport-admin-tournaments-knockout',
    component: () => import('@/modules/sport/tournament/pages/TournamentKnockoutPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/tournaments/:id',
    name: 'dashboard-sport-admin-tournaments-detail',
    component: () => import('@/modules/sport/tournament/pages/TournamentDetailPage.vue'),
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
]
