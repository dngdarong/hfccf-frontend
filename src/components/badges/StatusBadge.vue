<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  status: {
    type: String,
    default: 'neutral',
  },
  label: {
    type: String,
    default: '',
  },
  /**
   * When true, we treat `label` as a status code and try to translate it from `common.status.*`.
   * When false, we render `label` as-is (useful when the caller already localized the label).
   */
  translateLabel: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md',
  },
  dot: {
    type: Boolean,
    default: true,
  },
})

const { t, te } = useLanguage()

function toStatusKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function normalizeStatus(value) {
  const key = String(value || 'neutral').trim().toLowerCase()

  if (['stable', 'success', 'active'].includes(key)) return 'success'
  if (['watch', 'warning', 'pending', 'medium'].includes(key)) return 'warning'
  if (['critical', 'error', 'high', 'urgent', 'suspended'].includes(key)) return 'error'
  if (['info', 'low'].includes(key)) return 'info'

  return key || 'neutral'
}

const normalizedStatus = computed(() => normalizeStatus(props.status))
const statusLabel = computed(() => {
  const rawLabel = String(props.label || '').trim()
  if (rawLabel) {
    if (!props.translateLabel) return rawLabel

    const key = `common.status.${toStatusKey(rawLabel)}`
    // Avoid `[intlify] Not found ...` warnings by checking key existence first.
    return te(key) ? t(key) : rawLabel
  }

  const key = `common.status.${toStatusKey(normalizedStatus.value)}`
  return te(key) ? t(key) : normalizedStatus.value
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return '!px-2.5 !py-1 !text-[0.68rem]'
  if (props.size === 'lg') return '!px-3.5 !py-1.5 !text-[0.8rem]'
  return '!px-3 !py-1.5 !text-[0.74rem]'
})

const toneClass = computed(() => {
  if (['success', 'active'].includes(normalizedStatus.value)) {
    return [
      '!border-lime-200',
      '!bg-lime-50',
      '!text-lime-800',
      '[--status-dot:var(--hope-lime)]',
    ]
  }

  if (['warning', 'inactive'].includes(normalizedStatus.value)) {
    return [
      '!border-amber-200',
      '!bg-amber-50',
      '!text-amber-800',
      '[--status-dot:var(--hope-yellow)]',
    ]
  }

  if (['error', 'suspended'].includes(normalizedStatus.value)) {
    return [
      '!border-rose-200',
      '!bg-rose-50',
      '!text-rose-800',
      '[--status-dot:var(--hope-red)]',
    ]
  }

  if (normalizedStatus.value === 'info' || normalizedStatus.value === 'pending') {
    return [
      '!border-brand-200',
      '!bg-brand-50',
      '!text-brand-800',
      '[--status-dot:var(--hope-cyan)]',
    ]
  }

  return [
    '!border-surface-200',
    '!bg-surface-50',
    '!text-surface-700',
    '[--status-dot:var(--brand-surface-400)]',
  ]
})

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
    class: props.dot ? '!mr-0' : '!hidden',
  },
}))
</script>

<template>
  <Tag :value="statusLabel" rounded class="ui-tag" :class="`ui-tag--${size}`" :pt="statusPt">
    <template v-if="dot" #icon>
      <span class="ui-tag__dot" aria-hidden="true"></span>
    </template>
  </Tag>
</template>

<style scoped>
.ui-tag__dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--status-dot, currentColor);
}
</style>
