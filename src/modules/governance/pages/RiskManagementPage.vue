<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchRiskDashboard, fetchAtRiskStudents } from '@/modules/governance/services/api/governanceApi'
import RiskHeatMap from '@/modules/governance/components/RiskHeatMap.vue'
import GovernanceExportMenu from '@/modules/governance/components/GovernanceExportMenu.vue'

defineOptions({
  name: 'RiskManagementPage',
})

const { t } = useLanguage()
const loading = ref(true)
const errorMessage = ref('')
const dashboard = ref({
  atRiskStudents: 0,
  overduePayments: 0,
  openHealthAlerts: 0,
  openGuardianIssues: 0,
})
const students = ref([])

async function loadRisk() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [risk, atRisk] = await Promise.all([
      fetchRiskDashboard(),
      fetchAtRiskStudents(),
    ])
    dashboard.value = risk
    students.value = atRisk.items || []
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadRisk()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection :title="t('governance.risk.pageTitle')" :subtitle="t('governance.risk.pageSubtitle')" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600">{{ t('governance.risk.description') }}</p>
        <GovernanceExportMenu
          filename-base="governance-risk"
          :rows="students"
          :columns="[
            { key: 'label', label: t('governance.risk.fields.student') },
            { key: 'riskLevel', label: t('governance.risk.fields.riskLevel') },
            { key: 'reason', label: t('governance.risk.fields.reason') },
          ]"
        />
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {{ t('governance.messages.loading') }}
      </div>

      <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <RiskHeatMap
        :title="t('governance.risk.dashboardTitle')"
        :items="[
          { id: 'at-risk', label: t('governance.risk.atRiskStudents'), value: dashboard.atRiskStudents, description: t('governance.risk.atRiskStudentsDescription'), statusClass: 'border-rose-200 bg-rose-50 text-rose-900' },
          { id: 'overdue', label: t('governance.risk.overduePayments'), value: dashboard.overduePayments, description: t('governance.risk.overduePaymentsDescription'), statusClass: 'border-amber-200 bg-amber-50 text-amber-900' },
          { id: 'health', label: t('governance.risk.openHealthAlerts'), value: dashboard.openHealthAlerts, description: t('governance.risk.openHealthAlertsDescription'), statusClass: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
          { id: 'guardians', label: t('governance.risk.openGuardianIssues'), value: dashboard.openGuardianIssues, description: t('governance.risk.openGuardianIssuesDescription'), statusClass: 'border-sky-200 bg-sky-50 text-sky-900' },
        ]"
        :empty-label="t('governance.emptyStates.risk')"
      />

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 class="text-lg font-semibold text-slate-900">{{ t('governance.risk.atRiskStudentsTitle') }}</h3>
        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="student in students" :key="student.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">{{ student.label }}</p>
            <p class="text-sm text-slate-600">{{ student.riskLevel || student.reason || '-' }}</p>
          </article>
        </div>
        <p v-if="!students.length" class="py-8 text-center text-sm text-slate-500">{{ t('governance.emptyStates.atRiskStudents') }}</p>
      </div>
    </div>
  </MainLayout>
</template>
