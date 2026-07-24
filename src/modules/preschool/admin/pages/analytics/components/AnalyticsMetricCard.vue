<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'slate',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  detailsLabel: {
    type: String,
    default: '',
  },
})

const router = useRouter()

const toneClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  violet: 'border-violet-200 bg-violet-50 text-violet-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
}

const canNavigate = computed(() => {
  if (!props.to) {
    return false
  }

  if (typeof props.to === 'string') {
    return true
  }

  if (props.to?.name) {
    return router.hasRoute(props.to.name)
  }

  return true
})

const cardClasses = computed(() => [
  'rounded-2xl border p-4 shadow-sm transition',
  toneClasses[props.tone] ?? toneClasses.slate,
  canNavigate.value ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : '',
])
</script>

<template>
  <RouterLink
    v-if="canNavigate"
    :to="to"
    class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-2xl"
  >
    <div :class="cardClasses">
      <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        {{ title }}
      </div>
      <div class="mt-3 text-3xl font-bold text-slate-900">
        <span v-if="loading">...</span>
        <span v-else>{{ value }}</span>
      </div>
      <div v-if="caption" class="mt-2 text-sm text-slate-500">
        {{ caption }}
      </div>
      <div v-if="canNavigate && detailsLabel" class="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {{ detailsLabel }}
      </div>
    </div>
  </RouterLink>
  <div v-else :class="cardClasses">
    <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
      {{ title }}
    </div>
    <div class="mt-3 text-3xl font-bold text-slate-900">
      <span v-if="loading">...</span>
      <span v-else>{{ value }}</span>
    </div>
    <div v-if="caption" class="mt-2 text-sm text-slate-500">
      {{ caption }}
    </div>
  </div>
</template>
