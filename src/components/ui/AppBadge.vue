<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'AppBadge',
})

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) =>
      ['neutral', 'info', 'success', 'warning', 'danger', 'admin', 'staff'].includes(value),
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
})

const sizeClass = computed(() => {
  const classes = {
    xs: '!min-h-5 !px-2 !py-0.5 !text-[0.62rem]',
    sm: '!min-h-6 !px-2.5 !py-1 !text-[0.7rem]',
    md: '!min-h-7 !px-3 !py-1.5 !text-[0.75rem]',
    lg: '!min-h-7 !px-3 !py-1.5 !text-[0.75rem]',
  }

  return classes[props.size] || classes.sm
})

const variantClass = computed(() => {
  if (props.variant === 'info') {
    return ['!border-brand-primary-200', '!bg-brand-primary-50', '!text-brand-surface-800']
  }

  if (props.variant === 'success') {
    return ['!border-emerald-200', '!bg-emerald-50', '!text-emerald-800']
  }

  if (props.variant === 'warning') {
    return ['!border-amber-200', '!bg-amber-50', '!text-amber-800']
  }

  if (props.variant === 'danger') {
    return ['!border-rose-200', '!bg-rose-50', '!text-rose-800']
  }

  if (props.variant === 'admin') {
    return ['!border-indigo-200', '!bg-indigo-50', '!text-indigo-800']
  }

  if (props.variant === 'staff') {
    return ['!border-slate-200', '!bg-slate-50', '!text-slate-700']
  }

  return ['!border-slate-200', '!bg-slate-50', '!text-slate-700']
})

const badgeClass = computed(() => [
  'ui-badge',
  'inline-flex',
  'max-w-full',
  'min-w-0',
  'items-center',
  'justify-center',
  'gap-1.5',
  '!rounded-[var(--ui-pill-radius)]',
  '!border',
  '!font-semibold',
  '!leading-none',
  '!tracking-[0.02em]',
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
  ...sizeClass.value.split(' '),
  ...variantClass.value,
])

const resolvedTitle = computed(() => props.title || props.label || '')
</script>

<template>
  <span
    class="ui-badge"
    :class="badgeClass"
    :title="resolvedTitle || undefined"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
