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
})

const emit = defineEmits(['view', 'edit', 'delete'])
</script>

<template>
  <ActionsButton
    :item="item"
    :show-view="showViewAction"
    :show-edit="showEditAction"
    :show-delete="showDeleteAction"
    @view="emit('view', item)"
    @edit="emit('edit', item)"
    @delete="emit('delete', item)"
  />
</template>
