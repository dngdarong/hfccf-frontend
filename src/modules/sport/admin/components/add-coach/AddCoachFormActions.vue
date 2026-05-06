<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'AddCoachFormActions',
})

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  isViewMode: {
    type: Boolean,
    default: false,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit', 'cancel'])

const { t } = useI18n()
const editLabel = computed(() => t('sportAddCoach.editAction'))
const cancelLabel = computed(() => t('common.cancel'))
const submitLabel = computed(() =>
  t(props.isEditMode ? 'sportAddCoach.updateAction' : 'sportAddCoach.createAction'),
)
</script>

<template>
  <div class="add-coach-form-actions">
    <Button
      v-if="isEditMode"
      type="button"
      variant="outline"
      size="md"
      rounded="xl"
      :disabled="isSubmitting"
      @click="$emit('cancel')"
    >
      {{ cancelLabel }}
    </Button>

    <Button
      v-if="isViewMode"
      type="button"
      variant="primary"
      size="md"
      rounded="xl"
      @click="$emit('edit')"
    >
      {{ editLabel }}
    </Button>

    <Button
      v-else
      type="submit"
      variant="primary"
      size="md"
      rounded="xl"
      :loading="isSubmitting"
      :disabled="isSubmitting"
    >
      {{ submitLabel }}
    </Button>
  </div>
</template>

<style scoped>
.add-coach-form-actions {
  display: contents;
}
</style>
