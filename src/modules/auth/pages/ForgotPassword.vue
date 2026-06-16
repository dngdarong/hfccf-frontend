<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/feedback/Loading.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CreateNewPassword from '@/modules/auth/components/CreateNewPassword.vue'
import VerifyCode from '@/modules/auth/components/VerifyCode.vue'
import VerifyEmail from '@/modules/auth/components/VerifyEmail.vue'
import { useLanguage } from '@/composables/useLanguage'
import { requestPasswordReset, resetPassword, verifyPasswordResetOtp } from '@/services/auth'

const router = useRouter()
const { t, language } = useLanguage()

const recoveryPolicy = Object.freeze({
  otpLength: 6,
  minPasswordLength: 8,
})

const email = ref('')
const emailVerified = ref(false)
const otpVerified = ref(false)

const isOtpStep = ref(false)
const isPasswordStep = ref(false)

const isVerifying = ref(false)
const isResending = ref(false)
const isSavingPassword = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const verifiedCode = ref('')

const isRecoveryLoading = computed(
  () => isResending.value || isVerifying.value || isSavingPassword.value,
)

const recoveryLoadingLabel = computed(() => {
  if (isSavingPassword.value) {
    return t('auth.forgotPassword.loading.savingPassword')
  }

  if (isVerifying.value) {
    return t('auth.forgotPassword.loading.verifyingOtp')
  }

  if (isResending.value) {
    return t('auth.forgotPassword.loading.sendingOtp')
  }

  return t('auth.forgotPassword.loading.default')
})

const isKhmer = computed(() => language.value === 'KH')

const stepTitle = computed(() => {
  if (isPasswordStep.value) {
    return t('auth.forgotPassword.steps.password')
  }

  if (isOtpStep.value) {
    return t('auth.forgotPassword.steps.otp')
  }

  return t('auth.forgotPassword.steps.email')
})

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function resetRecoveryState({ keepEmail = false } = {}) {
  if (!keepEmail) {
    email.value = ''
  }

  emailVerified.value = false
  otpVerified.value = false

  isOtpStep.value = false
  isPasswordStep.value = false

  verifiedCode.value = ''
}

function isRecoverySessionReady() {
  return Boolean(emailVerified.value && normalizeEmail(email.value))
}

async function onEmailAccepted(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  const requestEmail = normalizeEmail(payload?.email)

  isResending.value = true

  try {
    const result = await requestPasswordReset(requestEmail)

    email.value = normalizeEmail(result.email || requestEmail)

    verifiedCode.value = ''

    emailVerified.value = true
    otpVerified.value = false

    isOtpStep.value = true
    isPasswordStep.value = false

    successMessage.value = t(
      'auth.forgotPassword.success.codeSent',
      {
        email: email.value,
      },
    )
  } catch (error) {
    resetRecoveryState({ keepEmail: true })

    errorMessage.value =
      error.message ||
      t('auth.forgotPassword.errors.inactiveAccount')
  } finally {
    isResending.value = false
  }
}

function onBackToEmail() {
  resetRecoveryState({ keepEmail: true })

  errorMessage.value = ''
  successMessage.value = ''
}

function onBackToOtp() {
  isOtpStep.value = true
  isPasswordStep.value = false

  otpVerified.value = false
  verifiedCode.value = ''

  errorMessage.value = ''
  successMessage.value = ''
}

async function onVerify(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isRecoverySessionReady()) {
    resetRecoveryState({ keepEmail: true })

    errorMessage.value = t(
      'auth.forgotPassword.errors.startWithEmail',
    )

    return
  }

  const submittedCode = String(payload?.code || '')
    .replace(/\D/g, '')

  if (
    normalizeEmail(payload?.email) !== normalizeEmail(email.value) ||
    submittedCode.length !== recoveryPolicy.otpLength
  ) {
    errorMessage.value = t(
      'auth.forgotPassword.errors.invalidOtp',
    )

    return
  }

  isVerifying.value = true

  try {
    await verifyPasswordResetOtp({
      email: email.value,
      code: submittedCode,
    })

    otpVerified.value = true
    verifiedCode.value = submittedCode

    isPasswordStep.value = true

    successMessage.value = ''
  } catch (error) {
    errorMessage.value =
      error.message ||
      t('auth.forgotPassword.errors.invalidOtp')
  } finally {
    isVerifying.value = false
  }
}

