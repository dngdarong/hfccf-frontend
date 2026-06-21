<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'

// Academic years are the top-level lifecycle record for Preschool. This view
// stays read-focused and emits actions so the parent page can keep RBAC,
// dialog state, and backbone syncing in one place.
defineOptions({
  name: 'PreschoolAcademicYearManager',
})

const { t } = useLanguage()

defineProps({
  academicYears: {
    type: Array,
    default: () => [],
  },
  currentContext: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open-add', 'open-edit', 'activate', 'close', 'archive'])

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

function statusClass(status, isCurrent) {
  if (isCurrent) return 'bg-emerald-100 text-emerald-700'
  switch (String(status || 'active').toLowerCase()) {
    case 'draft':
      return 'bg-sky-100 text-sky-700'
    case 'closed':
      return 'bg-amber-100 text-amber-700'
    case 'archived':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}
</script>

<template>
  <PreschoolSettingsSectionCard
    :eyebrow="t('preschoolLifecyclePage.sections.academicYears.eyebrow')"
    :title="t('preschoolLifecyclePage.sections.academicYears.title')"
    :subtitle="t('preschoolLifecyclePage.sections.academicYears.subtitle')"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">
          {{ t('preschoolLifecyclePage.sections.academicYears.description') }}
        </p>
        <p class="mt-1 text-xs text-slate-400">
          {{ t('preschoolLifecyclePage.sections.academicYears.currentContext') }}
        </p>
      </div>
      <Button variant="primary" :disabled="loading || saving" @click="emit('open-add')">
        {{ t('preschoolLifecyclePage.actions.addAcademicYear') }}
      </Button>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <article
        v-for="(year, index) in academicYears"
        :key="year.id || `${year.code}-${index}`"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="text-base font-semibold text-slate-900">
              {{ year.name || year.label || year.code }}
            </h4>
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {{ year.code }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ year.dateRange || `${formatDate(year.startDate)} - ${formatDate(year.endDate)}` }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass(year.status, year.isCurrent)">
              {{ year.isCurrent ? t('preschoolLifecyclePage.status.current') : t(`preschoolLifecyclePage.status.${year.status || 'active'}`) }}
            </span>
            <span v-if="year.termsCount !== null && year.termsCount !== undefined" class="text-xs text-slate-500">
              {{ t('preschoolLifecyclePage.labels.termsCount', { count: year.termsCount }) }}
            </span>
          </div>
        </div>

        <p v-if="year.description || year.notes" class="mt-3 text-sm text-slate-600">
          {{ year.description || year.notes }}
        </p>

        <p v-if="currentContext.academic_year_id && String(currentContext.academic_year_id) === String(year.id)" class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {{ t('preschoolLifecyclePage.labels.currentContext') }}
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" :disabled="saving || ['closed', 'archived'].includes(String(year.status || '').toLowerCase())" @click="emit('open-edit', index)">
            {{ t('preschoolLifecyclePage.actions.edit') }}
          </Button>
          <Button variant="ghost" :disabled="saving || year.isCurrent || String(year.status || '').toLowerCase() === 'archived'" @click="emit('activate', index)">
            {{ t('preschoolLifecyclePage.actions.activate') }}
          </Button>
          <Button variant="ghost" :disabled="saving || ['closed', 'archived'].includes(String(year.status || '').toLowerCase())" @click="emit('close', index)">
            {{ t('preschoolLifecyclePage.actions.close') }}
          </Button>
          <Button variant="ghost" :disabled="saving || year.status === 'archived'" @click="emit('archive', index)">
            {{ t('preschoolLifecyclePage.actions.archive') }}
          </Button>
        </div>
      </article>

      <div v-if="!academicYears.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
        {{ t('preschoolLifecyclePage.emptyStates.academicYears') }}
      </div>
    </div>
  </PreschoolSettingsSectionCard>
</template>
