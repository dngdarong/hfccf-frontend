<script setup>
import { computed, ref } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import UiForm from '@/components/forms/Form.vue'
import InputText from 'primevue/inputtext'

const emit = defineEmits(['submit'])
const { t } = useLanguage()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

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
}))

function handleSubmit() {
  // Emit a copied payload so the page can own save behavior and user feedback.
  emit('submit', { ...form.value })
}
</script>

<template>
  <UiForm
    :title="labels.title"
    :description="labels.description"
    :submit-text="t('common.saveChanges')"
    show-cancel
    @submit="handleSubmit"
  >
    <div class="grid grid-cols-1 gap-6">
      <!-- Surface the approval dependency near the inputs so users understand the actual workflow. -->
      <div
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
      >
        {{ labels.approvalNote }}
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="currentPassword">
          {{ labels.currentPassword }}
        </label>
        <InputText
          id="currentPassword"
          v-model="form.currentPassword"
          type="password"
          :placeholder="labels.currentPasswordPlaceholder"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="newPassword">
          {{ labels.newPassword }}
        </label>
        <InputText
          id="newPassword"
          v-model="form.newPassword"
          type="password"
          :placeholder="labels.newPasswordPlaceholder"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-surface-900" for="confirmNewPassword">
          {{ labels.confirmNewPassword }}
        </label>
        <InputText
          id="confirmNewPassword"
          v-model="form.confirmNewPassword"
          type="password"
          :placeholder="labels.confirmNewPasswordPlaceholder"
          class="w-full"
        />
      </div>
    </div>
  </UiForm>
</template>
