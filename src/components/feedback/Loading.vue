<script setup>
/**
 * Loading
 * --------------------------------------------------------------------------
 * Shared loading indicator using PrimeVue ProgressSpinner.
 *
 * Features:
 * - Localized loading label
 * - Configurable size
 * - Configurable tone
 * - Accessible status region
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'Loading',
})

const props = defineProps({
  /**
   * Optional loading label.
   */
  label: {
    type: String,
    default: '',
  },

  /**
   * Spinner size.
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },

  /**
   * Spinner/text color tone.
   */
  tone: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'neutral'].includes(value),
  },
})

const { t } = useLanguage()

/**
 * Resolve display label.
 */
const resolvedLabel = computed(() =>
  props.label || t('common.states.loading'),
)

/**
 * Spinner dimensions by size.
 */
const spinnerSize = computed(() => {
  const sizes = {
    sm: '1.1rem',
    md: '1.3rem',
    lg: '1.6rem',
  }

  return sizes[props.size] || sizes.md
})

/**
 * Text and spinner color.
 */
const toneClass = computed(() =>
  props.tone === 'neutral'
    ? 'text-hope-dark'
    : 'text-brand-500',
)

/**
 * PrimeVue pass-through styling.
 */
const spinnerPt = {
  root: {
    class: '!inline-flex',
  },
  spinner: {
    class: '!stroke-current',
  },
}
</script>

<template>
  <div
    class="inline-flex w-full items-center justify-center gap-2.5 font-bold uppercase tracking-[0.08em]"
    :class="toneClass"
    role="status"
    aria-live="polite"
    :aria-label="resolvedLabel"
  >
    <ProgressSpinner
      class="loading__spinner"
      stroke-width="6"
      fill="transparent"
      animation-duration=".8s"
      :style="{
        width: spinnerSize,
        height: spinnerSize,
      }"
      :pt="spinnerPt"
      aria-hidden="true"
    />

    <span class="text-[0.74rem] leading-none">
      {{ resolvedLabel }}
    </span>
  </div>
</template>
