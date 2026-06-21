<script setup>
defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="card in cards"
      :key="card.title"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.title }}</p>
      <div class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</div>
      <p v-if="card.caption" class="mt-2 text-sm text-slate-500">{{ card.caption }}</p>
    </article>
  </div>
</template>
