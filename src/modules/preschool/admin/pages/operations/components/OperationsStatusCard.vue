<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '',
  },
  status: {
    type: String,
    default: 'neutral',
  },
  caption: {
    type: String,
    default: '',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  detailsLabel: {
    type: String,
    default: '',
  },
})

const router = useRouter()

const canNavigate = computed(() => {
  if (!props.to) return false
  if (typeof props.to === 'string') return true
  if (props.to?.name) return router.hasRoute(props.to.name)
  return false
})
</script>

<template>
  <RouterLink
    v-if="canNavigate"
    :to="to"
    class="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{{ title }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ value }}</p>
        <p v-if="caption" class="mt-1 text-sm text-slate-500">{{ caption }}</p>
      </div>
      <AppStatusChip :status="status" :label="status" :translate-label="false" size="xs" />
    </div>
    <div v-if="detailsLabel" class="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      {{ detailsLabel }}
    </div>
  </RouterLink>
  <div v-else class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{{ title }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ value }}</p>
        <p v-if="caption" class="mt-1 text-sm text-slate-500">{{ caption }}</p>
      </div>
      <AppStatusChip :status="status" :label="status" :translate-label="false" size="xs" />
    </div>
  </div>
</template>
