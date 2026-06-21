<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'ResetTeacherPasswordDialog',
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  backendError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:visible',
  'confirm',
  'cancel',
])

const { t } = useLanguage()
const password = ref('')
const confirmPassword = ref('')
const reason = ref('')
const validation = ref({
  password: '',
  confirmPassword: '',
  reason: '',
})

const MIN_PASSWORD_LENGTH = 8

function resetForm() {
  password.value = ''
  confirmPassword.value = ''
  reason.value = ''
  validation.value = {
    password: '',
    confirmPassword: '',
    reason: '',
  }
}

function syncVisibleState(visible) {
  if (!visible) {
    resetForm()
  }
}

watch(() => props.visible, syncVisibleState, { immediate: true })

function setValidationError(field, message) {
  validation.value = {
    ...validation.value,
    [field]: message,
  }
}

function clearValidation() {
  validation.value = {
    password: '',
    confirmPassword: '',
    reason: '',
  }
}

function validateForm() {
  clearValidation()

  const normalizedPassword = String(password.value || '')
  const normalizedConfirm = String(confirmPassword.value || '')
  const normalizedReason = String(reason.value || '').trim()

  let isValid = true

  if (!normalizedPassword) {
    setValidationError('password', t('preschoolTeachersManagement.validation.passwordRequired'))
    isValid = false
  } else if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
    setValidationError(
      'password',
      t('preschoolTeachersManagement.validation.passwordTooShort', { count: MIN_PASSWORD_LENGTH }),
    )
    isValid = false
  }

  if (!normalizedConfirm) {
    setValidationError('confirmPassword', t('preschoolTeachersManagement.validation.confirmPasswordRequired'))
    isValid = false
  } else if (normalizedPassword !== normalizedConfirm) {
    setValidationError('confirmPassword', t('preschoolTeachersManagement.validation.passwordMismatch'))
    isValid = false
  }

  if (!normalizedReason) {
    setValidationError('reason', t('preschoolTeachersManagement.validation.reasonRequired'))
    isValid = false
  }

  return {
    isValid,
    payload: {
      password: normalizedPassword,
      password_confirmation: normalizedConfirm,
      reason: normalizedReason,
    },
  }
}

function closeDialog() {
  emit('cancel')
  emit('update:visible', false)
}

function submit() {
  const result = validateForm()
  if (!result.isValid) return

  emit('confirm', result.payload)
}

function onDialogVisibilityChange(visible) {
  emit('update:visible', visible)
  if (!visible) {
    emit('cancel')
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="t('preschoolTeachersManagement.resetPasswordTitle')"
    class="reset-teacher-password-dialog"
    @update:visible="onDialogVisibilityChange"
  >
    <div class="reset-teacher-password-dialog__content">
      <p class="reset-teacher-password-dialog__description">
        {{ t('preschoolTeachersManagement.resetPasswordDescription') }}
      </p>

      <div
        v-if="backendError"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        {{ backendError }}
      </div>

      <label class="reset-teacher-password-dialog__field">
        <span>{{ t('preschoolTeachersManagement.newPassword') }}</span>
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          class="reset-teacher-password-dialog__input"
          :placeholder="t('preschoolTeachersManagement.newPassword')"
        >
        <small v-if="validation.password" class="reset-teacher-password-dialog__error">
          {{ validation.password }}
        </small>
      </label>

      <label class="reset-teacher-password-dialog__field">
        <span>{{ t('preschoolTeachersManagement.confirmPassword') }}</span>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          class="reset-teacher-password-dialog__input"
          :placeholder="t('preschoolTeachersManagement.confirmPassword')"
        >
        <small v-if="validation.confirmPassword" class="reset-teacher-password-dialog__error">
          {{ validation.confirmPassword }}
        </small>
      </label>

      <label class="reset-teacher-password-dialog__field">
        <span>{{ t('preschoolTeachersManagement.reason') }}</span>
        <textarea
          v-model="reason"
          rows="4"
          class="reset-teacher-password-dialog__textarea"
          :placeholder="t('preschoolTeachersManagement.reasonPlaceholder')"
        />
        <small v-if="validation.reason" class="reset-teacher-password-dialog__error">
          {{ validation.reason }}
        </small>
      </label>
    </div>

    <template #footer>
      <Button
        type="button"
        variant="outline"
        rounded="xl"
        :label="t('common.cancel')"
        @click="closeDialog"
      />
      <Button
        type="button"
        variant="primary"
        rounded="xl"
        :loading="loading"
        :label="t('preschoolTeachersManagement.resetPassword')"
        @click="submit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.reset-teacher-password-dialog__content {
  display: grid;
  gap: 1rem;
  min-width: min(100vw - 2rem, 34rem);
}

.reset-teacher-password-dialog__description {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
}

.reset-teacher-password-dialog__field {
  display: grid;
  gap: 0.45rem;
}

.reset-teacher-password-dialog__field > span {
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.reset-teacher-password-dialog__input,
.reset-teacher-password-dialog__textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #ffffff;
  padding: 0.75rem 0.85rem;
  color: #0f172a;
  font-size: 0.92rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.reset-teacher-password-dialog__input:focus,
.reset-teacher-password-dialog__textarea:focus {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.reset-teacher-password-dialog__error {
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 700;
}

:deep(.reset-teacher-password-dialog .p-dialog-content) {
  padding-top: 0.25rem;
}

@media (max-width: 640px) {
  .reset-teacher-password-dialog__content {
    min-width: 0;
  }
}
</style>
