import { defineAsyncComponent } from 'vue'

/**
 * Permission-based fallback dashboards.
 * This registry is used when no role-specific dashboard can be resolved.
 */
export const dashboardRegistry = Object.freeze({
  operations: {
    component: defineAsyncComponent(() => import('@/shared/components/dashboards/OperationsDashboard.vue')),
    label: 'Operations',
    severity: 'secondary',
  },
  delivery: {
    component: defineAsyncComponent(() => import('@/shared/components/dashboards/DeliveryDashboard.vue')),
    label: 'Delivery',
    severity: 'secondary',
  },
  programs: {
    component: defineAsyncComponent(() => import('@/shared/components/dashboards/ProgramsDashboard.vue')),
    label: 'Programs',
    severity: 'secondary',
  },
  basic: {
    component: defineAsyncComponent(() => import('@/shared/components/dashboards/BasicDashboard.vue')),
    label: 'Basic Access',
    severity: 'secondary',
  },
})
