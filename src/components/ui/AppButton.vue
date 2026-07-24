<script setup>
import { computed, useAttrs, useSlots } from 'vue'
import PrimeButton from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AppButton',
  inheritAttrs: false,
})

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'link'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
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
  block: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value),
  },
  badge: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['click'])

const attrs = useAttrs()
const slots = useSlots()
const { t } = useLanguage()

const buttonAttrs = computed(() => {
  const next = { ...attrs }
  delete next.label
  delete next.icon
  delete next.iconPos
  delete next.severity
  delete next.outlined
  delete next.text
  delete next.link
  delete next.raised
  return next
})

const buttonIconClass = computed(() => String(attrs.icon || '').trim())
const buttonLabel = computed(() => String(attrs.label || '').trim())
const buttonIconPosition = computed(() => String(attrs.iconPos || 'left').toLowerCase())
const hasLabelContent = computed(() => Boolean(buttonLabel.value || slots.default))

const contentClass = computed(() => [
  'ui-button__content',
  hasLabelContent.value ? '' : 'ui-button__content--icon-only',
])

const sizeClass = computed(() => {
  const classes = {
    xs: '!h-7 !min-h-7 !px-3 !text-xs !gap-1.5 !leading-[1.1]',
    sm: '!h-[34px] !min-h-[34px] !px-3.5 !text-sm !gap-1.5 !leading-[1.1]',
    md: '!h-10 !min-h-10 !px-4 !text-sm !gap-2 !leading-[1.1]',
    lg: '!h-[46px] !min-h-[46px] !px-5 !text-base !gap-2 !leading-[1.1]',
    xl: '!h-[46px] !min-h-[46px] !px-5 !text-base !gap-2 !leading-[1.1]',
  }

  return classes[props.size] || classes.md
})

const roundedClass = computed(() => {
  const classes = {
    sm: 'rounded-[10px]',
    md: 'rounded-[11px]',
    lg: 'rounded-[12px]',
    xl: 'rounded-[12px]',
    full: 'rounded-full',
  }

  return classes[props.rounded] || classes.lg
})

const variantClass = computed(() => {
  if (props.variant === 'secondary') {
    return [
      '!border-brand-200',
      '!bg-white',
      '!text-slate-800',
      'shadow-[var(--ui-button-shadow)]',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-brand-50',
      'hover:enabled:!text-slate-900',
    ]
  }

  if (props.variant === 'outline') {
    return [
      '!border-brand-200',
      '!bg-white',
      '!text-slate-800',
      'shadow-[var(--ui-button-shadow)]',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-brand-50',
      'hover:enabled:!text-slate-900',
    ]
  }

  if (props.variant === 'ghost') {
    return [
      '!border-transparent',
      '!bg-transparent',
      '!text-slate-700',
      '!shadow-none',
      'hover:enabled:!bg-slate-100',
      'hover:enabled:!text-slate-900',
    ]
  }

  if (props.variant === 'danger') {
    return [
      '!border-rose-600',
      '!bg-rose-600',
      '!text-white',
      'shadow-[var(--ui-button-shadow)]',
      'hover:enabled:!border-rose-700',
      'hover:enabled:!bg-rose-700',
    ]
  }

  if (props.variant === 'success') {
    return [
      '!border-emerald-600',
      '!bg-emerald-600',
      '!text-white',
      'shadow-[var(--ui-button-shadow)]',
      'hover:enabled:!border-emerald-700',
      'hover:enabled:!bg-emerald-700',
    ]
  }

  if (props.variant === 'warning') {
    return [
      '!border-amber-500',
      '!bg-amber-500',
      '!text-white',
      'shadow-[var(--ui-button-shadow)]',
      'hover:enabled:!border-amber-600',
      'hover:enabled:!bg-amber-600',
    ]
  }

  if (props.variant === 'link') {
    return [
      '!border-transparent',
      '!bg-transparent',
      '!px-0',
      '!py-0',
      '!h-auto',
      '!min-h-0',
      '!text-brand-700',
      '!shadow-none',
      '!underline-offset-4',
      'hover:enabled:!underline',
      'hover:enabled:!text-brand-800',
    ]
  }

  return [
    '!border-brand-600',
    '!bg-brand-600',
    '!text-white',
    'shadow-[var(--ui-button-shadow-strong)]',
    'hover:enabled:!border-brand-700',
    'hover:enabled:!bg-brand-700',
  ]
})

