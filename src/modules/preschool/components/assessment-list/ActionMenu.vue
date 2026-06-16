<script setup>
import { computed, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Menu from 'primevue/menu'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentActionMenu',
})

const props = defineProps({
  assessment: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canFinalize: {
    type: Boolean,
    default: false,
  },
  canArchive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'finalize', 'archive', 'view'])

const menuRef = ref(null)
const { t } = useLanguage()

const items = computed(() => {
  const list = [
    {
      label: t('assessmentList.table.actionViewDetails'),
      icon: 'pi pi-eye',
      command: () => emit('view', props.assessment),
    },
  ]

  if (props.canEdit) {
    list.push({
      label: t('assessmentList.table.actionEdit'),
      icon: 'pi pi-pencil',
      command: () => emit('edit', props.assessment),
    })
  }

  if (props.canFinalize) {
    list.push({
      label: t('assessmentList.table.actionFinalize'),
      icon: 'pi pi-check',
      command: () => emit('finalize', props.assessment),
    })
  }

  if (props.canArchive) {
    list.push(
      { separator: true },
      {
        label: t('assessmentList.table.actionArchive'),
        icon: 'pi pi-trash',
        command: () => emit('archive', props.assessment),
      },
    )
  }

  return list
})

function toggle(event) {
  menuRef.value?.toggle(event)
}
</script>

<template>
  <div>
    <Button
      icon="pi pi-ellipsis-v"
      rounded="full"
      variant="text"
      size="sm"
      :aria-label="t('assessmentList.table.openActions')"
      @click="toggle"
    />

    <Menu
      ref="menuRef"
      :model="items"
      :popup="true"
    />
  </div>
</template>
