<script setup>
import Button from '@/components/buttons/Button.vue'
import Textarea from 'primevue/textarea'

defineOptions({
  name: 'GovernanceCaseResolutionPanel',
})

const props = defineProps({
  record: {
    type: Object,
    default: () => ({}),
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'resolve', 'close', 'reopen'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ labels.title || 'Resolution' }}</h3>
      <p class="text-sm text-slate-500">{{ labels.subtitle || 'Resolution actions are recorded in the governance timeline.' }}</p>
    </div>

    <div class="mt-4 grid gap-3 lg:grid-cols-3">
      <label class="space-y-2 text-sm lg:col-span-2">
        <span class="font-medium text-slate-700">{{ labels.resolutionNote || 'Resolution note' }}</span>
        <Textarea
          :model-value="modelValue.resolutionNote || ''"
          class="w-full"
          rows="4"
          :auto-resize="true"
          :placeholder="labels.resolutionNotePlaceholder || 'Summarise how the case was resolved'"
          :disabled="disabled"
          @update:model-value="updateField('resolutionNote', $event)"
        />
      </label>
      <div class="space-y-3">
        <label class="block space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.closureNote || 'Closure note' }}</span>
          <Textarea
            :model-value="modelValue.closureNote || ''"
            class="w-full"
            rows="4"
            :auto-resize="true"
            :placeholder="labels.closureNotePlaceholder || 'Optional closure note'"
            :disabled="disabled"
            @update:model-value="updateField('closureNote', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.reopenReason || 'Reopen reason' }}</span>
          <Textarea
            :model-value="modelValue.reopenReason || ''"
            class="w-full"
            rows="3"
            :auto-resize="true"
            :placeholder="labels.reopenReasonPlaceholder || 'Why should this case be reopened?'"
            :disabled="disabled"
            @update:model-value="updateField('reopenReason', $event)"
          />
        </label>
        <label class="block space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.escalationReason || 'Escalation reason' }}</span>
          <Textarea
            :model-value="modelValue.escalationReason || ''"
            class="w-full"
            rows="3"
            :auto-resize="true"
            :placeholder="labels.escalationReasonPlaceholder || 'Why should this case be escalated?'"
            :disabled="disabled"
            @update:model-value="updateField('escalationReason', $event)"
          />
        </label>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="ghost" size="md" rounded="xl" :loading="loading" :disabled="disabled || !record.id" @click="emit('escalate')">
        {{ labels.escalate || 'Escalate case' }}
      </Button>
      <Button type="button" variant="secondary" size="md" rounded="xl" :loading="loading" :disabled="disabled || !record.id" @click="emit('reopen')">
        {{ labels.reopen || 'Reopen case' }}
      </Button>
      <Button type="button" variant="ghost" size="md" rounded="xl" :loading="loading" :disabled="disabled || !record.id" @click="emit('close')">
        {{ labels.close || 'Close case' }}
      </Button>
      <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="disabled || !record.id" @click="emit('resolve')">
        {{ labels.resolve || 'Mark resolved' }}
      </Button>
    </div>
  </div>
</template>
