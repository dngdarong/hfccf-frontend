<script setup>
defineProps({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  activeClass: {
    type: String,
    required: true,
  },
  ringClass: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="att-status-btn"
    :class="isActive ? `${activeClass} ${ringClass}` : ''"
    :disabled="disabled"
    :title="label"
    @click="emit('click')"
  >
    {{ short }}
  </button>
</template>

<style scoped>
.att-status-btn {
  min-width: 2.15rem;
  padding: 0.35rem 0.45rem;
  border-radius: 0.55rem;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.att-status-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
}

.att-status-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
