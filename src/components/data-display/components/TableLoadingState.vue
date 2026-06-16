<script setup>
import Loading from '@/components/feedback/Loading.vue'

defineOptions({
  name: 'TableLoadingState',
})

defineProps({
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="px-4 py-8">
    <div class="flex justify-center">
      <Loading
        :label="label"
        size="md"
      />
    </div>
  </div>
</template>
