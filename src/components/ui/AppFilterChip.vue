<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'AppFilterChip',
})

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
})

const emit = defineEmits(['click'])

const rootClass = computed(() => [
  'ui-filter-chip',
  'inline-flex',
  'items-center',
  'justify-center',
  'gap-1.5',
  '!rounded-[var(--ui-pill-radius)]',
  '!border',
  '!px-3',
  '!py-1.5',
  '!text-[0.74rem]',
  '!font-semibold',
  '!leading-none',
  'transition-all',
  'duration-200',
  'focus-visible:!outline-none',
  'focus-visible:!shadow-[var(--ui-focus-ring)]',
  props.selected
    ? '!border-brand-primary-300 !bg-brand-primary-50 !text-brand-surface-900'
    : '!border-slate-200 !bg-white !text-slate-700 hover:!border-slate-300 hover:!bg-slate-50',
  props.disabled ? '!cursor-not-allowed !opacity-50' : 'cursor-pointer',
])

function handleClick(event) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="rootClass"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

