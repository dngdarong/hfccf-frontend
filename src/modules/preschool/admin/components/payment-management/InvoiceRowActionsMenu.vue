<script setup>
import { computed, ref } from 'vue'
import Menu from 'primevue/menu'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'InvoiceRowActionsMenu',
})

const props = defineProps({
  row: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'delete', 'cancel', 'add-payment', 'print', 'download-pdf', 'download-excel'])

const { t } = useLanguage()
const menu = ref(null)
const menuId = `invoice-actions-menu-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`

const isDraft = computed(() => String(props.row?.status || '').trim().toLowerCase() === 'draft')
const canCancel = computed(() => ['issued', 'partial', 'overdue'].includes(String(props.row?.status || '').trim().toLowerCase()))
const isOutstanding = computed(() => {
  const status = String(props.row?.status || '').trim().toLowerCase()
  const balanceDue = Number(props.row?.balanceDue ?? props.row?.balance_due ?? 0)
  return balanceDue > 0 && !['draft', 'cancelled', 'paid'].includes(status)
})

const menuItems = computed(() => {
  const items = [
    {
      label: t('common.view'),
      icon: 'pi pi-eye',
      command: () => emit('view', props.row),
    },
    {
      label: t('preschoolPaymentManagementPage.actions.printInvoice'),
      icon: 'pi pi-print',
      command: () => emit('print', props.row),
    },
    {
      label: t('preschoolPaymentManagementPage.actions.downloadPdf'),
      icon: 'pi pi-file-pdf',
      command: () => emit('download-pdf', props.row),
    },
    {
      label: t('preschoolPaymentManagementPage.actions.downloadExcel'),
      icon: 'pi pi-file-excel',
      command: () => emit('download-excel', props.row),
    },
  ]

  if (isDraft.value) {
    items.push({
      label: t('common.delete'),
      icon: 'pi pi-trash',
      class: 'text-rose-600',
      command: () => emit('delete', props.row),
    })
    return items
  }

  if (isOutstanding.value) {
    items.splice(1, 0, {
      label: t('preschoolPaymentManagementPage.actions.addPayment'),
      icon: 'pi pi-plus',
      command: () => emit('add-payment', props.row),
    })
  }

  if (canCancel.value) {
    items.push({
      label: t('preschoolPaymentManagementPage.actions.cancelInvoice'),
      icon: 'pi pi-ban',
      class: 'text-rose-600',
      command: () => emit('cancel', props.row),
    })
  }

  return items
})

function toggleMenu(event) {
  if (props.disabled) return
  menu.value?.toggle(event)
}
</script>

<template>
  <div class="inline-flex">
    <AppIconButton
      icon="pi pi-ellipsis-h"
      variant="secondary"
      size="sm"
      :disabled="disabled"
      :aria-label="t('common.actions.menu')"
      :aria-controls="menuId"
      aria-haspopup="menu"
      @click="toggleMenu"
    />

    <Menu
      :id="menuId"
      ref="menu"
      :model="menuItems"
      popup
      class="invoice-row-actions-menu"
    />
  </div>
</template>

<style scoped>
:deep(.invoice-row-actions-menu.p-menu) {
  min-width: 13rem;
  overflow: hidden;
  border: 1px solid var(--brand-surface-200);
  border-radius: 0.95rem;
  background: #ffffff !important;
  box-shadow: 0 14px 30px -22px rgba(15, 23, 42, 0.16);
}

:deep(.invoice-row-actions-menu .p-menu-list) {
  padding: 0.4rem;
  background: #ffffff;
}

:deep(.invoice-row-actions-menu .p-menu-item-content) {
  border-radius: 0.75rem;
}

:deep(.invoice-row-actions-menu .p-menu-item-link) {
  gap: 0.75rem;
  padding: 0.78rem 0.9rem;
  border-radius: 0.75rem;
  color: var(--hope-dark);
  font-weight: 600;
}

:deep(.invoice-row-actions-menu .p-menu-item:not(.p-disabled) .p-menu-item-content:hover) {
  background: var(--brand-primary-50);
}
</style>
