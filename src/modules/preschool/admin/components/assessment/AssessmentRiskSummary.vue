<script setup>
import StatCard from '@/modules/preschool/components/assessment-summary/StatCard.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentRiskSummary',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  metrics: {
    type: Array,
    required: true,
  },
  highRiskCount: {
    type: Number,
    default: 0,
  },
  showHighRiskDetails: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view-details'])

const { t } = useLanguage()
</script>

<template>
  <section class="space-y-4">
    <h3 class="text-xl font-bold text-slate-900">
      {{ title }}
    </h3>
    <div class="grid gap-4 md:grid-cols-2">
      <StatCard
        v-for="metric in metrics"
        :key="metric.label"
        :icon="metric.label"
        :icon-class="metric.iconClass"
        :label="metric.label"
        :value="metric.value"
        :color="metric.color"
      />
    </div>

    <div
      v-if="showHighRiskDetails && highRiskCount > 0"
      class="rounded-2xl border border-red-200 bg-red-50 p-5"
    >
      <h4 class="font-semibold text-red-900">
        {{ t('assessmentReports.highRiskStudents') }}
      </h4>
      <p class="mt-2 text-sm text-red-800">
        {{ highRiskCount }} {{ t('assessmentReports.highRiskMessage') }}
      </p>
      <button
        type="button"
        class="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        @click="emit('view-details')"
      >
        {{ t('assessmentReports.viewDetails') }}
        <i class="pi pi-arrow-right" />
      </button>
    </div>
  </section>
</template>
