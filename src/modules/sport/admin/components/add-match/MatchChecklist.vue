<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'

defineOptions({
  name: 'MatchChecklist',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  highlightLabel: {
    type: String,
    default: '',
  },
  highlightValue: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card class="match-checklist">
    <template #title>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-[1.02rem] font-extrabold text-slate-900">
            {{ title }}
          </h3>
          <p v-if="description" class="mt-1 text-[0.9rem] leading-6 text-slate-600">
            {{ description }}
          </p>
        </div>
        <Tag v-if="highlightLabel" :value="highlightValue || highlightLabel" severity="secondary" rounded />
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <article
          v-for="(item, index) in items"
          :key="item.title || index"
          class="rounded-[0.9rem] border border-surface-200 bg-white p-3.5"
        >
          <div class="flex items-start gap-3">
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-[0.82rem] font-bold text-brand-800"
            >
              {{ index + 1 }}
            </span>
            <div class="min-w-0">
              <p class="text-[0.92rem] font-semibold text-slate-900">
                {{ item.title }}
              </p>
              <p v-if="item.text" class="mt-1 text-[0.84rem] leading-5 text-slate-600">
                {{ item.text }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.match-checklist.p-card) {
  border-radius: 1.1rem;
  border: 1px solid #e7eaf3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 22px 50px -38px rgba(15, 23, 42, 0.46);
}
</style>
