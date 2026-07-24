<script setup>
import AppIconButton from '@/components/ui/AppIconButton.vue'

defineOptions({
  name: 'CalendarIconButton',
})

defineProps({
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
    default: 'ghost',
  },
  size: {
    type: String,
    default: 'md',
  },
  active: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  badge: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <AppIconButton
    :icon="icon"
    :aria-label="ariaLabel"
    :variant="variant"
    :size="size"
    :active="active"
    :disabled="disabled"
    :badge="badge"
    :type="type"
    @click="emit('click')"
  />
</template>
