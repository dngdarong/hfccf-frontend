<script setup>
import Card from 'primevue/card'

defineOptions({
  name: 'RiskHeatMap',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card>
    <template #title>{{ title }}</template>
    <template #content>
      <div v-if="items.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in items"
          :key="item.id"
          class="rounded-2xl border p-4"
          :class="item.statusClass"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.18em]">{{ item.label }}</p>
          <p class="mt-2 text-2xl font-extrabold">{{ item.value }}</p>
          <p class="mt-1 text-sm">{{ item.description }}</p>
        </article>
      </div>
      <p v-else class="py-8 text-center text-sm text-slate-500">{{ emptyLabel }}</p>
    </template>
  </Card>
</template>
