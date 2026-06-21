<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchInvestigations } from '@/modules/governance/services/api/governanceApi'
import InvestigationFilters from '@/modules/governance/components/InvestigationFilters.vue'
import AuditTimeline from '@/modules/governance/components/AuditTimeline.vue'
import SecurityEventsTable from '@/modules/governance/components/SecurityEventsTable.vue'

defineOptions({
  name: 'GovernanceInvestigationsPage',
})

const { t } = useLanguage()
const loading = ref(true)
const errorMessage = ref('')
const filters = ref({
  dateFrom: '',
  dateTo: '',
  module: '',
  eventType: '',
  severity: '',
  entity: '',
})
const auditLogs = ref([])
const securityEvents = ref([])
const risk = ref({})

const auditItems = computed(() => auditLogs.value)
const securityItems = computed(() => securityEvents.value)

async function loadInvestigations() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchInvestigations(filters.value)
    auditLogs.value = payload.auditLogs || []
    securityEvents.value = payload.securityEvents || []
    risk.value = payload.risk || {}
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    module: '',
    eventType: '',
    severity: '',
    entity: '',
  }
  void loadInvestigations()
}

onMounted(() => {
  void loadInvestigations()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection :title="t('governance.investigations.pageTitle')" :subtitle="t('governance.investigations.pageSubtitle')" />

      <InvestigationFilters
        v-model="filters"
        :title="t('governance.investigations.filtersTitle')"
        @submit="loadInvestigations"
        @reset="resetFilters"
      />

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {{ t('governance.messages.loading') }}
      </div>

      <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <AuditTimeline
          :title="t('governance.investigations.auditTimeline')"
          :items="auditItems"
          :empty-label="t('governance.emptyStates.auditLogs')"
        />
        <SecurityEventsTable
          :title="t('governance.investigations.securityReview')"
          :items="securityItems"
          :empty-label="t('governance.emptyStates.securityEvents')"
        />
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 class="text-lg font-semibold text-slate-900">{{ t('governance.investigations.riskSummary') }}</h3>
        <pre class="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">{{ JSON.stringify(risk, null, 2) }}</pre>
      </div>
    </div>
  </MainLayout>
</template>
