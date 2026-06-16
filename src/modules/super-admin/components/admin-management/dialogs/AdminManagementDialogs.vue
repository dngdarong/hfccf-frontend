<script setup>
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'

defineOptions({
  name: 'AdminManagementDialogs',
})

defineProps({
  deleteShow: {
    type: Boolean,
    default: false,
  },
  deleteLoading: {
    type: Boolean,
    default: false,
  },
  deleteTitle: {
    type: String,
    default: '',
  },
  deleteMessage: {
    type: String,
    default: '',
  },
  deleteConfirmText: {
    type: String,
    default: '',
  },
  deleteCancelText: {
    type: String,
    default: '',
  },
  successShow: {
    type: Boolean,
    default: false,
  },
  successTitle: {
    type: String,
    default: '',
  },
  successMessage: {
    type: String,
    default: '',
  },
  successButtonText: {
    type: String,
    default: '',
  },
  errorShow: {
    type: Boolean,
    default: false,
  },
  errorTitle: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
  errorButtonText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['confirm-delete', 'cancel-delete', 'close-success', 'close-error'])
</script>

<template>
  <AlertQuestion
    :show="deleteShow"
    :loading="deleteLoading"
    :title="deleteTitle"
    :message="deleteMessage"
    :confirm-text="deleteConfirmText"
    :cancel-text="deleteCancelText"
    type="danger"
    @confirm="emit('confirm-delete')"
    @cancel="emit('cancel-delete')"
  />

  <AlertSuccess
    :show="successShow"
    :title="successTitle"
    :message="successMessage"
    :button-text="successButtonText"
    @close="emit('close-success')"
  />

  <AlertError
    :show="errorShow"
    :title="errorTitle"
    :message="errorMessage"
    :button-text="errorButtonText"
    @close="emit('close-error')"
  />
</template>
