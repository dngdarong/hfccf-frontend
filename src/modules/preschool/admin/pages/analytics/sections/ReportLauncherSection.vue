<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['open'])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.key"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ item.label }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ item.description }}</p>
        <button
          type="button"
          class="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="emit('open', item.key)"
        >
          {{ item.action }}
        </button>
      </article>
    </div>
  </section>
</template>
