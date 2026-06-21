<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Card from 'primevue/card'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Button from '@/components/buttons/Button.vue'
import { changePassword, requiresPasswordChange } from '@/services/auth'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const authStore = useUserStore()
const { t } = useI18n()

const form = reactive({
  currentPassword: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordMismatch = computed(
  () => !form.password || !form.confirmPassword || form.password === form.confirmPassword,
)

const isFormValid = computed(
  () =>
    Boolean(form.currentPassword) &&
    Boolean(form.password) &&
    Boolean(form.confirmPassword) &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword,
)

onMounted(() => {
  if (!requiresPasswordChange(authStore.currentUser)) {
    void router.replace({ name: 'dashboard' })
  }
})

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = t('pages.profile.security.passwordMismatchHint')
    return
  }

  isSubmitting.value = true

  try {
    await changePassword({
      current_password: form.currentPassword,
      password: form.password,
      password_confirmation: form.confirmPassword,
    })

    successMessage.value = 'Password updated successfully.'

    await authStore.fetchAuthenticatedUser()
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error?.message || t('common.error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <main class="force-password-change min-h-screen px-4 py-8">
      <section class="force-password-change__shell">
        <Card class="force-password-change__card border-0">
          <template #content>
            <div class="force-password-change__eyebrow">
              <i class="pi pi-lock" aria-hidden="true" />
              {{ t('auth.login.staffPortal') }}
            </div>

            <h1 class="force-password-change__title">
              Change your password
            </h1>

            <p class="force-password-change__description">
              Your password was reset by an administrator. Set a new password before continuing.
            </p>

            <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
              {{ errorMessage }}
            </Message>

            <Message v-if="successMessage" severity="success" :closable="false" class="mb-4">
              {{ successMessage }}
            </Message>

            <form class="force-password-change__form" @submit.prevent="submitForm">
              <label class="force-password-change__field">
                <span>{{ t('pages.profile.security.currentPassword') }}</span>
                <Password
                  v-model="form.currentPassword"
                  autocomplete="current-password"
                  :feedback="false"
                  toggle-mask
                  fluid
                  :placeholder="t('pages.profile.security.currentPasswordPlaceholder')"
                />
              </label>

              <label class="force-password-change__field">
                <span>{{ t('pages.profile.security.newPassword') }}</span>
                <Password
                  v-model="form.password"
                  autocomplete="new-password"
                  :feedback="false"
                  toggle-mask
                  fluid
                  :placeholder="t('pages.profile.security.newPasswordPlaceholder')"
                />
              </label>

              <label class="force-password-change__field">
                <span>{{ t('pages.profile.security.confirmNewPassword') }}</span>
                <Password
                  v-model="form.confirmPassword"
                  autocomplete="new-password"
                  :feedback="false"
                  toggle-mask
                  fluid
                  :placeholder="t('pages.profile.security.confirmNewPasswordPlaceholder')"
                />
              </label>

              <p v-if="!passwordMismatch" class="force-password-change__hint">
                {{ t('pages.profile.security.passwordMismatchHint') }}
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                rounded="xl"
                block
                :loading="isSubmitting"
                :disabled="!isFormValid || isSubmitting"
              >
                {{ t('common.saveChanges') }}
              </Button>
            </form>
          </template>
        </Card>
      </section>
    </main>
  </AuthLayout>
</template>

<style scoped>
.force-password-change {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fcff 0%, #eef6fb 100%);
}

.force-password-change__shell {
  width: min(100%, 34rem);
}

:deep(.force-password-change__card.p-card) {
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 1.4rem;
  box-shadow: 0 24px 60px -36px rgba(15, 23, 42, 0.35);
}

:deep(.force-password-change__card .p-card-body),
:deep(.force-password-change__card .p-card-content) {
  padding: 0;
}

.force-password-change__card :deep(.p-card-content) {
  padding: 1.4rem;
}

.force-password-change__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  background: rgba(240, 249, 255, 0.96);
  color: #0369a1;
  padding: 0.35rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.force-password-change__title {
  margin: 1rem 0 0;
  color: #0f172a;
  font-size: 1.55rem;
  font-weight: 900;
  line-height: 1.15;
}

.force-password-change__description {
  margin: 0.65rem 0 0;
  color: #64748b;
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.6;
}

.force-password-change__form {
  display: grid;
  gap: 1rem;
  margin-top: 1.2rem;
}

.force-password-change__field {
  display: grid;
  gap: 0.45rem;
}

.force-password-change__field > span {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.force-password-change__hint {
  margin: -0.25rem 0 0;
  color: #be123c;
  font-size: 0.8rem;
  font-weight: 700;
}
</style>
