<script setup>
import StatCard from '@/modules/preschool/components/assessment-summary/StatCard.vue'

defineOptions({
  name: 'AssessmentMetricGrid',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  stats: {
    type: Array,
    required: true,
  },
})

defineEmits(['click'])
</script>

<template>
  <section class="space-y-4">
    <h3 class="text-xl font-bold text-slate-900">
      {{ title }}
    </h3>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :icon="stat.label"
        :icon-class="stat.iconClass"
        :label="stat.label"
        :value="stat.value"
        :unit="stat.unit"
        :color="stat.color"
        :clickable="stat.clickable"
        @click="$emit('click', stat)"
      />
    </div>
  </section>
</template>
