<script setup>
/**
 * ActionsButton
 * --------------------------------------------------------------------------
 * Reusable row action dropdown menu.
 *
 * Features:
 * - View/Edit/Delete actions
 * - PrimeVue popup menu
 * - i18n support
 * - Shared action emit
 * - Accessible trigger button
 * - Safe menu ID generation
 * --------------------------------------------------------------------------
 */

import { computed, ref } from 'vue'
import Menu from 'primevue/menu'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'ActionsButton',
})

const props = defineProps({
  /**
   * Current row item payload.
   */
  item: {
    type: Object,
    default: () => ({}),
  },

  /**
   * Custom translated labels.
   */
  viewLabel: {
    type: String,
    default: '',
  },

  editLabel: {
    type: String,
    default: '',
  },

  deleteLabel: {
    type: String,
    default: '',
  },

  resetLabel: {
    type: String,
    default: '',
  },

  /**
   * Disable action trigger button.
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Show/hide individual actions.
   */
  showView: {
    type: Boolean,
    default: true,
  },

  showEdit: {
    type: Boolean,
    default: true,
  },

  showDelete: {
    type: Boolean,
    default: true,
  },

  showReset: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'view',
  'edit',
  'delete',
  'reset',
  'action',
])

const { t } = useLanguage()

/**
 * PrimeVue popup menu reference.
 */
const menu = ref(null)

/**
 * Stable unique menu ID.
 */
const menuId = `row-actions-menu-${crypto.randomUUID()}`

/**
 * Resolved localized labels.
 */
const labels = computed(() => ({
  view: props.viewLabel || t('common.view'),
  edit: props.editLabel || t('common.edit'),
  delete: props.deleteLabel || t('common.delete'),
  reset: props.resetLabel || t('common.reset'),
}))

/**
 * Shared emit helper.
 */
function onAction(type) {
  emit(type, props.item)

  emit('action', {
    type,
    item: props.item,
  })
}

/**
 * Dynamic menu items.
 */
const menuItems = computed(() => {
  const items = []

  if (props.showView) {
    items.push({
      label: labels.value.view,
      icon: 'pi pi-eye',
      command: () => onAction('view'),
    })
  }

  if (props.showEdit) {
    items.push({
      label: labels.value.edit,
      icon: 'pi pi-pencil',
      command: () => onAction('edit'),
    })
  }

  if (props.showReset) {
    items.push({
      label: labels.value.reset,
      icon: 'pi pi-refresh',
      class: 'actions-button-menu__reset',
      command: () => onAction('reset'),
    })
  }

  if (props.showDelete) {
    items.push({
      label: labels.value.delete,
      icon: 'pi pi-trash',
      class: 'actions-button-menu__danger',
      command: () => onAction('delete'),
    })
  }

  return items
})

/**
 * Toggle popup menu.
 */
function toggleMenu(event) {
  if (props.disabled) return

  menu.value?.toggle(event)
}
</script>

<template>
  <div class="inline-flex">
    <!-- Action trigger button -->
    <AppIconButton
      icon="pi pi-ellipsis-h"
      variant="secondary"
      size="sm"
      class="actions-button-trigger"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-controls="menuId"
      :aria-label="t('common.actions.menu')"
      @click="toggleMenu"
    />

    <!-- Popup actions menu -->
    <Menu
      :id="menuId"
      ref="menu"
      :model="menuItems"
      popup
      class="actions-button-menu"
    />
  </div>
</template>

<style scoped>
/**
 * Popup menu container.
 */
:deep(.actions-button-menu.p-menu) {
  min-width: 11rem;
  overflow: hidden;
  border: 1px solid var(--brand-surface-200);
  border-radius: 0.95rem;
  background: #ffffff !important;
  box-shadow: 0 14px 30px -22px rgba(15, 23, 42, 0.16);
}

/**
 * Menu list spacing.
 */
:deep(.actions-button-menu .p-menu-list) {
  padding: 0.4rem;
  background: #ffffff;
}

/**
 * Menu item container.
 */
:deep(.actions-button-menu .p-menu-item-content) {
  border-radius: 0.75rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/**
 * Menu link styling.
 */
:deep(.actions-button-menu .p-menu-item-link) {
  gap: 0.75rem;
  padding: 0.78rem 0.9rem;
  border-radius: 0.75rem;
  color: var(--hope-dark);
  font-weight: 600;
}

/**
 * Default hover state.
 */
:deep(.actions-button-menu .p-menu-item:not(.p-disabled) .p-menu-item-content:hover) {
  background: var(--brand-primary-50);
}

/**
 * Default icon color.
 */
:deep(.actions-button-menu .p-menu-item-icon) {
  color: var(--brand-surface-500);
  font-size: 0.88rem;
}

/**
 * Hover text/icon color.
 */
:deep(
  .actions-button-menu
    .p-menu-item:not(.p-disabled)
    .p-menu-item-content:hover
    .p-menu-item-link
),
:deep(
  .actions-button-menu
    .p-menu-item:not(.p-disabled)
    .p-menu-item-content:hover
    .p-menu-item-icon
) {
  color: var(--brand-primary-700);
}

/**
 * Danger action hover styling.
 */
:deep(.actions-button-menu__danger .p-menu-item-content:hover) {
  background: #fff1f2 !important;
}

:deep(.actions-button-menu__danger .p-menu-item-content:hover .p-menu-item-link),
:deep(.actions-button-menu__danger .p-menu-item-content:hover .p-menu-item-icon) {
  color: #be123c !important;
}

:deep(.actions-button-menu__reset .p-menu-item-content:hover) {
  background: #ecfeff !important;
}

:deep(.actions-button-menu__reset .p-menu-item-content:hover .p-menu-item-link),
:deep(.actions-button-menu__reset .p-menu-item-content:hover .p-menu-item-icon) {
  color: #0e7490 !important;
}

@media (max-width: 640px) {
  .actions-button-trigger {
    width: 2.35rem;
    min-width: 2.35rem;
    padding-inline: 0 !important;
  }
}
</style>
