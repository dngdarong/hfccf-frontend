<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  itemTo: {
    type: Function,
    default: null,
  },
  viewLabel: {
    type: String,
    default: '',
  },
})

const router = useRouter()

function resolveTo(item) {
  if (typeof props.itemTo !== 'function') {
    return null
  }

  const target = props.itemTo(item)
  if (!target) {
    return null
  }

  if (typeof target === 'string') {
    return target
  }

  if (target?.name && router.hasRoute(target.name)) {
    return target
  }

  return null
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="!items.length" class="text-sm text-slate-500">
      {{ emptyText }}
    </div>

    <ul v-else class="space-y-2">
      <li v-for="item in items" :key="item.label || item.name || JSON.stringify(item)">
        <RouterLink
          v-if="resolveTo(item)"
          :to="resolveTo(item)"
          class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          :aria-label="`${item.label || item.name || item.title} ${item.value ?? item.count ?? item.total ?? '—'}`"
        >
          <div class="min-w-0">
            <p class="truncate font-medium text-slate-900">{{ item.label || item.name || item.title }}</p>
            <p v-if="item.caption" class="truncate text-xs text-slate-500">{{ item.caption }}</p>
            <p v-if="viewLabel || item.viewLabel" class="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {{ item.viewLabel || viewLabel }}
            </p>
          </div>
          <span class="shrink-0 font-semibold text-slate-700">{{ item.value ?? item.count ?? item.total ?? '—' }}</span>
        </RouterLink>
        <div v-else class="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <div class="min-w-0">
            <p class="truncate font-medium text-slate-900">{{ item.label || item.name || item.title }}</p>
            <p v-if="item.caption" class="truncate text-xs text-slate-500">{{ item.caption }}</p>
          </div>
          <span class="shrink-0 font-semibold text-slate-700">{{ item.value ?? item.count ?? item.total ?? '—' }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>
