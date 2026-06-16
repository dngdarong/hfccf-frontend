<script setup>
import Card from 'primevue/card'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useCreateNewPassword } from '@/modules/auth/composables/useCreateNewPassword'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  successMessage: {
    type: String,
    default: '',
  },
  t: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['submit', 'back', 'success-close'])

const {
  form,
  passwordError,
  confirmPasswordError,
  isFormValid,
  touchField,
  submitPassword,
} = useCreateNewPassword(props, emit)
</script>

<template>
  <div class="create-password mx-auto w-full max-w-md">
    <Card class="create-password-card border-0">
      <template #content>
        <form class="create-password-fields" @submit.prevent="submitPassword">
          <div class="create-password-header">
            <button
              type="button"
              class="create-password-back"
              :aria-label="t('auth.forgotPassword.createPassword.back')"
              @click="$emit('back')"
            >
              <i class="pi pi-arrow-left" aria-hidden="true"></i>
            </button>

            <div class="create-password-badge" aria-hidden="true">
              <i class="pi pi-lock"></i>
            </div>

            <div>
              <p class="create-password-eyebrow">{{ t('auth.forgotPassword.createPassword.eyebrow') }}</p>
              <h2>{{ t('auth.forgotPassword.createPassword.title') }}</h2>
            </div>
          </div>

          <p class="create-password-copy">
            {{ t('auth.forgotPassword.createPassword.copy') }}
          </p>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>
          <Message v-if="successMessage" severity="success" :closable="false">
            {{ successMessage }}
          </Message>

          <div class="create-password-field">
            <label for="newPassword">{{ t('auth.forgotPassword.createPassword.newPassword') }}</label>
            <div class="create-password-control">
              <i class="pi pi-key create-password-control-icon" aria-hidden="true"></i>
              <Password
                id="newPassword"
                v-model="form.password"
                class="create-password-password w-full"
                autocomplete="new-password"
                :placeholder="t('auth.forgotPassword.createPassword.newPasswordPlaceholder')"
                :feedback="false"
                toggle-mask
                fluid
                :input-class="['w-full', passwordError ? 'create-password-input--invalid' : '']"
                :aria-invalid="Boolean(passwordError)"
                :aria-describedby="passwordError ? 'new-password-error' : undefined"
                @blur="touchField('password')"
              />
            </div>
            <p v-if="passwordError" id="new-password-error" class="create-password-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ passwordError }}
            </p>
          </div>

          <div class="create-password-field">
            <label for="confirmNewPassword">{{ t('auth.forgotPassword.createPassword.confirmPassword') }}</label>
            <div class="create-password-control">
              <i class="pi pi-shield create-password-control-icon" aria-hidden="true"></i>
              <Password
                id="confirmNewPassword"
                v-model="form.confirmPassword"
                class="create-password-password w-full"
                autocomplete="new-password"
                :placeholder="t('auth.forgotPassword.createPassword.confirmPasswordPlaceholder')"
                :feedback="false"
                toggle-mask
                fluid
                :input-class="['w-full', confirmPasswordError ? 'create-password-input--invalid' : '']"
                :aria-invalid="Boolean(confirmPasswordError)"
                :aria-describedby="confirmPasswordError ? 'confirm-password-error' : undefined"
                @blur="touchField('confirmPassword')"
              />
            </div>
            <p v-if="confirmPasswordError" id="confirm-password-error" class="create-password-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ confirmPasswordError }}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            rounded="xl"
            block
            :disabled="!isFormValid"
            :loading="loading"
          >
            <template #iconLeft>
              <i class="pi pi-check-circle" aria-hidden="true"></i>
            </template>
            {{ t('auth.forgotPassword.createPassword.submit') }}
          </Button>
        </form>
      </template>
    </Card>

    <AlertSuccess
      :show="Boolean(successMessage)"
      :title="t('auth.forgotPassword.createPassword.successTitle')"
      :message="successMessage || t('auth.forgotPassword.createPassword.successFallback')"
      :button-text="t('auth.forgotPassword.createPassword.backToLogin')"
      @close="$emit('success-close')"
    />
  </div>
</template>

<style scoped>
:deep(.create-password-card.p-card) {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 1.35rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95)),
    linear-gradient(135deg, rgba(0, 174, 239, 0.07), transparent 42%);
  box-shadow: 0 18px 38px -30px rgba(15, 23, 42, 0.34);
}

:deep(.create-password-card.p-card .p-card-body) {
  padding: 0;
}

:deep(.create-password-card.p-card .p-card-content) {
  padding: 1.35rem;
}

.create-password-fields {
  display: grid;
  gap: 1rem;
}

.create-password-header {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.1rem;
}

.create-password-back,
.create-password-badge {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(203, 213, 225, 0.85);
  background: #ffffff;
  color: #0ea5e9;
  box-shadow: 0 12px 22px -18px rgba(15, 23, 42, 0.3);
}

.create-password-back {
  height: 2.45rem;
  width: 2.45rem;
  border-radius: 999px;
  cursor: pointer;
}

.create-password-badge {
  height: 3rem;
  width: 3rem;
  border-radius: 1rem;
}

.create-password-eyebrow {
  margin: 0;
  color: #0369a1;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.create-password-header h2 {
  margin: 0.25rem 0 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.create-password-copy {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.55;
}

.create-password-field {
  display: grid;
  gap: 0.45rem;
}

.create-password-field label {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 800;
}

.create-password-control {
  position: relative;
}

.create-password-control-icon {
  position: absolute;
  top: 50%;
  left: 0.95rem;
  z-index: 2;
  color: #0ea5e9;
  font-size: 0.95rem;
  transform: translateY(-50%);
}

:deep(.create-password-password .p-password) {
  width: 100%;
}

:deep(.create-password-card .p-password-input) {
  width: 100%;
  min-height: 3.15rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ee;
  background: #ffffff;
  padding: 0.82rem 0.95rem 0.82rem 2.8rem;
  color: #0f172a;
  font-size: 0.95rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

:deep(.create-password-card .p-password-input::placeholder) {
  color: #94a3b8;
}

:deep(.create-password-card .p-password-input:enabled:hover) {
  border-color: #7dd3fc;
}

:deep(.create-password-card .p-password-input:enabled:focus) {
  border-color: #0ea5e9;
  box-shadow:
    0 0 0 3px rgba(14, 165, 233, 0.14),
    0 12px 22px -20px rgba(14, 165, 233, 0.58);
}

:deep(.create-password-card .create-password-input--invalid) {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
}

.create-password-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #e11d48;
  font-size: 0.78rem;
  font-weight: 800;
}

@media (max-width: 639px) {
  :deep(.create-password-card.p-card .p-card-content) {
    padding: 1rem;
  }

  .create-password-fields {
    gap: 0.9rem;
  }

  .create-password-header {
    grid-template-columns: auto 1fr;
  }

  .create-password-badge {
    display: none;
  }

  :deep(.create-password-card .p-password-input) {
    min-height: 2.95rem;
    padding: 0.74rem 0.9rem 0.74rem 2.65rem;
    font-size: 0.92rem;
  }

  .create-password-control-icon {
    left: 0.9rem;
  }
}
</style>
