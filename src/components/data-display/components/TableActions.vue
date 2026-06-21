<script setup>
import ActionsButton from '@/components/buttons/ActionsButton.vue'

defineOptions({
  name: 'TableActions',
})

defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  resetLabel: {
    type: String,
    default: '',
  },
  showViewAction: {
    type: Boolean,
    default: true,
  },
  showEditAction: {
    type: Boolean,
    default: true,
  },
  showDeleteAction: {
    type: Boolean,
    default: true,
  },
  showResetAction: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'edit', 'delete', 'reset'])
</script>

<template>
  <ActionsButton
    :item="item"
    :show-view="showViewAction"
    :show-edit="showEditAction"
    :show-delete="showDeleteAction"
    :show-reset="showResetAction"
    :reset-label="resetLabel"
    @view="emit('view', item)"
    @edit="emit('edit', item)"
    @delete="emit('delete', item)"
    @reset="emit('reset', item)"
  />
</template>
