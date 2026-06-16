<script setup>
import { computed, ref } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import UiForm from '@/components/forms/Form.vue'
import InputText from 'primevue/inputtext'
import Button from '@/components/buttons/Button.vue'
import { changePassword } from '@/services/auth'

const emit = defineEmits(['submit'])
const { t } = useLanguage()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const requestError = ref('')

// Group labels in one computed block so the template stays lean and the copy is easy to update later.
const labels = computed(() => ({
  title: t('pages.profile.security.title'),
  description: t('pages.profile.security.description'),
  currentPassword: t('pages.profile.security.currentPassword'),
  newPassword: t('pages.profile.security.newPassword'),
  confirmNewPassword: t('pages.profile.security.confirmNewPassword'),
  currentPasswordPlaceholder: t('pages.profile.security.currentPasswordPlaceholder'),
  newPasswordPlaceholder: t('pages.profile.security.newPasswordPlaceholder'),
  confirmNewPasswordPlaceholder: t('pages.profile.security.confirmNewPasswordPlaceholder'),
  approvalNote: t('pages.profile.security.approvalNote'),
  passwordMismatchHint: t('pages.profile.security.passwordMismatchHint'),
}))

const passwordsMatch = computed(() =>
  !form.value.newPassword ||
  !form.value.confirmNewPassword ||
  form.value.newPassword === form.value.confirmNewPassword,
)

async function handleSubmit() {
  requestError.value = ''

  if (!passwordsMatch.value) {
    requestError.value = labels.value.passwordMismatchHint
    return
  }

  isSubmitting.value = true

  try {
    const response = await changePassword({
      current_password: form.value.currentPassword,
      password: form.value.newPassword,
      password_confirmation: form.value.confirmNewPassword,
    })

    emit('submit', response)
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmNewPassword = ''
  } catch (error) {
    requestError.value = error?.message || t('common.error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UiForm
    :title="labels.title"
    :description="labels.description"
    :submit-text="t('common.saveChanges')"
    show-cancel
    :loading="isSubmitting"
    @submit="handleSubmit"
  >
    <div class="grid grid-cols-1 gap-6">
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p class="text-sm font-bold text-amber-950">{{ labels.approvalNote }}</p>
        <p class="mt-1 text-sm leading-6 text-amber-900">
          {{ t('pages.profile.security.description') }}
        </p>
      </div>

      <div
        v-if="requestError"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        {{ requestError }}
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="currentPassword">
          {{ labels.currentPassword }}
        </label>
        <div class="relative">
          <InputText
            id="currentPassword"
            v-model="form.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            :placeholder="labels.currentPasswordPlaceholder"
            class="w-full pr-14"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <i :class="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="newPassword">
          {{ labels.newPassword }}
        </label>
        <div class="relative">
          <InputText
            id="newPassword"
            v-model="form.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            :placeholder="labels.newPasswordPlaceholder"
            class="w-full pr-14"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2"
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="confirmNewPassword">
          {{ labels.confirmNewPassword }}
        </label>
        <div class="relative">
          <InputText
            id="confirmNewPassword"
            v-model="form.confirmNewPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="labels.confirmNewPasswordPlaceholder"
            class="w-full pr-14"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-1 top-1/2 -translate-y-1/2"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
          </Button>
        </div>

        <p
          v-if="!passwordsMatch"
          class="text-sm font-semibold text-rose-600"
        >
          {{ labels.passwordMismatchHint }}
        </p>
      </div>
    </div>
  </UiForm>
</template>
