<script setup>
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

defineOptions({
  name: 'StatusBadge',
  inheritAttrs: false,
})
</script>

<template>
  <AppStatusChip v-bind="$attrs">
    <slot />
  </AppStatusChip>
</template>
