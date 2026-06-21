<script setup>
import Card from 'primevue/card'

defineOptions({
  name: 'GovernanceSummaryCards',
})

defineEmits(['action'])

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="space-y-3">
    <div v-if="title || subtitle" class="space-y-1">
      <h3 v-if="title" class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card v-for="card in cards" :key="card.id" class="h-full">
        <template #title>
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              {{ card.eyebrow }}
            </p>
            <h4 class="text-base font-semibold text-slate-900">{{ card.title }}</h4>
          </div>
        </template>

        <template #content>
          <div class="space-y-3">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-3xl font-extrabold text-slate-900">{{ card.value }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ card.description }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="card.statusClass">
                {{ card.statusLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ card.trend }}</p>
              <button
                v-if="card.actionLabel"
                type="button"
                class="text-sm font-semibold text-sky-700 hover:text-sky-800"
                @click="$emit('action', card)"
              >
                {{ card.actionLabel }}
              </button>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>
