<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
  to: {
    type: [String, Object],
    default: null,
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
    <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
    <p v-if="actionLabel" class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ actionLabel }}</p>
  </RouterLink>
  <div v-else class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
  </div>
</template>
