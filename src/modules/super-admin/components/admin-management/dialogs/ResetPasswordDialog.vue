<script setup>
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'ResetPasswordDialog',
})

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  confirmPassword: {
    type: String,
    default: '',
  },
  reason: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:visible',
  'update:password',
  'update:confirmPassword',
  'update:reason',
  'confirm',
  'cancel',
])
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="title"
    class="reset-password-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="reset-password-dialog__content">
      <p class="reset-password-dialog__description">
        {{ description }}
      </p>

      <label class="reset-password-dialog__field">
        <span>New password</span>
        <Password
          :model-value="password"
          autocomplete="new-password"
          :feedback="false"
          toggle-mask
          fluid
          placeholder="Enter a new password"
          @update:model-value="emit('update:password', $event)"
        />
      </label>

      <label class="reset-password-dialog__field">
        <span>Confirm password</span>
        <Password
          :model-value="confirmPassword"
          autocomplete="new-password"
          :feedback="false"
          toggle-mask
          fluid
          placeholder="Confirm the new password"
          @update:model-value="emit('update:confirmPassword', $event)"
        />
      </label>

      <label class="reset-password-dialog__field">
        <span>Reason</span>
        <Textarea
          :model-value="reason"
          auto-resize
          rows="4"
          placeholder="Why is the password being reset?"
          @update:model-value="emit('update:reason', $event)"
        />
      </label>

      <div
        v-if="errorMessage"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        {{ errorMessage }}
      </div>
    </div>

    <template #footer>
      <Button type="button" variant="outline" rounded="xl" @click="emit('cancel')">
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        rounded="xl"
        :loading="loading"
        :disabled="loading || !password || !confirmPassword || !reason"
        @click="emit('confirm')"
      >
        Reset password
      </Button>
    </template>
  </Dialog>
</template>

<style scoped>
.reset-password-dialog__content {
  display: grid;
  gap: 1rem;
  min-width: min(100vw - 2rem, 34rem);
}

.reset-password-dialog__description {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
}

.reset-password-dialog__field {
  display: grid;
  gap: 0.45rem;
}

.reset-password-dialog__field > span {
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

:deep(.reset-password-dialog .p-dialog-content) {
  padding-top: 0.25rem;
}

@media (max-width: 640px) {
  .reset-password-dialog__content {
    min-width: 0;
  }
}
</style>
