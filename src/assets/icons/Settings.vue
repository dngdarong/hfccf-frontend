<script setup>
defineOptions({
  name: 'SettingsIcon',
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
    <circle cx="12" cy="12" r="3" stroke-width="2" />
    <path
      d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.2 5.2 6.6 6.6M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="12" r="7" stroke-width="2" />
  </svg>
</template>
