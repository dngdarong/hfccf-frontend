<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchAuditLogs } from '@/modules/governance/services/api/governanceApi'
import AuditTimeline from '@/modules/governance/components/AuditTimeline.vue'
import GovernanceExportMenu from '@/modules/governance/components/GovernanceExportMenu.vue'

defineOptions({
  name: 'AuditLogsPage',
})

const { t } = useLanguage()
const loading = ref(true)
const errorMessage = ref('')
const items = ref([])

const exportColumns = computed(() => [
  { key: 'eventType', label: t('governance.audit.fields.eventType') },
  { key: 'module', label: t('governance.audit.fields.module') },
  { key: 'action', label: t('governance.audit.fields.action') },
  { key: 'createdAt', label: t('governance.audit.fields.createdAt') },
])

async function loadLogs() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchAuditLogs()
    items.value = payload.items || []
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadLogs()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('governance.audit.pageTitle')"
        :subtitle="t('governance.audit.pageSubtitle')"
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600">{{ t('governance.audit.description') }}</p>
        <GovernanceExportMenu
          filename-base="governance-audit-logs"
          :rows="items"
          :columns="exportColumns"
        />
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {{ t('governance.messages.loading') }}
      </div>

      <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <AuditTimeline
        :title="t('governance.audit.timelineTitle')"
        :items="items"
        :empty-label="t('governance.emptyStates.auditLogs')"
      />

      <Button :label="t('governance.actions.refresh')" variant="outline" @click="loadLogs" />
    </div>
  </MainLayout>
</template>
