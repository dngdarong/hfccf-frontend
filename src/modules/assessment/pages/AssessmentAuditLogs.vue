<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentReportApi } from '../services/assessmentReportApi'

defineOptions({ name: 'AssessmentAuditLogsPage' })

const { t } = useLanguage()

const logs = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentReportApi.auditLogs()
    logs.value = res.data.data
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="audit-logs">
      <HeaderSection :title="t('assessmentReports.auditLogs.title')" />

      <DataTable :value="logs" :loading="isLoading">
        <Column field="event" :header="t('assessmentReports.auditLogs.event')" />
        <Column :header="t('assessmentReports.auditLogs.actor')">
          <template #body="{ data }">
            {{ data.actor?.name ?? '—' }}
          </template>
        </Column>
        <Column field="description" :header="t('assessmentReports.auditLogs.description')" />
        <Column field="created_at" :header="t('assessmentReports.auditLogs.timestamp')" />
      </DataTable>
    </div>
  </MainLayout>
</template>

<style scoped>
.audit-logs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
