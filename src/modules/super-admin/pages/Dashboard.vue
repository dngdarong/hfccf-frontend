<script setup>
/**
 * SuperAdminCommandCenter
 * --------------------------------------------------------------------------
 * Super Admin command center dashboard page.
 *
 * Responsibilities:
 * - Compose command-center panels
 * - Build localized view model
 * - Keep business display logic inside commandCenterViewModel
 * --------------------------------------------------------------------------
 */

import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import CommandCenterSummaryCards from '@/modules/super-admin/components/command-center/CommandCenterSummaryCards.vue'
import ExecutiveStatusPanel from '@/modules/super-admin/components/command-center/ExecutiveStatusPanel.vue'
import PriorityActionsPanel from '@/modules/super-admin/components/command-center/PriorityActionsPanel.vue'
import DepartmentHealthPanel from '@/modules/super-admin/components/command-center/DepartmentHealthPanel.vue'
import GovernanceOverviewPanel from '@/modules/super-admin/components/command-center/GovernanceOverviewPanel.vue'
import RecentCriticalEventsPanel from '@/modules/super-admin/components/command-center/RecentCriticalEventsPanel.vue'
import RecommendedNextStepsPanel from '@/modules/super-admin/components/command-center/RecommendedNextStepsPanel.vue'
import { buildCommandCenterViewModel } from '@/modules/super-admin/components/command-center/commandCenterViewModel'
import commandCenterMock from '@/mocks/super-admin/commandCenterData'
import { fetchCommandCenterData } from '@/modules/super-admin/services/commandCenterApi'

defineOptions({
  name: 'SuperAdminCommandCenter',
})

const { t, te } = useI18n()

/**
 * Command center data is initialized from the local mock so the dashboard renders immediately,
 * then hydrated from the API when available.
 */
const commandCenterData = ref(commandCenterMock)

async function loadCommandCenterData() {
  commandCenterData.value = await fetchCommandCenterData()
}

onMounted(() => {
  void loadCommandCenterData().catch(() => {
    commandCenterData.value = commandCenterMock
  })
})

const viewModel = computed(() =>
  buildCommandCenterViewModel(t, te, commandCenterData.value),
)
</script>

<template>
  <MainLayout>
    <section class="command-center-page">
      <HeaderSection
        :title="viewModel.pageTitle"
        :subtitle="viewModel.pageSubtitle"
      />

      <CommandCenterSummaryCards
        :title="viewModel.sections.summary.title"
        :subtitle="viewModel.sections.summary.subtitle"
        :cards="viewModel.summaryCards"
      />

      <div class="command-center-grid">
        <ExecutiveStatusPanel
          class="xl:col-span-2"
          :title="viewModel.sections.status.title"
          :status="viewModel.executiveStatus"
        />

        <PriorityActionsPanel
          class="xl:col-span-2"
          :title="viewModel.sections.priorityActions.title"
          :actions="viewModel.priorityActions"
        />
      </div>

      <div class="command-center-grid">
        <DepartmentHealthPanel
          class="xl:col-span-2"
          :title="viewModel.sections.departmentHealth.title"
          :departments="viewModel.departmentHealth"
        />

        <GovernanceOverviewPanel
          class="xl:col-span-2"
          :title="viewModel.sections.governance.title"
          :metrics="viewModel.governanceMetrics"
        />
      </div>

      <div class="command-center-grid">
        <RecentCriticalEventsPanel
          class="xl:col-span-2"
          :title="viewModel.sections.events.title"
          :events="viewModel.recentEvents"
        />

        <RecommendedNextStepsPanel
          class="xl:col-span-2"
          :title="viewModel.sections.nextSteps.title"
          :steps="viewModel.nextSteps"
        />
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
/**
 * Page vertical layout.
 */
.command-center-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/**
 * Reusable responsive panel grid.
 */
.command-center-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1280px) {
  .command-center-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
