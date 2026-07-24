<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { getCommandCenterTone } from './commandCenterTone'

defineOptions({
  name: 'CommandCenterSummaryCard',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  trend: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'neutral',
  },
  actionLabel: {
    type: String,
    default: '',
  },
  statusLabel: {
    type: String,
    default: '',
  },
})

const tone = computed(() => getCommandCenterTone(props.status))
</script>

<template>
  <article
    class="flex min-h-full flex-col justify-between rounded-[1.1rem] border border-surface-200 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]"
    :class="[tone.surfaceClass, tone.textClass, 'border-l-4']"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-surface-500">
          {{ title }}
        </p>
        <p class="mt-2 text-[1.8rem] leading-none font-extrabold text-slate-900">
          {{ value }}
        </p>
      </div>
      <StatusBadge :status="status" :label="statusLabel" size="sm" :dot="false" />
    </div>

    <p v-if="trend" class="mt-2.5 text-[0.84rem] leading-5 text-slate-600">
      {{ trend }}
    </p>

    <div v-if="actionLabel" class="mt-4 flex justify-end">
      <Button
        type="button"
        severity="secondary"
        text
        rounded
        :label="actionLabel"
        class="!px-0 !text-[0.78rem] !font-semibold !text-brand-700"
        icon="pi pi-arrow-right"
        icon-pos="right"
      />
    </div>
  </article>
</template>

