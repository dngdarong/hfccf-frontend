<script setup>
defineOptions({
  name: 'GovernanceIcon',
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
      d="M12 3l7 3v5c0 4.9-3.2 8.9-7 10.5-3.8-1.6-7-5.6-7-10.5V6l7-3Z"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M9.2 12.1 11 13.9 14.8 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
