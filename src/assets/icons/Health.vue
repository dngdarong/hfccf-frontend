<script setup>
defineOptions({
  name: 'HealthIcon',
})

defineProps({
  size: {
    type: Number,
    default: 20,
  },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      d="M12 3.5c2.1 0 3.8 1.7 3.8 3.8 0 2.4-2 4.1-3.8 6.4-1.8-2.3-3.8-4-3.8-6.4 0-2.1 1.7-3.8 3.8-3.8Z"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M12 9v6" stroke-width="2" stroke-linecap="round" />
    <path d="M9 12h6" stroke-width="2" stroke-linecap="round" />
  </svg>
</template>