async function onCreatePassword(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !isRecoverySessionReady() ||
    !otpVerified.value ||
    !verifiedCode.value
  ) {
    errorMessage.value = t(
      'auth.forgotPassword.errors.verifyBeforePassword',
    )

    isOtpStep.value = true
    isPasswordStep.value = false

    return
  }

  const newPassword = String(payload?.password || '')

  if (
    newPassword.length <
    recoveryPolicy.minPasswordLength
  ) {
    errorMessage.value = t(
      'auth.forgotPassword.errors.minPassword',
      {
        count: recoveryPolicy.minPasswordLength,
      },
    )

    return
  }

  isSavingPassword.value = true

  try {
    await resetPassword({
      email: email.value,
      code: verifiedCode.value,
      password: newPassword,
      password_confirmation: newPassword,
    })

    successMessage.value = t(
      'auth.forgotPassword.success.passwordUpdated',
    )
  } catch (error) {
    errorMessage.value =
      error.message ||
      t('auth.forgotPassword.errors.verifyBeforePassword')
  } finally {
    isSavingPassword.value = false
  }
}

async function onPasswordSuccessClose() {
  await router.push({
    name: 'login',
  })
}

async function onResend(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  const requestEmail = normalizeEmail(payload?.email)

  if (
    !isRecoverySessionReady() ||
    requestEmail !== normalizeEmail(email.value)
  ) {
    errorMessage.value = t(
      'auth.forgotPassword.errors.verifiedEmailRequired',
    )

    return
  }

  isResending.value = true

  try {
    await requestPasswordReset(requestEmail)

    verifiedCode.value = ''
    otpVerified.value = false

    successMessage.value = t(
      'auth.forgotPassword.success.codeSent',
      {
        email: requestEmail,
      },
    )
  } catch (error) {
    errorMessage.value =
      error.message ||
      t('auth.forgotPassword.errors.verifiedEmailRequired')
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <main
      :class="[
        'forgot-page relative flex min-h-screen items-center overflow-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-8',
        { 'forgot-page--kh': isKhmer },
      ]"
    >
      <section class="forgot-page-shell relative z-10 mx-auto grid w-full max-w-4xl overflow-hidden lg:grid-cols-[0.85fr_1.15fr]">
        <aside class="forgot-page-brand hidden min-h-[520px] flex-col justify-between lg:flex">
          <div aria-hidden="true"></div>

          <div class="forgot-page-brand-center">
            <div class="forgot-page-logo">
              <img src="@/assets/images/logo.jpg" alt="HFCCF" class="h-20 w-auto" />
            </div>
            <div class="forgot-page-copy">
              <p class="forgot-page-eyebrow">{{ t('auth.forgotPassword.brand.eyebrow') }}</p>
              <h1>{{ t('auth.forgotPassword.brand.title') }}</h1>
              <p>{{ t('auth.forgotPassword.brand.subtitle') }}</p>
            </div>
          </div>

          <div class="forgot-page-note">
            <i class="pi pi-shield" aria-hidden="true"></i>
            <span>{{ t('auth.forgotPassword.brand.note') }}</span>
          </div>
        </aside>

        <div class="forgot-page-panel">
          <div class="forgot-page-content">
            <div class="forgot-page-mobile-header lg:hidden">
              <div class="forgot-page-logo forgot-page-logo--compact">
                <img src="@/assets/images/logo.jpg" alt="HFCCF" class="h-9 w-auto" />
              </div>
            </div>

            <div class="forgot-page-title">
              <p class="forgot-page-eyebrow">{{ t('auth.forgotPassword.titleEyebrow') }}</p>
              <h2>{{ stepTitle }}</h2>
            </div>

            <Loading
              v-if="isRecoveryLoading"
              class="forgot-page-loading"
              :label="recoveryLoadingLabel"
              size="sm"
            />

            <VerifyEmail
              v-if="!isOtpStep && !isPasswordStep"
              v-model:email="email"
              :loading="isResending"
              :error-message="errorMessage"
              :success-message="successMessage"
              :t="t"
              @submit="onEmailAccepted"
            />

            <VerifyCode
                v-else-if="isOtpStep && !isPasswordStep"
                :email="email"
                :loading="isVerifying"
                :resend-loading="isResending"
                :error-message="errorMessage"
                :success-message="successMessage"
                :t="t"
                @verify="onVerify"
                @resend="onResend"
                @back="onBackToEmail"
              />

            <CreateNewPassword
              v-else
              :loading="isSavingPassword"
              :error-message="errorMessage"
              :success-message="successMessage"
              :t="t"
              @submit="onCreatePassword"
              @back="onBackToOtp"
              @success-close="onPasswordSuccessClose"
            />
          </div>
        </div>
      </section>
    </main>
  </AuthLayout>
</template>

<style scoped>
.forgot-page {
  background:
    linear-gradient(135deg, rgba(0, 174, 239, 0.08) 0 18%, transparent 18% 100%),
    linear-gradient(315deg, rgba(253, 193, 22, 0.12) 0 14%, transparent 14% 100%),
    linear-gradient(180deg, #f8fcff 0%, #eef6fb 100%);
}

.forgot-page--kh {
  font-family:
    'Noto Sans Khmer',
    'Khmer OS Siemreap',
    'Khmer OS Battambang',
    'Leelawadee UI',
    sans-serif;
}

.forgot-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgba(14, 165, 233, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.07) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.68), transparent 78%);
}

