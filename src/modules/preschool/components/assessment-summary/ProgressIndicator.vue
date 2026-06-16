<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'AssessmentProgressIndicator',
})

const props = defineProps({
  current: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: 'Progress',
  },
  color: {
    type: String,
    default: 'emerald',
    validator: (value) => ['blue', 'emerald', 'amber', 'red', 'purple'].includes(value),
  },
  showPercentage: {
    type: Boolean,
    default: true,
  },
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const colorClasses = {
  blue: {
    barColor: 'bg-blue-500',
    textColor: 'text-blue-700',
  },
  emerald: {
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
  amber: {
    barColor: 'bg-amber-500',
    textColor: 'text-amber-700',
  },
  red: {
    barColor: 'bg-red-500',
    textColor: 'text-red-700',
  },
  purple: {
    barColor: 'bg-purple-500',
    textColor: 'text-purple-700',
  },
}

const colors = colorClasses[props.color]
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span v-if="showPercentage" :class="['text-sm font-semibold', colors.textColor]">
        {{ percentage }}%
      </span>
      <span v-else class="text-sm text-gray-600">
        {{ current }}/{{ total }}
      </span>
    </div>

    <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        :class="['h-full transition-all duration-300 ease-out', colors.barColor]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
