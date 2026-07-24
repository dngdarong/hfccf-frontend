<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddClassFormActions',
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

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')
</script>

<template>
  <div :class="isKh ? 'add-class-form-actions add-class-form-actions--kh' : 'add-class-form-actions'">
    <template v-if="isViewMode">
      <Button
        type="button"
        variant="outline"
        size="md"
        rounded="xl"
        class="add-class-form-actions__action"
        @click="$emit('back')"
      >
        {{ t('preschoolAddClass.backToClasses') }}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="md"
        rounded="xl"
        class="add-class-form-actions__action add-class-form-actions__action--primary"
        @click="$emit('edit')"
      >
        {{ t('preschoolAddClass.editAction') }}
      </Button>
    </template>
    <template v-else>
      <Button
        type="button"
        variant="outline"
        size="md"
        rounded="xl"
        class="add-class-form-actions__action"
        @click="$emit('back')"
      >
        {{ isEditMode ? t('preschoolAddClass.backToClasses') : t('preschoolAddClass.cancelAction') }}
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="md"
        rounded="xl"
        class="add-class-form-actions__action add-class-form-actions__action--primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting
          ? t('preschoolAddClass.saving')
          : isEditMode
            ? t('preschoolAddClass.updateAction')
            : t('preschoolAddClass.createClass') }}
      </Button>
    </template>
  </div>
</template>

<style scoped>
.add-class-form-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.6rem;
  width: 100%;
}

.add-class-form-actions__action {
  min-width: 10rem;
}

.add-class-form-actions__action--primary {
  box-shadow: 0 10px 24px -18px rgba(15, 23, 42, 0.65);
}

.add-class-form-actions--kh .add-class-form-actions__action {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (min-width: 640px) {
  .add-class-form-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .add-class-form-actions__action {
    width: auto;
  }
}
</style>
