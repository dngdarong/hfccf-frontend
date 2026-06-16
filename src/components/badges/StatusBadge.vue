<script setup>
/**
 * StatusBadge
 * --------------------------------------------------------------------------
 * Reusable status badge component using PrimeVue Tag.
 *
 * Features:
 * - Status tone normalization
 * - Optional translation support
 * - Configurable sizes
 * - Optional status dot
 * - Accessible status rendering
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StatusBadge',
})

const props = defineProps({
  /**
   * Status value used for tone styling.
   * Example:
   * success, warning, error, pending, active
   */
  status: {
    type: String,
    default: 'neutral',
  },

  /**
   * Optional custom label.
   * If empty, normalized status name is used.
   */
  label: {
    type: String,
    default: '',
  },

  /**
   * When true:
   * Attempts translation from:
   * common.status.*
   */
  translateLabel: {
    type: Boolean,
    default: true,
  },

  /**
   * Badge size.
   * Supported:
   * sm | md | lg
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },

  /**
   * Show small colored status dot.
   */
  dot: {
    type: Boolean,
    default: true,
  },
})

const { t, te } = useLanguage()

/**
 * Convert status into translation-safe key.
 *
 * Example:
 * "In Progress" -> "in_progress"
 */
function toStatusKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

/**
 * Normalize incoming statuses into consistent tone groups.
 *
 * This avoids scattered condition checks everywhere.
 */
function normalizeStatus(value) {
  const key = String(value || 'neutral')
    .trim()
    .toLowerCase()

  // Success states
  if (['stable', 'success', 'active'].includes(key)) {
    return 'success'
  }

  // Warning states
  if (['watch', 'warning', 'medium'].includes(key)) {
    return 'warning'
  }

  // Error states
  if (['critical', 'error', 'high', 'urgent', 'suspended'].includes(key)) {
    return 'error'
  }

  // Info states
  if (['info', 'pending', 'low'].includes(key)) {
    return 'info'
  }

  return key || 'neutral'
}

/**
 * Normalized status value.
 */
const normalizedStatus = computed(() =>
  normalizeStatus(props.status),
)

/**
 * Resolved label text.
 *
 * Priority:
 * 1. custom label
 * 2. translated status
 * 3. normalized status
 */
const statusLabel = computed(() => {
  const rawLabel = String(props.label || '').trim()

  // Use custom label if provided
  if (rawLabel) {
    if (!props.translateLabel) {
      return rawLabel
    }

    const key = `common.status.${toStatusKey(rawLabel)}`

    return te(key)
      ? t(key)
      : rawLabel
  }

  // Fallback to normalized status translation
  const key = `common.status.${toStatusKey(normalizedStatus.value)}`

  return te(key)
    ? t(key)
    : normalizedStatus.value
})

/**
 * Size styling classes.
 */
const sizeClass = computed(() => {
  const classes = {
    sm: '!px-2.5 !py-1 !text-[0.68rem]',
    md: '!px-3 !py-1.5 !text-[0.74rem]',
    lg: '!px-3.5 !py-1.5 !text-[0.8rem]',
  }

  return classes[props.size] || classes.md
})

/**
 * Tone styling classes based on normalized status.
 */
const toneClass = computed(() => {
  switch (normalizedStatus.value) {
    case 'success':
      return [
        '!border-lime-200',
        '!bg-lime-50',
        '!text-lime-800',
        '[--status-dot:var(--hope-lime)]',
      ]

    case 'warning':
      return [
        '!border-amber-200',
        '!bg-amber-50',
        '!text-amber-800',
        '[--status-dot:var(--hope-yellow)]',
      ]

    case 'error':
      return [
        '!border-rose-200',
        '!bg-rose-50',
        '!text-rose-800',
        '[--status-dot:var(--hope-red)]',
      ]

    case 'info':
      return [
        '!border-brand-200',
        '!bg-brand-50',
        '!text-brand-800',
        '[--status-dot:var(--hope-cyan)]',
      ]

    default:
      return [
        '!border-surface-200',
        '!bg-surface-50',
        '!text-surface-700',
        '[--status-dot:var(--brand-surface-400)]',
      ]
  }
})

/**
 * PrimeVue pass-through styling.
 */
const statusPt = computed(() => ({
  root: {
    class: [
      '!inline-flex',
      '!items-center',
      '!gap-1.5',
      '!rounded-full',
      '!border',
      '!font-bold',
      '!tracking-[0.03em]',
      '!leading-none',
      ...toneClass.value,
      sizeClass.value,
    ],
  },

  label: {
    class: '!leading-none',
  },

  icon: {
    class: props.dot
      ? '!mr-0'
      : '!hidden',
  },
}))
</script>

<template>
  <Tag
    :value="statusLabel"
    class="ui-tag"
    :class="`ui-tag--${size}`"
    :pt="statusPt"
    role="status"
    aria-live="polite"
  >
    <!-- Optional colored status dot -->
    <template v-if="dot" #icon>
      <span
        class="ui-tag__dot"
        aria-hidden="true"
      />
    </template>
  </Tag>
</template>

<style scoped>
/**
 * Small colored indicator dot.
 */
.ui-tag__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--status-dot, currentColor);
}
</style>
