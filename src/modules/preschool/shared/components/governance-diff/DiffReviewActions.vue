<script setup>
import Button from '@/components/buttons/Button.vue'
import Textarea from 'primevue/textarea'

defineProps({
  reviewKey: {
    type: String,
    default: '',
  },
  reviewStatus: {
    type: String,
    default: 'open',
  },
  reviewNote: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'update:reviewNote',
  'mark-reviewed',
  'flag',
  'escalate',
  'resolve',
])
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-900">{{ labels.title || 'Review actions' }}</h3>
        <p class="text-sm text-slate-500">{{ labels.subtitle || 'Audit-backed review actions for the selected comparison or integrity context.' }}</p>
        <p class="text-xs text-slate-500">{{ labels.reviewKey || 'Review key' }}: {{ reviewKey || '-' }} | {{ labels.status || 'Status' }}: {{ reviewStatus || 'open' }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" rounded="xl" :disabled="disabled || loading" @click="emit('mark-reviewed')">
          {{ labels.markReviewed || 'Mark Reviewed' }}
        </Button>
        <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="disabled || loading" @click="emit('flag')">
          {{ labels.flag || 'Flag' }}
        </Button>
        <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="disabled || loading" @click="emit('escalate')">
          {{ labels.escalate || 'Escalate' }}
        </Button>
        <Button type="button" variant="primary" size="sm" rounded="xl" :disabled="disabled || loading" @click="emit('resolve')">
          {{ labels.resolve || 'Resolve' }}
        </Button>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <label class="block text-sm font-medium text-slate-700">{{ labels.note || 'Governance note' }}</label>
      <Textarea
        :model-value="reviewNote"
        class="w-full"
        rows="3"
        :disabled="disabled || loading"
        :placeholder="labels.notePlaceholder || 'Add a short governance review note'"
        @update:model-value="emit('update:reviewNote', $event)"
      />
    </div>
  </div>
</template>
