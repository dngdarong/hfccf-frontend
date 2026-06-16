<script setup>
defineOptions({
  name: 'TableEmptyState',
})

defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="px-4 py-7 text-center text-sm text-surface-500">
    {{ text }}
  </div>
</template>
