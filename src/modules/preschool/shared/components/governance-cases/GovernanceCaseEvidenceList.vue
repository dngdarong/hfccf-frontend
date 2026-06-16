<script setup>
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

defineOptions({
  name: 'GovernanceCaseEvidenceList',
})

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
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
  emptyLabel: {
    type: String,
    default: 'No evidence has been attached to this case.',
  },
})

const emit = defineEmits(['update:modelValue', 'add-evidence'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

function submit() {
  emit('add-evidence')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ labels.title || 'Evidence' }}</h3>
      <p class="text-sm text-slate-500">{{ labels.subtitle || 'Evidence stays attached to immutable source records.' }}</p>
    </div>

    <div v-if="!items.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="mt-4 space-y-3">
      <div v-for="item in items" :key="item.id" class="rounded-xl border border-slate-200 p-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">{{ item.evidenceLabel || item.evidenceType || '-' }}</p>
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ item.evidenceType || '-' }}</p>
          </div>
          <p class="text-xs text-slate-500">{{ item.recordedAt || '-' }}</p>
        </div>
        <p class="mt-2 text-sm text-slate-600">{{ item.evidenceDescription || labels.noDescription || '-' }}</p>
        <div class="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <p>{{ labels.reference || 'Reference' }}: {{ item.evidenceReference || '-' }}</p>
          <p>{{ labels.creator || 'Creator' }}: {{ item.creator?.displayName || item.creator?.roleCode || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.evidenceType || 'Evidence type' }}</span>
          <InputText
            :model-value="modelValue.evidenceType || ''"
            class="w-full"
            :placeholder="labels.evidenceTypePlaceholder || 'snapshot_id'"
            :disabled="disabled"
            @update:model-value="updateField('evidenceType', $event)"
          />
        </label>
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.evidenceReference || 'Evidence reference' }}</span>
          <InputText
            :model-value="modelValue.evidenceReference || ''"
            class="w-full"
            :placeholder="labels.evidenceReferencePlaceholder || 'SN-20260529-01'"
            :disabled="disabled"
            @update:model-value="updateField('evidenceReference', $event)"
          />
        </label>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.evidenceLabel || 'Evidence label' }}</span>
          <InputText
            :model-value="modelValue.evidenceLabel || ''"
            class="w-full"
            :placeholder="labels.evidenceLabelPlaceholder || 'Snapshot mismatch reference'"
            :disabled="disabled"
            @update:model-value="updateField('evidenceLabel', $event)"
          />
        </label>
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ labels.metadata || 'Metadata (JSON)' }}</span>
          <InputText
            :model-value="modelValue.metadataText || ''"
            class="w-full"
            :placeholder="labels.metadataPlaceholder || 'metadata json'"
            :disabled="disabled"
            @update:model-value="updateField('metadataText', $event)"
          />
        </label>
      </div>

      <label class="mt-3 block space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ labels.evidenceDescription || 'Evidence description' }}</span>
        <Textarea
          :model-value="modelValue.evidenceDescription || ''"
          class="w-full"
          rows="4"
          :auto-resize="true"
          :placeholder="labels.evidenceDescriptionPlaceholder || 'Explain why this evidence matters to the case'"
          :disabled="disabled"
          @update:model-value="updateField('evidenceDescription', $event)"
        />
      </label>

      <div class="mt-4 flex justify-end">
        <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="disabled" @click="submit">
          {{ labels.addEvidence || 'Add evidence' }}
        </Button>
      </div>
    </div>
  </div>
</template>
