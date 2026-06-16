<script setup>
defineOptions({
  name: 'AssessmentStatCard',
})

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'blue',
    validator: value => ['blue', 'emerald', 'amber', 'red', 'purple', 'pink'].includes(value),
  },
  trend: {
    type: Object,
    default: null,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const colorConfig = {
  blue: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
  emerald: {
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
  },
  amber: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
  },
  red: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconBg: 'bg-red-100',
  },
  purple: {
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    iconBg: 'bg-purple-100',
  },
  pink: {
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    iconBg: 'bg-pink-100',
  },
}

const config = colorConfig[props.color]
</script>

<template>
  <div
    :class="[
      'rounded-lg border p-4 transition-all duration-200',
      config.bgColor,
      config.borderColor,
      props.clickable ? 'cursor-pointer hover:shadow-md hover:border-current' : '',
    ]"
    @click="props.clickable && emit('click')"
  >
    <div :class="['mb-3 w-fit rounded-lg p-2', config.iconBg]">
      <i v-if="iconClass" :class="[iconClass, 'text-2xl']" />
      <span v-else class="text-2xl">{{ icon }}</span>
    </div>

    <p class="text-sm font-medium text-gray-600">{{ label }}</p>

    <div class="mt-2 flex items-baseline gap-1">
      <span :class="['text-3xl font-bold', config.textColor]">{{ value }}</span>
      <span v-if="unit" class="text-sm text-gray-500">{{ unit }}</span>
    </div>

    <div
      v-if="trend"
      :class="['mt-2 flex items-center gap-1 text-xs', trend.positive ? 'text-emerald-600' : 'text-red-600']"
    >
      <span>{{ trend.positive ? '↑' : '↓' }}</span>
      <span>{{ trend.value }} {{ trend.label }}</span>
    </div>
  </div>
</template>
