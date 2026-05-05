<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'danger',
  },
})

defineEmits(['confirm', 'cancel'])
const { t } = useLanguage()

const resolvedTitle = computed(() => props.title || t('common.areYouSure'))
const resolvedMessage = computed(() => props.message || t('common.actionCannotBeUndone'))
const resolvedConfirmText = computed(() => props.confirmText || t('common.confirm'))
const resolvedCancelText = computed(() => props.cancelText || t('common.cancel'))
const isLocked = computed(() => props.loading || props.disabled)
const dialogPt = computed(() => ({
  root: { class: 'alert-question-dialog' },
  header: { class: 'alert-question-dialog__header' },
  content: { class: 'alert-question-dialog__content' },
  footer: { class: 'alert-question-dialog__footer' },
  mask: { class: 'alert-question-dialog__mask' },
}))
</script>

<template>
  <Dialog
    :visible="show"
    modal
    :closable="false"
    :draggable="false"
    :dismissable-mask="true"
    class="ui-dialog ui-dialog--question"
    :pt="dialogPt"
    @update:visible="$emit('cancel')"
  >
    <template #header>
      <div class="alert-question flex items-center gap-3">
        <span
          class="alert-question__icon flex h-11 w-11 items-center justify-center rounded-xl"
          :class="{
            'alert-question__icon--danger': type === 'danger',
            'alert-question__icon--warning': type === 'warning',
            'alert-question__icon--info': type === 'info',
          }"
        >
          <i class="pi pi-exclamation-triangle text-lg" />
        </span>
        <div class="min-w-0">
          <h3 class="alert-question__title text-lg font-bold text-slate-900">
            {{ resolvedTitle }}
          </h3>
          <p class="alert-question__message text-sm text-slate-500">{{ resolvedMessage }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" :disabled="isLocked" @click="$emit('cancel')">
          {{ resolvedCancelText }}
        </Button>
        <Button
          type="button"
          :variant="type === 'danger' ? 'danger' : 'primary'"
          :loading="loading"
          :disabled="isLocked"
          @click="$emit('confirm')"
        >
          {{ resolvedConfirmText }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style>
.alert-question__title {
  margin: 0;
  line-height: 1.2;
}

.alert-question__message {
  margin: 0.3rem 0 0;
  line-height: 1.6;
}

.alert-question__icon--danger {
  background: #fff1f2;
  color: #e11d48;
}

.alert-question__icon--warning {
  background: #fffbeb;
  color: #d97706;
}

.alert-question__icon--info {
  background: #eff6ff;
  color: #2563eb;
}

.alert-question-dialog.p-dialog,
.ui-dialog--question.p-dialog {
  border-radius: 1.35rem;
  border: 1px solid #e2e8f0;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 24px 56px -30px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.alert-question-dialog__header,
.ui-dialog--question .p-dialog-header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
  padding: 1.4rem 1.4rem 0.75rem !important;
  border-bottom: 0 !important;
}

.alert-question-dialog__content,
.ui-dialog--question .p-dialog-content {
  background: #ffffff !important;
  padding: 0 1.4rem 0.4rem !important;
}

.alert-question-dialog__footer,
.ui-dialog--question .p-dialog-footer {
  background: #ffffff !important;
  padding: 1rem 1.4rem 1.4rem !important;
  border-top: 0 !important;
}

.alert-question-dialog__mask,
.p-dialog-mask:has(.ui-dialog--question) {
  background: rgba(248, 250, 252, 0.78) !important;
  backdrop-filter: none;
}

@media (max-width: 640px) {
  .alert-question-dialog.p-dialog,
  .ui-dialog--question.p-dialog {
    width: min(92vw, 28rem);
    border-radius: 1.1rem;
  }

  .alert-question-dialog__header,
  .ui-dialog--question .p-dialog-header {
    padding: 1.1rem 1rem 0.65rem !important;
  }

  .alert-question-dialog__content,
  .ui-dialog--question .p-dialog-content {
    padding: 0 1rem 0.25rem !important;
  }

  .alert-question-dialog__footer,
  .ui-dialog--question .p-dialog-footer {
    padding: 0.9rem 1rem 1rem !important;
  }
}
</style>
