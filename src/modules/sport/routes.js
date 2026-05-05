import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'
import SportAdminDashboard from '@/modules/sport/admin/pages/Dashboard.vue'
import SportCoachManagement from '@/modules/sport/admin/pages/CoachManagement.vue'
import SportAddCoach from '@/modules/sport/admin/pages/AddCoach.vue'
import SportTeamsManagement from '@/modules/sport/admin/pages/TeamsManagement.vue'
import SportAddTeam from '@/modules/sport/admin/pages/AddTeam.vue'
import SportManagesPlayerInfor from '@/modules/sport/admin/pages/ManagesPlayerInfor.vue'
import SportAddPlayer from '@/modules/sport/admin/pages/AddPlayer.vue'
import CoachDashboard from '@/modules/sport/coach/pages/Dashboard.vue'

export const sportRoutes = [
  defineAppRoute({
    path: '/module/sport-admin/dashboard',
    name: 'dashboard-sport-admin',
    component: SportAdminDashboard,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/users',
    name: 'dashboard-sport-admin-users',
    component: SportCoachManagement,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/users/add',
    name: 'dashboard-sport-admin-users-add',
    component: SportAddCoach,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/teams',
    name: 'dashboard-sport-admin-teams',
    component: SportTeamsManagement,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/teams/add',
    name: 'dashboard-sport-admin-teams-add',
    component: SportAddTeam,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/players',
    name: 'dashboard-sport-admin-players',
    component: SportManagesPlayerInfor,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/players/add',
    name: 'dashboard-sport-admin-players-add',
    component: SportAddPlayer,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/sport-admin/coach',
    name: 'dashboard-sport-coach',
    component: CoachDashboard,
    access: {
      domains: [DOMAINS.SPORT],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
]
