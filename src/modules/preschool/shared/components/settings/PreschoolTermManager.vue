<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'

// Terms are the operational sub-records under an academic year. The parent
// page owns the writes so we can preserve RBAC and keep lifecycle syncing
// aligned with the rest of Preschool settings.
defineOptions({
  name: 'PreschoolTermManager',
})

const { t } = useLanguage()

defineProps({
  terms: {
    type: Array,
    default: () => [],
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

const emit = defineEmits(['open-add', 'open-edit', 'activate', 'close'])

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

function statusClass(status, isCurrent) {
  if (isCurrent) return 'bg-emerald-100 text-emerald-700'
  switch (String(status || 'active').toLowerCase()) {
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
    :eyebrow="t('preschoolLifecyclePage.sections.terms.eyebrow')"
    :title="t('preschoolLifecyclePage.sections.terms.title')"
    :subtitle="t('preschoolLifecyclePage.sections.terms.subtitle')"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-500">
        {{ t('preschoolLifecyclePage.sections.terms.description') }}
      </p>
      <Button variant="primary" :disabled="loading || saving" @click="emit('open-add')">
        {{ t('preschoolLifecyclePage.actions.addTerm') }}
      </Button>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <article
        v-for="(term, index) in terms"
        :key="term.id || `${term.code}-${index}`"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="text-base font-semibold text-slate-900">{{ term.name }}</h4>
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {{ term.code }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ term.academicYearLabel || term.academicYearCode }} · {{ formatDate(term.startDate) }} - {{ formatDate(term.endDate) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass(term.status, term.isCurrent)">
              {{ term.isCurrent ? t('preschoolLifecyclePage.status.current') : t(`preschoolLifecyclePage.status.${term.status || 'active'}`) }}
            </span>
            <span class="text-xs text-slate-500">
              {{ t('preschoolLifecyclePage.labels.sortOrder', { value: term.sortOrder }) }}
            </span>
          </div>
        </div>

        <p v-if="term.notes" class="mt-3 text-sm text-slate-600">
          {{ term.notes }}
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" :disabled="saving" @click="emit('open-edit', index)">
            {{ t('preschoolLifecyclePage.actions.edit') }}
          </Button>
          <Button variant="ghost" :disabled="saving || term.isCurrent" @click="emit('activate', index)">
            {{ t('preschoolLifecyclePage.actions.activate') }}
          </Button>
          <Button variant="ghost" :disabled="saving || term.status === 'closed'" @click="emit('close', index)">
            {{ t('preschoolLifecyclePage.actions.close') }}
          </Button>
        </div>
      </article>

      <div v-if="!terms.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
        {{ t('preschoolLifecyclePage.emptyStates.terms') }}
      </div>
    </div>
  </PreschoolSettingsSectionCard>
</template>
