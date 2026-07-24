<script setup>
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'

defineOptions({
  name: 'AdminSummaryCards',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="card in cards"
      :key="card.id"
      class="flex min-h-full flex-col justify-between rounded-[1rem] border border-surface-200 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.4)]"
      :class="card.surfaceClass || ''"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-surface-500">
            {{ card.title }}
          </p>
          <p class="mt-2 text-[1.8rem] leading-none font-extrabold text-slate-900">
            {{ card.value }}
          </p>
        </div>
        <StatusBadge :status="card.status" :label="card.statusLabel" size="sm" :dot="false" />
      </div>

      <p v-if="card.label" class="mt-2.5 text-[0.84rem] leading-5 text-slate-600">
        {{ card.label }}
      </p>

      <div v-if="card.actionLabel" class="mt-4 flex justify-end">
        <Button
          type="button"
          severity="secondary"
          text
          rounded
          :label="card.actionLabel"
          class="!px-0 !text-[0.78rem] !font-semibold !text-brand-700"
          icon="pi pi-arrow-right"
          icon-pos="right"
          :aria-label="card.actionLabel"
        />
      </div>
    </article>
  </div>
</template>

