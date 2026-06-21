<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchSecurityEvents } from '@/modules/governance/services/api/governanceApi'
import SecurityEventsTable from '@/modules/governance/components/SecurityEventsTable.vue'
import GovernanceExportMenu from '@/modules/governance/components/GovernanceExportMenu.vue'

defineOptions({
  name: 'SecurityMonitoringPage',
})

const { t } = useLanguage()
const loading = ref(true)
const errorMessage = ref('')
const items = ref([])

async function loadEvents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchSecurityEvents()
    items.value = payload.items || []
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadEvents()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection :title="t('governance.security.pageTitle')" :subtitle="t('governance.security.pageSubtitle')" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600">{{ t('governance.security.description') }}</p>
        <GovernanceExportMenu filename-base="governance-security-events" :rows="items" :columns="[
          { key: 'eventType', label: t('governance.security.fields.eventType') },
          { key: 'severity', label: t('governance.security.fields.severity') },
          { key: 'description', label: t('governance.security.fields.description') },
        ]" />
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {{ t('governance.messages.loading') }}
      </div>

      <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <SecurityEventsTable
        :title="t('governance.security.timelineTitle')"
        :items="items"
        :empty-label="t('governance.emptyStates.securityEvents')"
      />
    </div>
  </MainLayout>
</template>
