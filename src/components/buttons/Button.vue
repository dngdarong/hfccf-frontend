<script setup>
import { computed, useAttrs } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

defineOptions({
  name: 'UiButton',
  inheritAttrs: false,
})

const props = defineProps({
  severity: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: '',
  },
  outlined: {
    type: Boolean,
    default: false,
  },
  text: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Boolean,
    default: false,
  },
  raised: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: [Boolean, String],
    default: false,
  },
  size: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

const attrs = useAttrs()

const resolvedVariant = computed(() => {
  if (props.variant) return props.variant
  if (props.link) return 'link'
  if (props.text) return 'ghost'
  if (props.outlined) return 'outline'

  const severityMap = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    info: 'secondary',
    warn: 'warning',
    warning: 'warning',
    help: 'secondary',
    danger: 'danger',
    contrast: 'secondary',
  }

  return severityMap[props.severity] || 'primary'
})

const resolvedSize = computed(() => {
  const sizeMap = {
    small: 'sm',
    normal: 'md',
    medium: 'md',
    large: 'lg',
    xlarge: 'xl',
  }

  if (props.size) {
    return sizeMap[props.size] || props.size
  }

  return 'md'
})

const resolvedRounded = computed(() => {
  if (props.rounded === true) return 'full'
  if (typeof props.rounded === 'string' && props.rounded.length > 0) return props.rounded

  return 'lg'
})
</script>

<template>
  <AppButton
    v-bind="attrs"
    :variant="resolvedVariant"
    :size="resolvedSize"
    :rounded="resolvedRounded"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :active="active"
    :type="type"
  >
    <template v-if="$slots.iconLeft" #iconLeft>
      <slot name="iconLeft" />
    </template>
    <template v-else-if="$slots.icon" #iconLeft>
      <slot name="icon" />
    </template>
    <slot />
    <template v-if="$slots.iconRight" #iconRight>
      <slot name="iconRight" />
    </template>
  </AppButton>
</template>
