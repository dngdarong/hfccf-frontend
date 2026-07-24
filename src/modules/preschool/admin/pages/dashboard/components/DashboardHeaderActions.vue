<script setup>
import { ref } from 'vue'
import Menu from 'primevue/menu'
import AppButton from '@/components/ui/AppButton.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'

defineOptions({
  name: 'DashboardHeaderActions',
})

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  showPrimaryAction: {
    type: Boolean,
    default: true,
  },
  primaryLabel: {
    type: String,
    required: true,
  },
  menuLabel: {
    type: String,
    required: true,
  },
  refreshLabel: {
    type: String,
    required: true,
  },
  menuItems: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh', 'primary'])
const menuRef = ref(null)
const menuId = 'preschool-dashboard-toolbar-menu'

function toggleMenu(event) {
  menuRef.value?.toggle(event)
}

function onRefresh() {
  emit('refresh')
}

function onPrimary() {
  emit('primary')
}
</script>

<template>
  <div class="preschool-dashboard-page__actions">
    <AppIconButton
      type="button"
      variant="ghost"
      size="sm"
      class="preschool-dashboard-page__refresh-button"
      :aria-label="refreshLabel"
      :loading="loading"
      @click="onRefresh"
    >
      <template #default>
        <span class="sr-only">{{ refreshLabel }}</span>
        <i class="pi pi-refresh" aria-hidden="true" />
      </template>
    </AppIconButton>
    <span class="sr-only">{{ refreshLabel }}</span>
    <AppButton
      v-if="showPrimaryAction"
      type="button"
      variant="primary"
      size="sm"
      class="preschool-dashboard-page__primary-action"
      @click="onPrimary"
    >
      <template #iconLeft><i class="pi pi-calendar-plus" aria-hidden="true" /></template>
      {{ primaryLabel }}
    </AppButton>
    <AppIconButton
      type="button"
      variant="ghost"
      size="sm"
      class="preschool-dashboard-page__menu-button"
      :aria-label="menuLabel"
      aria-haspopup="menu"
      :aria-controls="menuId"
      @click="toggleMenu"
    >
      <template #default>
        <i class="pi pi-ellipsis-h" aria-hidden="true" />
      </template>
    </AppIconButton>
    <Menu
      :id="menuId"
      ref="menuRef"
      :model="menuItems"
      popup
      class="preschool-dashboard-page__toolbar-menu"
    />
  </div>
</template>
