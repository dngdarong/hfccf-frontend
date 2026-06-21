<script setup>
import Button from '@/components/buttons/Button.vue'
import Table from '@/components/data-display/Table.vue'
import { useLanguage } from '@/composables/useLanguage'

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

const emit = defineEmits(['view', 'edit', 'delete', 'cancel'])
const { t } = useLanguage()

function isDraft(row) {
  return String(row?.status || '').trim().toLowerCase() === 'draft'
}

function onDelete(row) {
  emit('delete', row)
}

function onCancel(row) {
  emit('cancel', row)
}
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
      <div class="inline-flex items-center gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          @click="$emit('view', data)"
        >
          {{ t('common.view') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          v-if="isDraft(data)"
          @click="$emit('edit', data)"
        >
          {{ t('common.edit') }}
        </Button>
        <Button
          v-if="isDraft(data)"
          type="button"
          variant="danger"
          size="sm"
          rounded="xl"
          @click="onDelete(data)"
        >
          {{ t('common.delete') }}
        </Button>
        <Button
          v-else
          type="button"
          variant="danger"
          size="sm"
          rounded="xl"
          @click="onCancel(data)"
        >
          {{ t('preschoolPaymentManagementPage.actions.cancelInvoice') }}
        </Button>
      </div>
    </template>
  </Table>
</template>
