<script setup>
import Table from '@/components/data-display/Table.vue'

defineOptions({
  name: 'PaymentTable',
})

defineProps({
  payments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})

defineEmits(['view', 'edit', 'delete'])
</script>

<template>
  <Table
    :rows="payments"
    :columns="columns"
    :loading="loading"
    :empty-text="emptyText"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
  />
</template>
