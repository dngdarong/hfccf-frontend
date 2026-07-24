<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'

defineOptions({
  name: 'PriorityActionsPanel',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  actions: {
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
      <div class="flex flex-col">
        <div
          v-for="(action, index) in actions"
          :key="action.id"
          class="py-3 first:pt-0 last:pb-0"
          :class="index < actions.length - 1 ? 'border-b border-surface-200' : ''"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="min-w-0">
              <p class="text-[0.95rem] font-semibold text-slate-900">
                {{ action.title }}
              </p>
              <div class="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge :status="action.priority" :label="action.priorityLabel" size="sm" />
                <span v-if="action.dueLabel" class="text-[0.8rem] text-slate-500">
                  {{ action.dueLabel }}
                </span>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <Button
                v-if="action.actionLabel"
                type="button"
                severity="secondary"
                text
                rounded
                :label="action.actionLabel"
                class="!px-0 !text-[0.8rem] !font-semibold !text-brand-700"
                icon="pi pi-arrow-right"
                icon-pos="right"
              />
            </div>
          </div>
        </div>
      </div>
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

