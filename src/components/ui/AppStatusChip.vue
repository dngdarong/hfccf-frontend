<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AppStatusChip',
})

const props = defineProps({
  status: {
    type: String,
    default: 'neutral',
    validator: (value) => [
      'healthy',
      'stable',
      'watch',
      'warning',
      'critical',
      'neutral',
      'active',
      'inactive',
      'pending',
      'resolved',
      'overdue',
      'up',
      'down',
      'success',
      'info',
      'danger',
      'error',
      'high',
      'medium',
      'low',
      'urgent',
      'pending_review',
      'draft',
      'suspended',
    ].includes(String(value || '').trim().toLowerCase()),
  },
  label: {
    type: String,
    default: '',
  },
  translateLabel: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
  },
  dot: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

function toStatusKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function normalizeStatus(value) {
  const key = String(value || 'neutral').trim().toLowerCase()
  if (['healthy', 'stable', 'success', 'active', 'resolved', 'up'].includes(key)) return 'success'
  if (['warning', 'watch', 'medium', 'pending'].includes(key)) return 'warning'
  if (['critical', 'danger', 'error', 'high', 'urgent', 'overdue', 'suspended', 'down'].includes(key)) return 'error'
  if (['info'].includes(key)) return 'info'
  if (['inactive', 'neutral', 'pending_review', 'draft'].includes(key)) return 'neutral'
  return 'neutral'
}

const normalizedStatus = computed(() => normalizeStatus(props.status))

const statusLabel = computed(() => {
  const rawLabel = String(props.label || '').trim()
  if (rawLabel) {
    if (!props.translateLabel) return rawLabel
    const key = `common.status.${toStatusKey(rawLabel)}`
    return te(key) ? t(key) : rawLabel
  }

  const key = `common.status.${toStatusKey(normalizedStatus.value)}`
  return te(key) ? t(key) : normalizedStatus.value
})

const sizeClass = computed(() => ({
  xs: '!min-h-5 !px-2 !py-0.5 !text-[0.65rem]',
  sm: '!min-h-6 !px-2.5 !py-1 !text-[0.7rem]',
  md: '!min-h-7 !px-3 !py-1.5 !text-[0.75rem]',
  lg: '!min-h-7 !px-3 !py-1.5 !text-[0.75rem]',
}[props.size] || '!min-h-5 !px-2 !py-0.5 !text-[0.65rem]'))

const toneClass = computed(() => {
  switch (normalizedStatus.value) {
    case 'success':
      return ['!border-emerald-200', '!bg-emerald-50', '!text-emerald-800', '[--status-chip-dot:var(--hope-lime)]']
    case 'warning':
      return ['!border-amber-200', '!bg-amber-50', '!text-amber-800', '[--status-chip-dot:var(--hope-yellow)]']
    case 'error':
      return ['!border-rose-200', '!bg-rose-50', '!text-rose-800', '[--status-chip-dot:var(--hope-red)]']
    case 'info':
      return ['!border-brand-primary-200', '!bg-brand-primary-50', '!text-brand-surface-800', '[--status-chip-dot:var(--hope-cyan)]']
    default:
      return ['!border-slate-200', '!bg-slate-50', '!text-slate-700', '[--status-chip-dot:var(--brand-surface-400)]']
  }
})

const rootClass = computed(() => [
  'ui-status-chip',
  'inline-flex',
  'max-w-full',
  'min-w-0',
  'items-center',
  'gap-1.5',
  '!rounded-[var(--ui-pill-radius)]',
  '!border',
  '!font-semibold',
  '!leading-none',
  '!tracking-[0.02em]',
  'whitespace-nowrap',
  'overflow-hidden',
  'text-ellipsis',
  ...toneClass.value,
  ...sizeClass.value.split(' '),
])
</script>

<template>
  <span
    class="ui-status-chip"
    :class="rootClass"
    role="status"
    :aria-label="statusLabel"
    aria-live="polite"
    :data-status="normalizedStatus"
  >
    <span
      v-if="dot"
      class="ui-status-chip__dot"
      aria-hidden="true"
    />
    <i v-if="icon" :class="icon" aria-hidden="true" />
    <slot>{{ statusLabel }}</slot>
  </span>
</template>

<style scoped>
.ui-status-chip__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  flex: none;
  background: var(--status-chip-dot, currentColor);
}
</style>
