<script setup>
import { useRouter } from 'vue-router'

defineOptions({
  name: 'AssessmentWorkspaceCard',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  routeName: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: 'pi pi-folder',
  },
  group: {
    type: String,
    default: '',
  },
})

const router = useRouter()

function navigate() {
  router.push({ name: props.routeName })
}
</script>

<template>
  <button
    type="button"
    class="group flex h-full w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    :aria-label="`${title} - ${description}`"
    @click="navigate"
  >
    <div class="flex min-w-0 items-start gap-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 shadow-inner">
        <i :class="[iconClass, 'text-lg']" />
      </div>
      <div class="min-w-0">
        <p v-if="group" class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
          {{ group }}
        </p>
        <h3 class="mt-1 text-lg font-semibold text-slate-900">
          {{ title }}
        </h3>
        <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
          {{ description }}
        </p>
      </div>
    </div>

    <div class="mt-1 shrink-0 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600">
      <i class="pi pi-arrow-right text-sm" />
    </div>
  </button>
</template>