const rootClass = computed(() => {
  const classes = [
    'ui-button',
    '!inline-flex',
    '!items-center',
    '!justify-center',
    '!min-w-0',
    'whitespace-nowrap',
    '!border',
    '!font-semibold',
    '!transition-all',
    '!duration-200',
    '!leading-none',
    'focus-visible:!outline-none',
    'focus-visible:!shadow-[var(--ui-focus-ring)]',
    'disabled:!cursor-not-allowed',
    'disabled:!opacity-60',
    'disabled:!shadow-none',
    'active:enabled:scale-[0.98]',
    roundedClass.value,
    sizeClass.value,
    ...variantClass.value,
  ]

  if (props.active) {
    classes.push('!ring-2', '!ring-brand-primary-200')
  }

  if (props.block) {
    classes.push('w-full')
  }

  return classes
})

const loadingLabel = computed(() => t('common.states.loading'))

const pt = computed(() => ({
  root: {
    class: rootClass.value,
  },
  loadingIcon: {
    class: 'ui-button__spinner !text-current',
  },
}))

function handleClick(event) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <PrimeButton
    v-bind="buttonAttrs"
    :type="type"
    :loading="loading"
    :disabled="disabled || loading"
    :badge="badge"
    :pt="pt"
    :aria-busy="loading ? 'true' : undefined"
    @click="handleClick"
  >
    <span :class="contentClass">
      <span v-if="!loading && buttonIconPosition === 'left' && (buttonIconClass || $slots.iconLeft || $slots.icon)" class="ui-button__icon ui-button__icon--left p-button-icon" aria-hidden="true">
        <slot v-if="$slots.iconLeft" name="iconLeft" />
        <slot v-else-if="$slots.icon" name="icon" />
        <i v-else :class="buttonIconClass" />
      </span>

      <span class="ui-button__label p-button-label">
        <slot>{{ buttonLabel }}</slot>
      </span>

      <span v-if="!loading && buttonIconPosition === 'right' && (buttonIconClass || $slots.iconRight)" class="ui-button__icon ui-button__icon--right p-button-icon" aria-hidden="true">
        <slot v-if="$slots.iconRight" name="iconRight" />
        <i v-else :class="buttonIconClass" />
      </span>

      <span v-else-if="!loading && buttonIconPosition !== 'right' && $slots.iconRight" class="ui-button__icon ui-button__icon--right p-button-icon" aria-hidden="true">
        <slot name="iconRight" />
      </span>

      <span v-if="loading" class="sr-only">{{ loadingLabel }}</span>
    </span>
  </PrimeButton>
</template>

<style scoped>
:deep(.ui-button.p-button) {
  align-items: center;
  min-width: 0;
}

.ui-button__content {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 0;
  max-width: 100%;
  gap: 0.5rem;
}

.ui-button__content--icon-only {
  gap: 0 !important;
}

.ui-button__label {
  display: inline-flex !important;
  align-items: center !important;
  color: currentColor !important;
  opacity: 1 !important;
  visibility: visible !important;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1 !important;
}

.ui-button__icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  color: currentColor !important;
  opacity: 1 !important;
  visibility: visible !important;
  line-height: 1 !important;
}

:deep(.ui-button__icon i) {
  display: inline-block !important;
  font-family: 'primeicons' !important;
  font-style: normal !important;
  font-size: 1em !important;
  line-height: 1 !important;
  color: currentColor !important;
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.ui-button__icon i::before) {
  display: inline-block !important;
  color: currentColor !important;
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.ui-button.p-button .p-button-icon) {
  font-size: 0.95em;
}
</style>
