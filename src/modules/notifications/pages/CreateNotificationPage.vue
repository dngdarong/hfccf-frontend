<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import { hasPermission } from '@/services/auth'
import { useUserStore } from '@/store/userStore'
import { useNotificationsStore } from '@/modules/notifications/stores/notificationsStore'

defineOptions({
  name: 'CreateNotificationPage',
})

const router = useRouter()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()
const { t, te } = useLanguage()

const form = reactive({
  type: '',
  title: '',
  message: '',
  module: '',
  actionUrl: '',
  targetType: 'all',
  targetValue: '',
  metadata: '',
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const typeOptions = computed(() => [
  { label: t('notifications.types.info'), value: 'info' },
  { label: t('notifications.types.success'), value: 'success' },
  { label: t('notifications.types.warning'), value: 'warning' },
  { label: t('notifications.types.error'), value: 'error' },
  { label: t('notifications.types.system'), value: 'system' },
])

const moduleOptions = computed(() => [
  { label: t('notifications.modules.global'), value: 'global' },
  { label: t('notifications.modules.english'), value: 'english' },
  { label: t('notifications.modules.preschool'), value: 'preschool' },
  { label: t('notifications.modules.scholarship'), value: 'scholarship' },
  { label: t('notifications.modules.sport'), value: 'sport' },
])

const targetTypeOptions = computed(() => [
  { label: t('notifications.targets.all'), value: 'all' },
  { label: t('notifications.targets.role'), value: 'role' },
  { label: t('notifications.targets.department'), value: 'department' },
  { label: t('notifications.targets.module'), value: 'module' },
  { label: t('notifications.targets.user'), value: 'user' },
])

const canCreate = computed(() => hasPermission('all:*', userStore.currentUser))
const pageTitle = computed(() => t('notifications.create'))
const pageSubtitle = computed(() =>
  resolvedText(
    'notifications.createSubtitle',
    'Send a targeted notification to one or more user groups.',
  ),
)

function resolvedText(key, fallback) {
  return te(key) ? t(key) : fallback
}

function validateJsonInput(value) {
  const text = String(value || '').trim()

  if (!text) return true

  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

function validateForm() {
  if (!form.type) return resolvedText('notifications.validation.typeRequired', 'Type is required.')
  if (!form.title.trim()) return resolvedText('notifications.validation.titleRequired', 'Title is required.')
  if (!form.message.trim()) return resolvedText('notifications.validation.messageRequired', 'Message is required.')
  if (!form.module) return resolvedText('notifications.validation.moduleRequired', 'Module is required.')
  if (!form.targetType) return resolvedText('notifications.validation.targetTypeRequired', 'Target type is required.')
  if (form.targetType !== 'all' && !form.targetValue.trim()) {
    return resolvedText('notifications.validation.targetValueRequired', 'Target value is required.')
  }
  if (!validateJsonInput(form.metadata)) {
    return resolvedText('notifications.validation.metadataInvalid', 'Metadata must be valid JSON.')
  }

  return ''
}

function resetForm() {
  form.type = ''
  form.title = ''
  form.message = ''
  form.module = ''
  form.actionUrl = ''
  form.targetType = 'all'
  form.targetValue = ''
  form.metadata = ''
}

async function submitForm() {
  const validationMessage = validateForm()

  if (validationMessage) {
    errorMessage.value = validationMessage
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    await notificationsStore.createNotification({
      type: form.type,
      title: form.title.trim(),
      message: form.message.trim(),
      module: form.module,
      actionUrl: form.actionUrl.trim() || null,
      targetType: form.targetType,
      targetValue: form.targetType === 'all' ? null : form.targetValue.trim(),
      metadata: form.metadata.trim() ? JSON.parse(form.metadata) : null,
    })

    showSuccess.value = true
    resetForm()
  } catch (error) {
    errorMessage.value = error?.message || resolvedText('notifications.validation.createFailed', 'Unable to create notification right now.')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push({ name: 'notifications' })
}

async function handleSuccessClose() {
  showSuccess.value = false
  goBack()
}

function handleErrorClose() {
  showError.value = false
}
</script>

<template>
  <MainLayout>
    <section class="notifications-create-page">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <Card class="notifications-create-page__card">
        <template #content>
          <div
            v-if="!canCreate"
            class="notifications-create-page__forbidden"
          >
            {{ t('notifications.forbidden') }}
          </div>

          <form
            v-else
            class="notifications-create-page__form"
            @submit.prevent="submitForm"
          >
            <div class="notifications-create-page__grid">
              <div class="notifications-create-page__field">
                <label class="notifications-create-page__label">{{ t('notifications.fields.type') }}</label>
                <Select
                  v-model="form.type"
                  :options="typeOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>

              <div class="notifications-create-page__field">
                <label class="notifications-create-page__label">{{ t('notifications.fields.module') }}</label>
                <Select
                  v-model="form.module"
                  :options="moduleOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>

              <div class="notifications-create-page__field notifications-create-page__field--full">
                <label class="notifications-create-page__label">{{ t('notifications.fields.title') }}</label>
                <InputText v-model="form.title" />
              </div>

              <div class="notifications-create-page__field notifications-create-page__field--full">
                <label class="notifications-create-page__label">{{ t('notifications.fields.message') }}</label>
                <Textarea
                  v-model="form.message"
                  rows="5"
                  auto-resize
                />
              </div>

              <div class="notifications-create-page__field">
                <label class="notifications-create-page__label">{{ t('notifications.fields.targetType') }}</label>
                <Select
                  v-model="form.targetType"
                  :options="targetTypeOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>

              <div class="notifications-create-page__field">
                <label class="notifications-create-page__label">{{ t('notifications.fields.targetValue') }}</label>
                <InputText
                  v-model="form.targetValue"
                  :disabled="form.targetType === 'all'"
                />
              </div>

              <div class="notifications-create-page__field notifications-create-page__field--full">
                <label class="notifications-create-page__label">{{ t('notifications.fields.actionUrl') }}</label>
                <InputText v-model="form.actionUrl" />
              </div>

              <div class="notifications-create-page__field notifications-create-page__field--full">
                <label class="notifications-create-page__label">{{ t('notifications.fields.metadata') }}</label>
                <Textarea
                  v-model="form.metadata"
                  rows="4"
                  auto-resize
                />
              </div>
            </div>

            <div class="notifications-create-page__actions">
              <Button
                type="button"
                severity="secondary"
                outlined
                :disabled="isSubmitting"
                @click="goBack"
              >
                {{ t('common.cancel') }}
              </Button>

              <Button
                type="submit"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                {{ t('notifications.create') }}
              </Button>
            </div>
          </form>
        </template>
      </Card>

      <AlertSuccess
        :show="showSuccess"
        :title="t('notifications.createdTitle')"
        :message="t('notifications.createdMessage')"
        :button-text="t('common.continue')"
        @close="handleSuccessClose"
      />

      <AlertError
        :show="showError"
        :title="t('common.error')"
        :message="errorMessage"
        :button-text="t('common.close')"
        @close="handleErrorClose"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.notifications-create-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-create-page__card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}

.notifications-create-page__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-create-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.notifications-create-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.notifications-create-page__field--full {
  grid-column: 1 / -1;
}

.notifications-create-page__label {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 800;
}

.notifications-create-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.notifications-create-page__forbidden {
  padding: 1.2rem;
  border: 1px dashed #dbe4ea;
  border-radius: 1rem;
  color: #64748b;
  text-align: center;
}

@media (max-width: 768px) {
  .notifications-create-page__grid {
    grid-template-columns: 1fr;
  }

  .notifications-create-page__actions {
    flex-direction: column;
  }
}
</style>
