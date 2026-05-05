<script setup>
import { computed } from 'vue'

const emit = defineEmits(['click'])

const props = defineProps({
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
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: 'button',
  },
})

const buttonClass = computed(() => [
  'calendar-icon-button',
  `calendar-icon-button--${props.variant}`,
  `calendar-icon-button--${props.size}`,
  { 'calendar-icon-button--active': props.active },
])

const badgeLabel = computed(() => {
  if (!props.badge) return ''
  return props.badge > 99 ? '99+' : String(props.badge)
})

function onClick(event) {
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClass"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="onClick"
  >
    <slot>
      <i :class="icon" aria-hidden="true" />
    </slot>
    <span v-if="badgeLabel" class="calendar-icon-button__badge">{{ badgeLabel }}</span>
  </button>
</template>

<style scoped>
.calendar-icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d7dee7;
  border-radius: 9999px;
  background: #fff;
  color: #1d1d1b;
  box-shadow: 0 14px 24px -22px rgba(15, 23, 42, 0.25);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.calendar-icon-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #00aeef;
  color: #0089bc;
  box-shadow: 0 18px 28px -22px rgba(0, 174, 239, 0.42);
}

.calendar-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.calendar-icon-button--sm {
  width: 2.1rem;
  height: 2.1rem;
  font-size: 0.85rem;
}

.calendar-icon-button--md {
  width: 2.65rem;
  height: 2.65rem;
  font-size: 0.95rem;
}

.calendar-icon-button--solid {
  border-color: #00aeef;
  background: #00aeef;
  color: #fff;
}

.calendar-icon-button--soft {
  border-color: #cdebf7;
  background: #f0fbff;
  color: #0089bc;
}

.calendar-icon-button--active {
  border-color: #00aeef;
  background: #effaff;
  color: #0089bc;
}

.calendar-icon-button__badge {
  position: absolute;
  top: -0.28rem;
  right: -0.18rem;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  border-radius: 9999px;
  background: #ed1c24;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 12px 18px -16px rgba(237, 28, 36, 0.95);
}
</style>
