<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'ClassInfoItem',
})

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Number],
    default: '',
  },
  helper: {
    type: String,
    default: '',
  },
})

const hasValue = computed(() =>
  props.value !== '' && props.value !== null && props.value !== undefined,
)
</script>

<template>
  <div class="class-info-item">
    <p class="class-info-item__label">{{ label }}</p>
    <p v-if="$slots.default || hasValue" class="class-info-item__value">
      <slot>{{ hasValue ? value : '—' }}</slot>
    </p>
    <p v-else class="class-info-item__value class-info-item__value--empty">—</p>
    <p v-if="helper" class="class-info-item__helper">{{ helper }}</p>
  </div>
</template>

<style scoped>
.class-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.class-info-item__label {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.class-info-item__value {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.class-info-item__value--empty {
  color: #94a3b8;
}

.class-info-item__helper {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
</style>
