<script setup>
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

defineOptions({
  name: 'GovernanceCaseAssignmentPanel',
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
  assigneeOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
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

const emit = defineEmits(['update:modelValue', 'assign'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

function submit() {
  emit('assign')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ labels.title || 'Assignment' }}</h3>
      <p class="text-sm text-slate-500">{{ labels.subtitle || 'Ownership and due dates stay as workflow records.' }}</p>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2">
      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.owner || 'Owner' }}</span>
        <Select
          :model-value="modelValue.ownerUserId || ''"
          :options="assigneeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :disabled="disabled"
          @update:model-value="updateField('ownerUserId', $event)"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.reviewer || 'Reviewer' }}</span>
        <Select
          :model-value="modelValue.reviewerUserId || ''"
          :options="assigneeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :disabled="disabled"
          @update:model-value="updateField('reviewerUserId', $event)"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.escalationOfficer || 'Escalation officer' }}</span>
        <Select
          :model-value="modelValue.escalationOfficerUserId || ''"
          :options="assigneeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :disabled="disabled"
          @update:model-value="updateField('escalationOfficerUserId', $event)"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.status || 'Status' }}</span>
        <Select
          :model-value="modelValue.status || ''"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :disabled="disabled"
          @update:model-value="updateField('status', $event)"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.dueDate || 'Due date' }}</span>
        <InputText
          :model-value="modelValue.dueDate || ''"
          type="date"
          class="w-full"
          :disabled="disabled"
          @update:model-value="updateField('dueDate', $event)"
        />
      </label>
    </div>

    <label class="mt-3 block space-y-2 text-sm">
      <span class="font-medium text-slate-700">{{ labels.note || 'Assignment note' }}</span>
      <Textarea
        :model-value="modelValue.note || ''"
        class="w-full"
        rows="4"
        :auto-resize="true"
        :placeholder="labels.notePlaceholder || 'Describe why the case is assigned this way'"
        :disabled="disabled"
        @update:model-value="updateField('note', $event)"
      />
    </label>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="disabled || !record.id" @click="submit">
        {{ labels.save || 'Save assignment' }}
      </Button>
      <p class="text-xs text-slate-500">{{ labels.currentOwner || 'Current owner' }}: {{ record.owner?.displayName || '-' }}</p>
    </div>
  </div>
</template>
