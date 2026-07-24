<script setup>
import Table from '@/components/data-display/Table.vue'
import InvoiceRowActionsMenu from './InvoiceRowActionsMenu.vue'

defineOptions({
  name: 'InvoiceTable',
})

defineProps({
  invoices: {
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

</script>

<template>
  <Table
    :rows="invoices"
    :columns="columns"
    :loading="loading"
    :empty-text="emptyText"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
  >
    <template #actions="{ data }">
      <InvoiceRowActionsMenu
        :row="data"
        @view="$emit('view', $event)"
        @add-payment="$emit('add-payment', $event)"
        @delete="$emit('delete', $event)"
        @cancel="$emit('cancel', $event)"
        @print="$emit('print', $event)"
        @download-pdf="$emit('download-pdf', $event)"
        @download-excel="$emit('download-excel', $event)"
      />
    </template>
  </Table>
</template>
