<script setup>
import { computed, useSlots } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

defineOptions({
  name: 'AppIconButton',
})

const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'secondary',
    validator: (value) =>
      ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'].includes(value),
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  badge: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['click'])
const slots = useSlots()

const sizeClass = computed(() => {
  const classes = {
    xs: '!h-7 !w-7 !min-h-7 !min-w-7',
    sm: '!h-[34px] !w-[34px] !min-h-[34px] !min-w-[34px]',
    md: '!h-10 !w-10 !min-h-10 !min-w-10',
  }

  return classes[props.size] || classes.sm
})

const variantClass = computed(() => {
  if (props.variant === 'primary') {
    return [
      '!border-brand-600',
      '!bg-brand-600',
      '!text-white',
      'hover:enabled:!border-brand-700',
      'hover:enabled:!bg-brand-700',
    ]
  }

  if (props.variant === 'danger') {
    return [
      '!border-rose-600',
      '!bg-rose-600',
      '!text-white',
      'hover:enabled:!border-rose-700',
      'hover:enabled:!bg-rose-700',
    ]
  }

  if (props.variant === 'success') {
    return [
      '!border-emerald-600',
      '!bg-emerald-600',
      '!text-white',
      'hover:enabled:!border-emerald-700',
      'hover:enabled:!bg-emerald-700',
    ]
  }

  if (props.variant === 'warning') {
    return [
      '!border-amber-500',
      '!bg-amber-500',
      '!text-white',
      'hover:enabled:!border-amber-600',
      'hover:enabled:!bg-amber-600',
    ]
  }

  if (props.variant === 'ghost') {
    return [
      '!border-transparent',
      '!bg-transparent',
      '!text-surface-700',
      '!shadow-none',
      'hover:enabled:!bg-slate-100',
      'hover:enabled:!text-surface-900',
    ]
  }

  return [
    '!border-brand-200',
    '!bg-white',
    '!text-surface-700',
    'hover:enabled:!border-brand-300',
    'hover:enabled:!bg-brand-50',
    'hover:enabled:!text-surface-900',
  ]
})

const rootClass = computed(() => [
  'ui-icon-button',
  '!inline-flex',
  '!items-center',
  '!justify-center',
  '!rounded-full',
  '!border',
  '!font-semibold',
  '!transition-all',
  '!duration-200',
  'focus-visible:!outline-none',
  'focus-visible:!shadow-[var(--ui-focus-ring)]',
  'disabled:!cursor-not-allowed',
  'disabled:!opacity-60',
  'disabled:!shadow-none',
  'active:enabled:scale-[0.98]',
  sizeClass.value,
  ...variantClass.value,
  props.active ? '!ring-2 !ring-brand-primary-200' : '',
  props.size === 'xs'
    ? '!w-7 !min-w-7 !px-0'
    : props.size === 'sm'
      ? '!w-[34px] !min-w-[34px] !px-0'
      : '!w-10 !min-w-10 !px-0',
])

function handleClick(event) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <AppButton
    :type="type"
    :icon="icon"
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled || loading"
    :active="active"
    :badge="badge ? String(badge) : undefined"
    rounded="full"
    :class="rootClass"
    :aria-label="ariaLabel"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <template v-if="slots.icon" #iconLeft>
      <slot name="icon" />
    </template>
    <template v-else-if="slots.default" #iconLeft>
      <slot />
    </template>
  </AppButton>
</template>
