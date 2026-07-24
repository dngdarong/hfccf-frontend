<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()
const router = useRouter()
const route = useRoute()

const REPORTS = [
  {
    key: 'attendance',
    label: 'Attendance',
    routeName: 'dashboard-preschool-admin-reports-attendance',
    icon: 'pi-calendar-check',
    color: 'emerald',
  },
]

const reportOptions = computed(() =>
  REPORTS.map(report => ({
    ...report,
    label: t(`preschoolReportsPage.reportTypes.${report.key}`) || report.label,
  })),
)

const currentReport = computed(() => {
  const routeName = route.name
  return REPORTS.find(r => r.routeName === routeName)?.key || ''
})

function switchReport(reportKey) {
  const report = REPORTS.find(r => r.key === reportKey)
  if (report?.routeName) {
    router.push({ name: report.routeName })
  }
}

</script>

<template>
  <div class="hidden gap-1 md:flex border-b border-slate-200">
    <button
      v-for="report in reportOptions"
      :key="report.key"
      type="button"
      @click="switchReport(report.key)"
      :class="[
        'px-4 py-3 text-sm font-semibold transition-all relative',
        currentReport === report.key
          ? 'text-slate-900'
          : 'text-slate-600 hover:text-slate-900',
      ]"
    >
      {{ report.label }}
      <div
        v-if="currentReport === report.key"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
      />
    </button>
  </div>

  <div class="md:hidden">
    <Select
      :model-value="currentReport"
      :options="reportOptions"
      option-label="label"
      option-value="key"
      @update:model-value="switchReport"
      class="w-full"
    />
  </div>
</template>
