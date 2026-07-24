<script setup>
import { useRouter } from 'vue-router'
import AnalyticsEmptyState from './AnalyticsEmptyState.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  chartType: {
    type: String,
    default: 'line',
  },
  series: {
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

function normalizeWidth(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.min(parsed, 100)
}

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
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {{ chartType }}
      </span>
    </div>

    <AnalyticsEmptyState v-if="!series.length" :title="emptyText" />

    <div v-else class="space-y-3">
      <div v-for="item in series" :key="item.label || item.name || JSON.stringify(item)" class="space-y-1">
        <RouterLink
          v-if="resolveTo(item)"
          :to="resolveTo(item)"
          class="block cursor-pointer rounded-lg p-1 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          :aria-label="`${item.label || item.name || item.title} ${item.value ?? item.count ?? item.total ?? 0}`"
        >
          <div class="flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <span class="truncate">{{ item.label || item.name || item.title }}</span>
            <span class="shrink-0">{{ item.value ?? item.count ?? item.total ?? 0 }}</span>
          </div>
          <div v-if="viewLabel || item.viewLabel" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {{ item.viewLabel || viewLabel }}
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-slate-900"
              :style="{ width: `${normalizeWidth(item.percent ?? item.value ?? item.count ?? item.total ?? 0)}%` }"
            />
          </div>
        </RouterLink>
        <div v-else>
          <div class="flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <span class="truncate">{{ item.label || item.name || item.title }}</span>
            <span class="shrink-0">{{ item.value ?? item.count ?? item.total ?? 0 }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-slate-900"
              :style="{ width: `${normalizeWidth(item.percent ?? item.value ?? item.count ?? item.total ?? 0)}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
