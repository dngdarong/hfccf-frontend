<script setup>
/**
 * UiButton
 * --------------------------------------------------------------------------
 * Shared button wrapper around PrimeVue Button.
 *
 * Features:
 * - Project button variants
 * - Standardized sizes
 * - Loading state
 * - Disabled state
 * - Optional full-width block mode
 * - Left/right icon slots
 * - PrimeVue pass-through styling
 * --------------------------------------------------------------------------
 */

import { computed, useAttrs, useSlots } from 'vue'
import PrimeButton from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'UiButton',
  inheritAttrs: false,
})

const props = defineProps({
  /**
   * Visual button style.
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'].includes(value),
  },

  /**
   * Button size.
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },

  /**
   * Native button type.
   */
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },

  /**
   * Shows PrimeVue loading spinner.
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * Disables button interaction.
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Makes button full width.
   */
  block: {
    type: Boolean,
    default: false,
  },

  /**
   * Border radius size.
   */
  rounded: {
    type: String,
    default: 'xl',
    validator: (value) => ['md', 'lg', 'xl', 'full'].includes(value),
  },
})

const emit = defineEmits(['click'])

const attrs = useAttrs()
const slots = useSlots()
const { t } = useLanguage()

/**
 * PrimeVue severity fallback.
 * Most colors are controlled by custom Tailwind classes below.
 */
const severity = computed(() => {
  if (props.variant === 'danger') return 'danger'
  if (props.variant === 'secondary' || props.variant === 'success') return 'success'

  return 'info'
})

/**
 * Radius classes.
 */
const roundedClass = computed(() => {
  const classes = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return classes[props.rounded] || classes.xl
})

/**
 * Size classes.
 */
const sizeClass = computed(() => {
  const classes = {
    xs: '!min-h-8 !px-3 !py-1.5 !text-xs !gap-1.5',
    sm: '!min-h-9.5 !px-3.5 !py-2 !text-sm !gap-2',
    md: '!min-h-11 !px-4.5 !py-2.5 !text-sm !gap-2',
    lg: '!min-h-12 !px-5.5 !py-3.5 !text-base !gap-2.5',
    xl: '!min-h-13.5 !px-6.5 !py-4 !text-[1.06rem] !gap-3',
  }

  return classes[props.size] || classes.md
})

/**
 * Variant color classes.
 */
const variantClass = computed(() => {
  if (props.variant === 'secondary' || props.variant === 'success') {
    return [
      '!border-hope-lime',
      '!bg-hope-lime',
      '!text-white',
      'shadow-[0_10px_22px_-14px_rgba(101,163,13,0.42)]',
      'hover:enabled:!-translate-y-0.5',
      'hover:enabled:!border-lime-700',
      'hover:enabled:!bg-lime-700',
      'hover:enabled:shadow-[0_14px_24px_-14px_rgba(77,124,15,0.36)]',
    ]
  }

  if (props.variant === 'danger') {
    return [
      '!border-hope-red',
      '!bg-hope-red',
      '!text-white',
      'shadow-[0_10px_22px_-14px_rgba(225,29,72,0.38)]',
      'hover:enabled:!-translate-y-0.5',
      'hover:enabled:!border-rose-700',
      'hover:enabled:!bg-rose-700',
      'hover:enabled:shadow-[0_14px_24px_-14px_rgba(190,18,60,0.34)]',
    ]
  }

  if (props.variant === 'outline') {
    return [
      '!border-slate-300',
      '!bg-white',
      '!text-surface-700',
      'shadow-[0_8px_18px_-18px_rgba(15,23,42,0.16)]',
      'hover:enabled:!border-slate-400',
      'hover:enabled:!bg-slate-50',
      'hover:enabled:!text-surface-900',
    ]
  }

  if (props.variant === 'ghost') {
    return [
      '!border-transparent',
      '!bg-transparent',
      '!text-surface-600',
      '!shadow-none',
      'hover:enabled:!bg-slate-100',
      'hover:enabled:!text-surface-900',
    ]
  }

  return [
    '!border-brand-500',
    '!bg-brand-500',
    '!text-white',
    'shadow-[0_10px_22px_-14px_rgba(0,174,239,0.46)]',
    'hover:enabled:!-translate-y-0.5',
    'hover:enabled:!border-brand-600',
    'hover:enabled:!bg-brand-600',
    'hover:enabled:shadow-[0_14px_24px_-14px_rgba(2,132,199,0.38)]',
  ]
})

/**
 * Final root button classes.
 */
const buttonClass = computed(() => {
  const classes = [
    'ui-button',
    '!inline-flex',
    '!items-center',
    '!justify-center',
    '!border',
    '!font-bold',
    '!transition-all',
    '!duration-200',
    'focus-visible:!outline-none',
    'focus-visible:!shadow-focus',
    'active:enabled:scale-[0.98]',
    'disabled:!cursor-not-allowed',
    'disabled:!opacity-60',
    'disabled:!shadow-none',
    'disabled:saturate-[0.86]',
    roundedClass.value,
    sizeClass.value,
    ...variantClass.value,
  ]

  if (props.block) {
    classes.push('w-full')
  }

  return classes
})

/**
 * Text shown when button is loading and no slot content is passed.
 */
const loadingLabel = computed(() => t('common.states.loading'))

/**
 * PrimeVue pass-through style config.
 */
const passthrough = computed(() => ({
  root: {
    class: buttonClass.value,
  },
  loadingIcon: {
    class: 'ui-button__spinner !text-current',
  },
  label: {
    class:
      props.loading && !slots.default
        ? ''
        : 'ui-button__label inline-flex items-center justify-center whitespace-nowrap',
  },
}))

/**
 * Emit click only when the button is interactive.
 */
function handleClick(event) {
  if (props.disabled || props.loading) {
    return
  }

  emit('click', event)
}
</script>

<template>
  <PrimeButton
    v-bind="attrs"
    :type="type"
    :severity="severity"
    :outlined="variant === 'outline'"
    :text="variant === 'ghost'"
    :loading="loading"
    :disabled="disabled || loading"
    :pt="passthrough"
    @click="handleClick"
  >
    <!-- Left icon slot -->
    <template v-if="$slots.iconLeft && !loading" #icon>
      <slot name="iconLeft" />
    </template>

    <!-- Button label/content -->
    <template v-if="$slots.default">
      <slot />
    </template>

    <!-- Fallback loading text when no default content exists -->
    <template v-else-if="loading">
      {{ loadingLabel }}
    </template>

    <!-- Right icon slot -->
    <template v-if="$slots.iconRight && !loading">
      <slot name="iconRight" />
    </template>
  </PrimeButton>
</template>

<style scoped>
/**
 * Keep PrimeVue icon size aligned with custom button text.
 */
:deep(.ui-button.p-button .p-button-icon) {
  font-size: 0.95em;
}
</style>
