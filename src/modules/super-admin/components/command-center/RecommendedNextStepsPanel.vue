<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'RecommendedNextStepsPanel',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <Card class="command-center-panel">
    <template #title>
      <h3 class="text-[1.02rem] font-extrabold text-slate-900">
        {{ title }}
      </h3>
    </template>

    <template #content>
      <ol class="flex flex-col gap-3">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-start gap-3 rounded-[0.9rem] border border-surface-200 bg-slate-50/70 p-4"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-[0.82rem] font-bold text-brand-800"
          >
            {{ index + 1 }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[0.95rem] font-semibold text-slate-900">
              {{ step.text }}
            </p>
            <Button
              v-if="step.actionLabel"
              type="button"
              severity="secondary"
              text
              rounded
              :label="step.actionLabel"
              class="mt-2 !px-0 !text-[0.78rem] !font-semibold !text-brand-700"
              icon="pi pi-arrow-right"
              icon-pos="right"
            />
          </div>
        </li>
      </ol>
    </template>
  </Card>
</template>

<style scoped>
:deep(.command-center-panel.p-card) {
  border-radius: 1.1rem;
  border: 1px solid #e7eaf3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 22px 50px -38px rgba(15, 23, 42, 0.46);
}
</style>

