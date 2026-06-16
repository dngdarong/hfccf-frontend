<script setup>
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useLoginForm } from '@/modules/auth/composables/useLoginForm'
import { ROLES } from '@/constants/roles'

const { language } = useLanguage()

const props = defineProps({
  accessPolicy: {
    type: Object,
    default: () => ({
      defaultRedirect: '/module/dashboard',
      recoveryRole: ROLES.SUPER_ADMIN,
      allowedRoles: [],
      requiredPermissionsByRole: {},
    }),
  },
})

const {
  t,
  isKhmer,
  form,
  isSubmitting,
  errorMessage,
  showLoginSuccess,
  canUsePasswordRecovery,
  localizedUserTypeOptions,
  emailError,
  passwordError,
  userTypeError,
  isFormValid,
  localizedSubmitLabel,
  touchField,
  onSubmit,
  onLoginSuccessClose,
} = useLoginForm({
  accessPolicy: props.accessPolicy,
  language,
})
</script>

<template>
  <div class="login-form-root mx-auto w-full max-w-md">
    <Card class="login-form-card border-0">
      <template #content>
        <form class="login-form-fields" :class="{ 'login-form-khmer': isKhmer }" @submit.prevent="onSubmit">
          <div class="login-form-field">
            <div class="login-form-label-row">
              <label for="email">{{ t('auth.loginForm.emailLabel') }}</label>
            </div>
            <div class="login-form-control">
              <i class="pi pi-envelope login-form-control-icon" aria-hidden="true"></i>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="login-form-input w-full"
                :class="{ 'login-form-input--invalid': emailError }"
                :aria-invalid="Boolean(emailError)"
                :aria-describedby="emailError ? 'email-error' : undefined"
                :placeholder="t('auth.loginForm.emailPlaceholder')"
                @blur="touchField('email')"
              />
            </div>
            <p v-if="emailError" id="email-error" class="login-form-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ emailError }}
            </p>
          </div>

          <div class="login-form-field">
            <div class="login-form-label-row">
              <label for="password">{{ t('auth.loginForm.passwordLabel') }}</label>
            </div>
            <div class="login-form-control">
              <i class="pi pi-key login-form-control-icon" aria-hidden="true"></i>
              <Password
                id="password"
                v-model="form.password"
                class="w-full login-form-password"
                autocomplete="current-password"
                :placeholder="t('auth.loginForm.passwordPlaceholder')"
                :feedback="false"
                toggle-mask
                fluid
                :input-class="['w-full', passwordError ? 'login-form-input--invalid' : '']"
                :aria-invalid="Boolean(passwordError)"
                :aria-describedby="passwordError ? 'password-error' : undefined"
                @blur="touchField('password')"
              />
            </div>
            <p v-if="passwordError" id="password-error" class="login-form-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ passwordError }}
            </p>
          </div>

          <div class="login-form-field">
            <div class="login-form-label-row">
              <label for="userType">{{ t('auth.loginForm.userTypeLabel') }}</label>
            </div>
            <div class="login-form-control">
              <i class="pi pi-id-card login-form-control-icon" aria-hidden="true"></i>
              <Select
                id="userType"
                v-model="form.userType"
                :options="localizedUserTypeOptions"
                option-label="displayLabel"
                option-value="value"
                append-to="self"
                class="login-form-input w-full"
                :class="{ 'login-form-input--invalid': userTypeError }"
                :aria-invalid="Boolean(userTypeError)"
                :aria-describedby="userTypeError ? 'user-type-error' : undefined"
                :placeholder="t('auth.loginForm.userTypePlaceholder')"
                @blur="touchField('userType')"
              />
            </div>
            <p v-if="userTypeError" id="user-type-error" class="login-form-error">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              {{ userTypeError }}
            </p>
          </div>

          <div class="login-form-actions">
              <label
                for="rememberMe"
                class="login-form-remember"
              >
                <Checkbox
                  v-model="form.remember"
                  binary
                  input-id="rememberMe"
                  name="rememberMe"
                  :aria-label="t('auth.loginForm.rememberMe')"
                />

                <span>
                  {{ t('auth.loginForm.rememberMe') }}
                </span>
              </label>

            <RouterLink
              v-if="canUsePasswordRecovery"
              :to="{ name: 'forgot-password' }"
              class="font-semibold text-sky-700 transition hover:text-sky-800 max-sm:self-start"
            >
              {{ t('auth.loginForm.forgot') }}
            </RouterLink>
          </div>

          <Message v-if="errorMessage" severity="error" :closable="false" class="login-form-message">
            {{ errorMessage }}
          </Message>

          <Loading
            v-if="isSubmitting"
            class="login-form-loading"
            :label="t('auth.loginForm.loading')"
            size="sm"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            rounded="xl"
            block
            :disabled="!isFormValid"
            :loading="isSubmitting"
            class="login-form-submit"
          >
            <template #iconLeft>
              <i class="pi pi-sign-in" aria-hidden="true"></i>
            </template>
            {{ localizedSubmitLabel }}
          </Button>
        </form>
      </template>
    </Card>

    <AlertSuccess
      :show="showLoginSuccess"
      :title="t('auth.loginForm.signedInTitle')"
      :message="t('auth.loginForm.redirecting')"
      :button-text="t('auth.loginForm.continue')"
      :auto-close="900"
      @close="onLoginSuccessClose"
    />
  </div>
