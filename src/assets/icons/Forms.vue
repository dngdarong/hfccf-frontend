<script setup>
defineOptions({
  name: 'FormsIcon',
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
      d="M7 3.5h8.5L19 7v13.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5Z"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M15.5 3.5V7H19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8.5 11h7" stroke-width="1.8" stroke-linecap="round" />
    <path d="M8.5 14.5h7" stroke-width="1.8" stroke-linecap="round" />
    <path d="M8.5 18h4" stroke-width="1.8" stroke-linecap="round" />
  </svg>
</template>
