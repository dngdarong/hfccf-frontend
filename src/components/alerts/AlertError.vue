<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AlertError',
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
})

const emit = defineEmits(['close'])

const { t } = useLanguage()

const resolvedTitle = computed(
  () => props.title || t('common.errorOccurred'),
)

const resolvedMessage = computed(
  () => props.message || t('common.errorTryAgain'),
)

const resolvedButtonText = computed(
  () => props.buttonText || t('common.close'),
)

function handleClose() {
  emit('close')
}
</script>

<template>
  <Dialog
    :visible="show"
    modal
    :closable="false"
    :close-on-escape="false"
    :draggable="false"
    :dismissable-mask="false"
    class="ui-dialog ui-dialog--error"
    @update:visible="handleClose"
  >
    <div class="flex flex-col items-center text-center">
      <div
        class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500"
      >
        <i
          class="pi pi-times text-3xl"
          aria-hidden="true"
        />
      </div>

      <h3 class="text-xl font-extrabold text-slate-900">
        {{ resolvedTitle }}
      </h3>

      <p
        class="mt-2 max-w-md break-words text-[15px] leading-relaxed text-slate-500"
      >
        {{ resolvedMessage }}
      </p>

      <Button
        class="mt-8 w-full"
        type="button"
        variant="danger"
        @click="handleClose"
      >
        {{ resolvedButtonText }}
      </Button>
    </div>
  </Dialog>
</template>
