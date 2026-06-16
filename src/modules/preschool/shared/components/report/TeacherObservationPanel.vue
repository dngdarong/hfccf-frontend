<script setup>
// Keep teacher observations isolated so report pages can present narrative
// notes without mixing them into the summary cards or assessment lists.
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-4 py-3">
      <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsShared.observationsTitle') }}</h3>
      <p class="mt-0.5 text-xs text-slate-500">{{ t('preschoolReportsShared.observationsSubtitle') }}</p>
    </div>

    <div v-if="!items.length" class="px-4 py-8 text-center text-sm text-slate-400">
      {{ t('preschoolReportsShared.emptyObservations') }}
    </div>

    <ul v-else class="divide-y divide-slate-100">
      <li v-for="item in items" :key="item.assessmentId" class="px-4 py-3">
        <!-- Meta row: category + date + teacher name — student name removed (single-student context) -->
        <div class="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            v-if="item.category?.name"
            class="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700"
          >
            {{ item.category.name }}
          </span>
          <span class="text-xs text-slate-400">{{ item.assessmentDate || '—' }}</span>
          <!-- Show who wrote the observation rather than repeating the student name -->
          <span v-if="item.assessedByName" class="text-xs text-slate-400">
            · {{ t('preschoolReportsShared.labels.assessedBy') }} {{ item.assessedByName }}
          </span>
        </div>
        <!-- Observation text -->
        <p class="text-sm leading-relaxed text-slate-700 italic">
          "{{ item.observation || item.teacherComment || '—' }}"
        </p>
      </li>
    </ul>
  </section>
</template>
