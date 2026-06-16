<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'AddTeacherFormActions',
})

defineProps({
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

defineEmits(['back', 'edit'])

const { t } = useLanguage()

const backLabel = computed(() => t('preschoolAddTeacher.buttons.backToTeachers'))
const editLabel = computed(() => t('preschoolAddTeacher.buttons.editTeacher'))
const submitLabel = computed(() => t('preschoolAddTeacher.buttons.addTeacher'))
const updateLabel = computed(() => t('preschoolAddTeacher.buttons.updateTeacher'))
const cancelLabel = computed(() => t('common.cancel'))
</script>

<template>
  <div class="add-teacher-form-actions">
    <Button
      type="button"
      variant="outline"
      size="md"
      rounded="xl"
      :disabled="isSubmitting"
      @click="$emit('back')"
    >
      {{ isViewMode ? backLabel : cancelLabel }}
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
      {{ isEditMode ? updateLabel : submitLabel }}
    </Button>
  </div>
</template>

<style scoped>
.add-teacher-form-actions {
  display: contents;
}
</style>
