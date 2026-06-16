<script setup>
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Button from '@/components/buttons/Button.vue'
import { useVerifyCode } from '@/modules/auth/composables/useVerifyCode'

const props = defineProps({
  email: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  resendLoading: {
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
  countdownSeconds: {
    type: Number,
    default: 60,
  },
  t: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['verify', 'resend', 'back'])

const {
  form,
  secondsLeft,
  codeError,
  canVerify,
  canResend,
  formattedTimer,
  touchCode,
  onCodeInput,
  onSubmit,
  onResend,
} = useVerifyCode(props, emit)
</script>

<template>
  <div class="verify-code mx-auto w-full max-w-md">
    <Card class="verify-code-card border-0">
      <template #content>
        <form class="verify-code-fields" @submit.prevent="onSubmit">
          <div class="verify-code-header">
            <button
              type="button"
              class="verify-code-back"
              :aria-label="t('auth.forgotPassword.verifyCode.changeEmail')"
              @click="$emit('back')"
            >
              <i class="pi pi-arrow-left" aria-hidden="true"></i>
            </button>

            <div class="verify-code-badge" aria-hidden="true">
              <i class="pi pi-key"></i>
            </div>

            <div>
              <p class="verify-code-eyebrow">
                {{ t('auth.forgotPassword.verifyCode.eyebrow') }}
              </p>
              <h2>{{ t('auth.forgotPassword.verifyCode.title') }}</h2>
            </div>
          </div>

          <p class="verify-code-copy">
            {{ t('auth.forgotPassword.verifyCode.copy') }} <strong>{{ email }}</strong>.
          </p>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <Message v-if="successMessage" severity="success" :closable="false">
            {{ successMessage }}
          </Message>

          <div class="verify-code-field">
            <label for="verifyCode">
              {{ t('auth.forgotPassword.verifyCode.label') }}
            </label>

            <div class="verify-code-control">
              <i class="pi pi-lock verify-code-control-icon" aria-hidden="true"></i>

              <InputText
                id="verifyCode"
                :model-value="form.code"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                class="verify-code-input w-full"
                :class="{ 'verify-code-input--invalid': codeError }"
                :aria-invalid="Boolean(codeError)"
                :aria-describedby="codeError ? 'verify-code-error' : undefined"
                :placeholder="t('auth.forgotPassword.verifyCode.placeholder')"
                @update:model-value="onCodeInput"
                @blur="touchCode"
              />
            </div>

            <p v-if="codeError" id="verify-code-error" class="verify-code-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ codeError }}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            rounded="xl"
            block
            :disabled="!canVerify"
            :loading="loading"
          >
            <template #iconLeft>
              <i class="pi pi-check-circle" aria-hidden="true"></i>
            </template>

            {{ t('auth.forgotPassword.verifyCode.submit') }}
          </Button>

          <button type="button" class="verify-code-resend" :disabled="!canResend" @click="onResend">
            {{
              resendLoading
                ? t('auth.forgotPassword.verifyCode.sending')
                : secondsLeft > 0
                  ? t('auth.forgotPassword.verifyCode.resendIn', { time: formattedTimer })
                  : t('auth.forgotPassword.verifyCode.resend')
            }}
          </button>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.verify-code-card.p-card) {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 1.35rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95)),
    linear-gradient(135deg, rgba(0, 174, 239, 0.07), transparent 42%);
  box-shadow: 0 18px 38px -30px rgba(15, 23, 42, 0.34);
}

:deep(.verify-code-card.p-card .p-card-body) {
  padding: 0;
}

:deep(.verify-code-card.p-card .p-card-content) {
  padding: 1.35rem;
}

.verify-code-fields {
  display: grid;
  gap: 1rem;
}

.verify-code-header {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.1rem;
}

.verify-code-back,
.verify-code-badge {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(203, 213, 225, 0.85);
  background: #ffffff;
  color: #0ea5e9;
  box-shadow: 0 12px 22px -18px rgba(15, 23, 42, 0.3);
}

.verify-code-back {
  height: 2.45rem;
  width: 2.45rem;
  border-radius: 999px;
  cursor: pointer;
}

.verify-code-badge {
  height: 3rem;
  width: 3rem;
  border-radius: 1rem;
}

.verify-code-eyebrow {
  margin: 0;
  color: #0369a1;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.verify-code-header h2 {
  margin: 0.25rem 0 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.verify-code-copy {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.55;
}

.verify-code-copy strong {
  color: #0f172a;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.verify-code-field {
  display: grid;
  gap: 0.45rem;
}

.verify-code-field label {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 800;
}

.verify-code-control {
  position: relative;
}

.verify-code-control-icon {
  position: absolute;
  top: 50%;
  left: 0.95rem;
  z-index: 2;
  color: #0ea5e9;
  font-size: 0.95rem;
  transform: translateY(-50%);
}

:deep(.verify-code-input.p-inputtext) {
  width: 100%;
  min-height: 3.15rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ee;
  background: #ffffff;
  padding: 0.82rem 0.95rem 0.82rem 2.8rem;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

:deep(.verify-code-input.p-inputtext::placeholder) {
  color: #94a3b8;
}

:deep(.verify-code-input.p-inputtext:enabled:hover) {
  border-color: #7dd3fc;
}

:deep(.verify-code-input.p-inputtext:enabled:focus) {
  border-color: #0ea5e9;
  box-shadow:
    0 0 0 3px rgba(14, 165, 233, 0.14),
    0 12px 22px -20px rgba(14, 165, 233, 0.58);
}

:deep(.verify-code-input--invalid.p-inputtext) {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
}

.verify-code-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #e11d48;
  font-size: 0.78rem;
  font-weight: 800;
}

.verify-code-resend {
  justify-self: center;
  border: 0;
  background: transparent;
  color: #0369a1;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 900;
}

.verify-code-resend:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 639px) {
  :deep(.verify-code-card.p-card .p-card-content) {
    padding: 1rem;
  }

  .verify-code-fields {
    gap: 0.9rem;
  }

  .verify-code-header {
    grid-template-columns: auto 1fr;
  }

  .verify-code-badge {
    display: none;
  }

  :deep(.verify-code-input.p-inputtext) {
    min-height: 2.95rem;
    padding: 0.74rem 0.9rem 0.74rem 2.65rem;
    font-size: 0.92rem;
  }

  .verify-code-control-icon {
    left: 0.9rem;
  }
}
</style>
