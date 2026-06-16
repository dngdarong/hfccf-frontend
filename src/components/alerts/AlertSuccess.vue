<script setup>
import { computed, onUnmounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AlertSuccess',
})

const props = defineProps({
  show: {
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
  buttonText: {
    type: String,
    default: '',
  },
  autoClose: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close'])

const { t } = useLanguage()

let timeoutId = null

const resolvedTitle = computed(
  () => props.title || t('common.success'),
)

const resolvedMessage = computed(
  () => props.message || t('common.actionCompleted'),
)

const resolvedButtonText = computed(
  () => props.buttonText || t('common.continue'),
)

const dialogPt = {
  root: { class: 'alert-success-dialog' },
  content: { class: 'alert-success-dialog__content' },
  mask: { class: 'alert-success-dialog__mask' },
}

function clearAutoCloseTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function handleClose() {
  clearAutoCloseTimeout()
  emit('close')
}

watch(
  () => [props.show, props.autoClose],
  ([show, autoClose]) => {
    clearAutoCloseTimeout()

    if (show && autoClose > 0) {
      timeoutId = window.setTimeout(() => {
        handleClose()
      }, autoClose)
    }
  },
  {
    immediate: true,
  },
)

onUnmounted(() => {
  clearAutoCloseTimeout()
})
</script>

<template>
  <Dialog
    :visible="show"
    modal
    :closable="false"
    :close-on-escape="true"
    :draggable="false"
    :dismissable-mask="true"
    class="ui-dialog ui-dialog--success"
    :pt="dialogPt"
    @update:visible="handleClose"
  >
    <div class="alert-success flex flex-col items-center text-center">
      <div
        class="alert-success__badge"
        aria-hidden="true"
      >
        <div class="alert-success__badge-ring">
          <i class="pi pi-check text-[1.7rem]" />
        </div>
      </div>

      <div class="alert-success__content">
        <p class="alert-success__eyebrow">
          Completed successfully
        </p>

        <h3 class="alert-success__title">
          {{ resolvedTitle }}
        </h3>

        <p class="alert-success__message break-words">
          {{ resolvedMessage }}
        </p>
      </div>

      <div class="alert-success__actions">
        <Button
          class="w-full"
          type="button"
          variant="success"
          @click="handleClose"
        >
          {{ resolvedButtonText }}
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.alert-success {
  position: relative;
}

.alert-success__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.75rem;
  height: 5.75rem;
  margin-bottom: 1.25rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
}

.alert-success__badge-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 14px 28px -18px rgba(34, 197, 94, 0.55);
}

.alert-success__content {
  width: 100%;
}

.alert-success__eyebrow {
  margin: 0 0 0.45rem;
  color: #16a34a;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.alert-success__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.2;
}

.alert-success__message {
  margin: 0.8rem 0 0;
  color: #64748b;
  font-size: 0.96rem;
  line-height: 1.7;
}

.alert-success__actions {
  width: 100%;
  margin-top: 1.75rem;
}

:deep(.alert-success-dialog.p-dialog),
:deep(.ui-dialog--success.p-dialog) {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 1.65rem;
  background:
    radial-gradient(circle at top, rgba(34, 197, 94, 0.08), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
  color: #0f172a !important;
  box-shadow: 0 24px 56px -28px rgba(15, 23, 42, 0.2);
}

:deep(.alert-success-dialog__content),
:deep(.ui-dialog--success .p-dialog-content) {
  border-radius: 1.65rem;
  background: transparent !important;
  padding: 2.1rem 1.85rem 1.75rem;
}

:deep(.alert-success-dialog__mask),
:deep(.p-dialog-mask:has(.ui-dialog--success)) {
  background: rgba(248, 250, 252, 0.78) !important;
  backdrop-filter: none;
}

@media (max-width: 640px) {
  :deep(.alert-success-dialog.p-dialog),
  :deep(.ui-dialog--success.p-dialog) {
    width: min(92vw, 28rem);
    border-radius: 1.35rem;
  }

  :deep(.alert-success-dialog__content),
  :deep(.ui-dialog--success .p-dialog-content) {
    padding: 1.5rem 1.1rem 1.25rem;
    border-radius: 1.35rem;
  }

  .alert-success__badge {
    width: 5rem;
    height: 5rem;
    margin-bottom: 1rem;
  }

  .alert-success__badge-ring {
    width: 3.65rem;
    height: 3.65rem;
  }

  .alert-success__title {
    font-size: 1.25rem;
  }

  .alert-success__message {
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .alert-success__actions {
    margin-top: 1.35rem;
  }
}
</style>
