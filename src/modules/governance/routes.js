import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const governanceRoutes = [
  defineAppRoute({
    path: '/admin/governance',
    name: 'governance-dashboard',
    component: () => import('@/modules/governance/pages/GovernanceDashboard.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/admin/governance/audit-logs',
    name: 'governance-audit-logs',
    component: () => import('@/modules/governance/pages/AuditLogsPage.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/admin/governance/security-monitoring',
    name: 'governance-security-monitoring',
    component: () => import('@/modules/governance/pages/SecurityMonitoringPage.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/admin/governance/configuration-history',
    name: 'governance-configuration-history',
    component: () => import('@/modules/governance/pages/ConfigurationHistoryPage.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/admin/governance/risk-management',
    name: 'governance-risk-management',
    component: () => import('@/modules/governance/pages/RiskManagementPage.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
  defineAppRoute({
    path: '/admin/governance/investigations',
    name: 'governance-investigations',
    component: () => import('@/modules/governance/pages/GovernanceInvestigations.vue'),
    access: {
      domains: [DOMAINS.GLOBAL],
      scopes: [ACCESS_SCOPES.SUPER_ADMIN],
    },
  }),
]
