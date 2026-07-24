<script setup>
defineOptions({
  name: 'DashboardShortcutCard',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  actionLabel: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: 'pi pi-bolt',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <button
    type="button"
    class="group flex h-full w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    :aria-label="ariaLabel || `${title} - ${description}`"
  >
    <div class="flex min-w-0 items-start gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 shadow-inner">
        <i :class="[iconClass, 'text-lg']" aria-hidden="true" />
      </div>
      <div class="min-w-0">
        <h4 class="m-0 text-sm font-semibold text-slate-900">
          {{ title }}
        </h4>
        <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="mt-1 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600">
      <span>{{ actionLabel }}</span>
      <i class="pi pi-arrow-right ml-1" aria-hidden="true" />
    </div>
  </button>
</template>
