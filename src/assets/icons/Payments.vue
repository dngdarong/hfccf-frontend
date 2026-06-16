<script setup>
defineOptions({
  name: 'PaymentsIcon',
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
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M3 9h18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7 15h4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="16.5" cy="15" r="1.2" stroke-width="2" />
  </svg>
</template>
