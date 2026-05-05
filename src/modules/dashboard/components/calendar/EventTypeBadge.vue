<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span class="event-type-badge" :class="`event-type-badge--${type}`">{{ label }}</span>
</template>

<style scoped>
.event-type-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.34rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.event-type-badge--match {
  background: #e8f9ff;
  color: #0089bc;
}

.event-type-badge--training {
  background: #eff8df;
  color: #5b8f1d;
}

.event-type-badge--meeting {
  background: #fff7d9;
  color: #8f6700;
}

.event-type-badge--urgent {
  background: #ffe7e8;
  color: #b5141a;
}
</style>
