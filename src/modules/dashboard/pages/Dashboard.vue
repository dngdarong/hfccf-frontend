<script setup>
/**
 * DashboardPage
 * --------------------------------------------------------------------------
 * Dashboard resolver page.
 *
 * Features:
 * - Resolves role-specific dashboards
 * - Falls back to permission-based dashboards
 * - Lazy-loads dashboard modules
 * - Provides safe unavailable fallback UI
 * --------------------------------------------------------------------------
 */

import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from '@/components/buttons/Button.vue'
import { useDashboardResolver } from '@/modules/dashboard/composables/useDashboardResolver'

defineOptions({
  name: 'DashboardPage',
})

const router = useRouter()
const {
  activeDashboardComponent,
  currentRoleLabel,
  currentSeverity,
} = useDashboardResolver()

/**
 * Navigate user back to login page.
 */
function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <component
    v-if="activeDashboardComponent"
    :is="activeDashboardComponent"
  />

  <div
    v-else
    class="dashboard-fallback"
  >
    <Card class="dashboard-fallback__card">
      <template #title>
        Dashboard unavailable
      </template>

      <template #subtitle>
        The system could not resolve a dashboard for the current session.
      </template>

      <template #content>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-600">
              Resolved access
            </span>

            <Tag
              :value="currentRoleLabel"
              :severity="currentSeverity"
              rounded
            />
          </div>

          <p class="text-sm leading-6 text-slate-600">
            Sign in again or contact a Super Admin if your role permissions were changed.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Back to login"
            icon="pi pi-sign-in"
            @click="goToLogin"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
/**
 * Fallback page wrapper.
 */
.dashboard-fallback {
  display: flex;
  min-height: calc(100vh - 5rem);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

/**
 * Fallback card styling.
 */
:deep(.dashboard-fallback__card.p-card) {
  width: min(100%, 36rem);
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.45);
}
</style>