.forgot-page-shell {
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.84);
  color: #0f172a;
  box-shadow: 0 30px 70px -42px rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(16px);
}

.forgot-page-shell::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.35rem;
  content: '';
  background: linear-gradient(180deg, var(--hope-o-cyan-blue), var(--hope-h-lime-green), var(--hope-e-golden-yellow));
}

.forgot-page-brand {
  position: relative;
  padding: 1.45rem 1.25rem 1.45rem 1.55rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.88), rgba(236, 251, 255, 0.78)),
    repeating-linear-gradient(135deg, rgba(0, 174, 239, 0.08) 0 1px, transparent 1px 14px);
}

.forgot-page-brand-center {
  display: grid;
  min-height: 22rem;
  place-items: center;
  align-content: center;
  gap: 1rem;
  text-align: center;
}

.forgot-page-logo {
  display: inline-flex;
  min-width: 8.5rem;
  min-height: 7.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1.35rem;
  background: #ffffff;
  box-shadow: 0 22px 42px -28px rgba(15, 23, 42, 0.35);
}

.forgot-page-logo--compact {
  min-width: 3rem;
  min-height: 2.85rem;
  border-radius: 1rem;
  box-shadow: 0 10px 22px -18px rgba(15, 23, 42, 0.32);
}

.forgot-page-copy {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  max-width: 16rem;
}

.forgot-page-copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1.15;
}

.forgot-page-copy p:last-child {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.55;
}

.forgot-page-eyebrow {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 999px;
  background: rgba(240, 249, 255, 0.92);
  padding: 0.28rem 0.75rem;
  color: #0369a1;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.forgot-page-note {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
  padding: 0.9rem;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 800;
}

.forgot-page-note .pi {
  display: inline-grid;
  height: 2rem;
  width: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: #f8fafc;
  color: #0ea5e9;
}

.forgot-page-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520px;
  padding: 1.4rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92)),
    linear-gradient(90deg, rgba(141, 198, 63, 0.08), transparent 42%);
}

.forgot-page-content {
  width: 100%;
  max-width: 28rem;
  padding: 0.75rem;
}

.forgot-page-mobile-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.forgot-page-title {
  margin-bottom: 1rem;
  padding-inline: 0.25rem;
}

.forgot-page-title h2 {
  margin: 0.5rem 0 0;
  color: #0f172a;
  font-size: 1.85rem;
  font-weight: 900;
  line-height: 1.1;
}

.forgot-page-loading {
  margin-bottom: 1rem;
  border: 1px solid rgba(14, 165, 233, 0.14);
  border-radius: 1rem;
  background: rgba(240, 249, 255, 0.74);
  padding: 0.7rem 0.85rem;
}

@media (max-width: 1023px) {
  .forgot-page-shell {
    max-width: 32rem;
    border-radius: 1.25rem;
  }

  .forgot-page-panel {
    min-height: auto;
    padding: 1.15rem;
  }

  .forgot-page-content {
    padding: 0.5rem;
  }
}

@media (max-width: 639px) {
  .forgot-page {
    align-items: flex-start;
    padding: 0.85rem;
  }

  .forgot-page-shell {
    border-radius: 1.1rem;
    box-shadow: 0 18px 40px -30px rgba(15, 23, 42, 0.35);
  }

  .forgot-page-shell::before {
    width: 100%;
    height: 0.28rem;
  }

  .forgot-page-panel {
    padding: 0.9rem 0.75rem;
  }

  .forgot-page-content {
    padding: 0.2rem;
  }
}
</style>