</template>

<style scoped>
:deep(.login-form-card.p-card) {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 1.35rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95)),
    linear-gradient(135deg, rgba(0, 174, 239, 0.07), transparent 42%);
  box-shadow: 0 18px 38px -30px rgba(15, 23, 42, 0.34);
}

:deep(.login-form-card.p-card .p-card-body) {
  padding: 0;
}

:deep(.login-form-card.p-card .p-card-content) {
  padding: 1.35rem;
}

.login-form-fields {
  display: grid;
  gap: 1rem;
}

.login-form-khmer {
  font-family:
    'Noto Sans Khmer',
    'Khmer OS Siemreap',
    'Khmer OS Battambang',
    'Leelawadee UI',
    sans-serif;
}

.login-form-field {
  display: grid;
  gap: 0.45rem;
}

.login-form-label-row {
  display: flex;
  align-items: center;
}

.login-form-label-row label {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 800;
}

.login-form-control {
  position: relative;
}

.login-form-control-icon {
  position: absolute;
  top: 50%;
  left: 0.95rem;
  z-index: 2;
  color: #0ea5e9;
  font-size: 0.95rem;
  transform: translateY(-50%);
}

:deep(.login-form-card .login-form-input.p-inputtext),
:deep(.login-form-card .p-password-input),
:deep(.login-form-card .login-form-input.p-select) {
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

:deep(.login-form-card .login-form-input.p-inputtext::placeholder),
:deep(.login-form-card .p-password-input::placeholder) {
  color: #94a3b8;
}

:deep(.login-form-card .login-form-input.p-select .p-select-label) {
  display: flex;
  align-items: center;
  min-height: 3.15rem;
  color: #0f172a;
  padding: 0.82rem 0.95rem 0.82rem 2.8rem;
}

:deep(.login-form-card .login-form-input.p-select .p-select-label.p-placeholder) {
  color: #94a3b8;
}

:deep(.login-form-card .login-form-input.p-select .p-select-dropdown) {
  width: 3.05rem;
  background: transparent;
  color: #64748b;
}

:deep(.login-form-card .login-form-input.p-select .p-select-clear-icon) {
  right: 3.05rem;
  color: #94a3b8;
}

:deep(.login-form-card .login-form-input.p-select .p-select-label),
:deep(.login-form-card .login-form-input.p-select .p-select-dropdown),
:deep(.login-form-card .login-form-input.p-select .p-select-dropdown-icon) {
  background: transparent;
}

:deep(.login-form-card .login-form-input.p-inputtext:enabled:hover),
:deep(.login-form-card .p-password-input:enabled:hover),
:deep(.login-form-card .login-form-input.p-select:not(.p-disabled):hover) {
  border-color: #7dd3fc;
  background: #ffffff;
}

:deep(.login-form-card .login-form-input.p-inputtext:enabled:focus),
:deep(.login-form-card .p-password-input:enabled:focus),
:deep(.login-form-card .login-form-input.p-select.p-focus) {
  border-color: #0ea5e9;
  box-shadow:
    0 0 0 3px rgba(14, 165, 233, 0.14),
    0 12px 22px -20px rgba(14, 165, 233, 0.58);
}

:deep(.login-form-password .p-password) {
  width: 100%;
}

/* PrimeVue Checkbox */
:deep(.login-form-card .p-checkbox) {
  display: inline-flex;
  width: 1.2rem;
  height: 1.2rem;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

:deep(.login-form-card .p-checkbox-input) {
  cursor: pointer;
}

:deep(.login-form-card .p-checkbox-box) {
  display: flex;
  width: 1.2rem;
  height: 1.2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: none;
  color: #ffffff;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.login-form-card .p-checkbox:not(.p-disabled) .p-checkbox-box:hover) {
  border-color: #94a3b8;
  background: #ffffff;
}

:deep(.login-form-card .p-checkbox.p-focus .p-checkbox-box),
:deep(.login-form-card .p-checkbox:has(.p-checkbox-input:focus-visible) .p-checkbox-box) {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(125, 211, 252, 0.18);
}

:deep(.login-form-card .p-checkbox.p-highlight .p-checkbox-box),
:deep(.login-form-card .p-checkbox.p-checkbox-checked .p-checkbox-box),
:deep(.login-form-card .p-checkbox:has(.p-checkbox-input:checked) .p-checkbox-box) {
  border-color: #0ea5e9;
  background: #0ea5e9;
}

:deep(.login-form-card .p-checkbox-icon) {
  display: inline-flex;
  color: #ffffff;
  font-size: 0.75rem;
  line-height: 1;
}

:deep(.login-form-card .p-checkbox:not(.p-checkbox-checked):not(.p-highlight) .p-checkbox-icon) {
  opacity: 0;
}

:deep(.login-form-card .p-checkbox.p-checkbox-checked .p-checkbox-icon),
:deep(.login-form-card .p-checkbox.p-highlight .p-checkbox-icon),
:deep(.login-form-card .p-checkbox:has(.p-checkbox-input:checked) .p-checkbox-icon) {
  opacity: 1;
}

:deep(.login-form-card .login-form-input.p-select .p-select-overlay) {
  margin-top: 0.3rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 28px -20px rgba(15, 23, 42, 0.2);
}

:deep(.login-form-card .login-form-input.p-select .p-select-list-container) {
  background: #fff;
  padding: 0.4rem;
}

:deep(.login-form-card .login-form-input.p-select .p-select-option) {
  border-radius: 0.75rem;
  background: #fff;
  color: #0f172a;
}

:deep(.login-form-card .login-form-input.p-select .p-select-option:hover) {
  background: #f8fafc;
}

:deep(.login-form-card .login-form-input.p-select .p-select-option.p-select-option-selected) {
  background: rgba(56, 189, 248, 0.12);
  color: #0369a1;
}

:deep(.login-form-card .login-form-input--invalid.p-inputtext),
:deep(.login-form-card .login-form-input--invalid.p-select),
:deep(.login-form-card .login-form-password .login-form-input--invalid) {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
}

.login-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  padding-top: 0.15rem;
  font-size: 0.9rem;
}

.login-form-remember {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #475569;
  font-weight: 700;
}

.login-form-remember,
.login-form-remember span {
  cursor: pointer;
}

.login-form-remember:focus-visible {
  border-radius: 0.6rem;
  outline: 2px solid rgba(14, 165, 233, 0.45);
  outline-offset: 0.25rem;
}

.login-form-actions a {
  color: #0369a1;
  font-weight: 900;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-form-actions a:hover {
  color: #075985;
}

.login-form-message {
  border-radius: 1rem;
}

.login-form-loading {
  padding: 0.1rem 0;
}

.login-form-submit {
  margin-top: 0.1rem;
}

.login-form-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #e11d48;
  font-size: 0.78rem;
  font-weight: 800;
}

@media (max-width: 639px) {
  :deep(.login-form-card.p-card .p-card-content) {
    padding: 1rem;
  }

  .login-form-fields {
    gap: 0.9rem;
  }

  :deep(.login-form-card .login-form-input.p-inputtext),
  :deep(.login-form-card .p-password-input),
  :deep(.login-form-card .login-form-input.p-select) {
    min-height: 2.95rem;
    padding: 0.74rem 0.9rem 0.74rem 2.65rem;
    font-size: 0.92rem;
  }

  :deep(.login-form-card .login-form-input.p-select .p-select-label) {
    min-height: 2.95rem;
    padding: 0.74rem 0.9rem 0.74rem 2.65rem;
  }

  :deep(.login-form-card .login-form-input.p-select .p-select-dropdown) {
    width: 2.75rem;
  }

  :deep(.login-form-card .login-form-input.p-select .p-select-clear-icon) {
    right: 2.75rem;
  }

  .login-form-control-icon {
    left: 0.9rem;
  }

  .login-form-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 420px) {
  :deep(.login-form-card.p-card .p-card-content) {
    padding: 0.9rem;
  }

  .login-form-error {
    font-size: 0.74rem;
  }
}
</style>
